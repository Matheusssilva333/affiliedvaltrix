import os
import uuid
import json
import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='../dist')
CORS(app)

PORT = int(os.environ.get('PORT', 10000))
DB_FILE = os.path.join(os.path.dirname(__file__), 'db.json')
API_SECRET = os.environ.get('API_SECRET')

def init_db():
    if not os.path.exists(DB_FILE):
        initial_data = {
            "users": [],
            "affiliates": [],
            "sales": [],
            "withdrawals": [],
            "config": {
                "lastUpdate": datetime.datetime.now().isoformat()
            }
        }
        with open(DB_FILE, 'w') as f:
            json.dump(initial_data, f, indent=2)
        print('Local database initialized.')

def read_db():
    with open(DB_FILE, 'r') as f:
        return json.load(f)

def write_db(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        invite_code = data.get('invite_code')

        if not username or not invite_code:
            return jsonify({'error': 'Missing credentials'}), 400

        db = read_db()
        affiliate = next((a for a in db['affiliates'] if a['username'] == username), None)

        if not affiliate:
            affiliate = {
                'username': username,
                'invite_code': invite_code,
                'createdAt': datetime.datetime.now().isoformat()
            }
            db['affiliates'].append(affiliate)
            write_db(db)
        elif affiliate['invite_code'] != invite_code:
            return jsonify({'error': 'Invalid invite code'}), 401

        return jsonify({
            'success': True,
            'user': {
                'username': username,
                'avatarUrl': f'https://api.dicebear.com/7.x/avataaars/svg?seed={username}'
            }
        })
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/affiliate/<username>', methods=['GET'])
def get_affiliate(username):
    try:
        db = read_db()
        
        user_sales = [s for s in db['sales'] if s.get('code') == username and s.get('status') == 'confirmed']
        sales_count = len(user_sales)
        total_earnings = sum(float(s.get('item_price', 0)) * 0.1 for s in user_sales)
        
        affiliates_map = {}
        for s in db['sales']:
            if s.get('status') == 'confirmed':
                code = s.get('code')
                if code not in affiliates_map:
                    affiliates_map[code] = 0
                affiliates_map[code] += float(s.get('item_price', 0)) * 0.1
        
        top_affiliates = []
        for u, comm in affiliates_map.items():
            top_affiliates.append({
                'username': u,
                'commission': f'R$ {comm:,.2f}'.replace('.', 'v').replace(',', '.').replace('v', ','),
                'avatarUrl': f'https://api.dicebear.com/7.x/avataaars/svg?seed={u}'
            })
        
        top_affiliates.sort(key=lambda x: float(x['commission'].replace('R$ ', '').replace('.', '').replace(',', '.')), reverse=True)
        
        for idx, aff in enumerate(top_affiliates):
            aff['rank'] = idx + 1
        
        top_affiliates = top_affiliates[:5]
        
        withdrawals = [w for w in db.get('withdrawals', []) if w.get('username') == username]
        
        if not top_affiliates:
            top_affiliates = [
                { 'rank': 1, 'username': 'metildes_xpt', 'avatarUrl': 'https://api.dicebear.com/7.x/avataaars/svg?seed=metildes', 'commission': 'R$ 55,74' },
                { 'rank': 2, 'username': 'i0v3r', 'avatarUrl': 'https://api.dicebear.com/7.x/avataaars/svg?seed=i0v3r', 'commission': 'R$ 38,20' }
            ]
            
        if not withdrawals:
             withdrawals = [
                { 'id': '1', 'date': '30 de mar', 'amount': 'R$ 25,80', 'status': 'approved', 'pixKey': '***.456.***-89', 'recipient': username }
            ]

        return jsonify({
            'stats': {
                'clicks': sales_count * 3 + 12,
                'sales': sales_count,
                'earnings': f'R$ {total_earnings:,.2f}'.replace('.', 'v').replace(',', '.').replace('v', ','),
                'available': f'R$ {total_earnings:,.2f}'.replace('.', 'v').replace(',', '.').replace('v', ',')
            },
            'ranking': top_affiliates,
            'withdrawals': withdrawals
        })
    except Exception as e:
        print(f"Affiliate error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/db', methods=['GET'])
def get_db():
    key = request.headers.get('x-api-secret')
    if key != API_SECRET:
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        return jsonify(read_db())
    except Exception as e:
        return jsonify({'error': 'Failed to read database'}), 500

@app.route('/api/save', methods=['POST'])
def save_db():
    key = request.headers.get('x-api-secret')
    if key != API_SECRET:
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        data = request.json
        collection = data.get('collection')
        item_data = data.get('data')
        
        db = read_db()
        if collection not in db:
            db[collection] = []
            
        new_item = {
            **item_data,
            'id': str(uuid.uuid4()),
            'createdAt': datetime.datetime.now().isoformat()
        }
        db[collection].append(new_item)
        write_db(db)
        
        return jsonify({'success': True, 'item': new_item})
    except Exception as e:
        return jsonify({'error': 'Failed to save to database'}), 500

@app.route('/api/affiliate', methods=['POST'])
def affiliate_action():
    key = request.headers.get('x-api-secret')
    if key != API_SECRET:
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        data = request.json
        action = data.get('action')
        
        db = read_db()
        
        if action == 'create_session':
            new_token = f"local_session_{uuid.uuid4()}"
            db['sales'].append({
                'token': new_token,
                'code': data.get('code'),
                'item_id': data.get('item_id'),
                'item_name': data.get('item_name'),
                'item_price': data.get('item_price'),
                'status': 'pending',
                'createdAt': datetime.datetime.now().isoformat()
            })
            write_db(db)
            return jsonify({'token': new_token})
            
        if action == 'confirm_purchase':
            token = data.get('token')
            buyer_uid = data.get('buyer_uid')
            
            for sale in db['sales']:
                if sale.get('token') == token:
                    sale['status'] = 'confirmed'
                    sale['buyer_uid'] = buyer_uid
                    sale['confirmedAt'] = datetime.datetime.now().isoformat()
                    write_db(db)
                    commission = float(sale.get('item_price', 0)) * 0.1
                    return jsonify({'ok': True, 'commission': f"{commission:.2f}"})
            return jsonify({'ok': False, 'reason': 'Session not found'}), 404
            
        return jsonify({'error': 'Invalid action'}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/proxy', methods=['GET'])
def proxy():
    try:
        target_url = request.args.get('url')
        if not target_url:
            return jsonify({'error': 'Missing url parameter'}), 400
            
        response = requests.get(target_url)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': 'Failed to fetch from Roblox API'}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=PORT)

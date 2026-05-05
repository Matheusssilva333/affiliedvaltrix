import os
import uuid
import json
import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import mercadopago
from dotenv import load_dotenv

load_dotenv()

# Configure static folder with absolute path
STATIC_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../dist')
app = Flask(__name__, static_folder=STATIC_FOLDER)
CORS(app)

# Mercado Pago Configuration
MP_ACCESS_TOKEN = os.environ.get('MERCADOPAGO_ACCESS_TOKEN')
sdk = mercadopago.SDK(MP_ACCESS_TOKEN) if MP_ACCESS_TOKEN else None

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
        now = datetime.datetime.now()
        seven_days_ago = now - datetime.timedelta(days=7)
        
        user_sales = [s for s in db['sales'] if s.get('code') == username and s.get('status') == 'confirmed']
        sales_count = len(user_sales)
        
        total_earnings = 0
        available_balance = 0
        
        for s in user_sales:
            price = float(s.get('item_price', 0))
            commission = price * 0.1
            total_earnings += commission
            
            confirmed_at_str = s.get('confirmedAt')
            if confirmed_at_str:
                confirmed_at = datetime.datetime.fromisoformat(confirmed_at_str)
                if confirmed_at <= seven_days_ago:
                    available_balance += commission
        
        # Calculate withdrawals already made
        user_withdrawals = [w for w in db.get('withdrawals', []) if w.get('username') == username and w.get('status') != 'rejected']
        withdrawn_amount = sum(float(w.get('amount', 'R$ 0').replace('R$ ', '').replace(',', '.')) for w in user_withdrawals)
        
        available_balance = max(0, available_balance - withdrawn_amount)

        # Real clicks tracking
        clicks_count = len([c for c in db.get('clicks', []) if c.get('code') == username])
        
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
        
        withdrawals_history = [w for w in db.get('withdrawals', []) if w.get('username') == username]
        
        if not top_affiliates:
            top_affiliates = [
                { 'rank': 1, 'username': 'metildes_xpt', 'avatarUrl': 'https://api.dicebear.com/7.x/avataaars/svg?seed=metildes', 'commission': 'R$ 55,74' },
                { 'rank': 2, 'username': 'i0v3r', 'avatarUrl': 'https://api.dicebear.com/7.x/avataaars/svg?seed=i0v3r', 'commission': 'R$ 38,20' }
            ]

        return jsonify({
            'stats': {
                'clicks': clicks_count if clicks_count > 0 else sales_count * 3 + 12,
                'sales': sales_count,
                'earnings': f'R$ {total_earnings:,.2f}'.replace('.', 'v').replace(',', '.').replace('v', ','),
                'available': f'R$ {available_balance:,.2f}'.replace('.', 'v').replace(',', '.').replace('v', ',')
            },
            'ranking': top_affiliates,
            'withdrawals': withdrawals_history
        })
    except Exception as e:
        print(f"Affiliate error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/withdrawal', methods=['POST'])
def request_withdrawal():
    try:
        data = request.json
        username = data.get('username')
        amount_str = data.get('amount')
        pix_key = data.get('pixKey')
        recipient = data.get('recipient')
        
        if not username or not amount_str or not pix_key:
            return jsonify({'error': 'Missing data'}), 400
            
        db = read_db()
        if 'withdrawals' not in db:
            db['withdrawals'] = []
            
        new_withdrawal = {
            'id': str(uuid.uuid4()),
            'username': username,
            'amount': f"R$ {float(amount_str):.2f}".replace('.', ','),
            'pixKey': pix_key,
            'recipient': recipient,
            'status': 'pending',
            'date': datetime.datetime.now().strftime('%d de %b').lower(),
            'createdAt': datetime.datetime.now().isoformat()
        }
        
        db['withdrawals'].insert(0, new_withdrawal)
        write_db(db)
        
        return jsonify({'success': True, 'withdrawal': new_withdrawal})
    except Exception as e:
        print(f"Withdrawal error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/click', methods=['POST'])
def register_click():
    try:
        data = request.json
        code = data.get('code')
        if not code:
            return jsonify({'error': 'Missing code'}), 400
            
        db = read_db()
        if 'clicks' not in db:
            db['clicks'] = []
            
        db['clicks'].append({
            'code': code,
            'ip': request.remote_addr,
            'timestamp': datetime.datetime.now().isoformat()
        })
        write_db(db)
        return jsonify({'success': True})
    except Exception as e:
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

@app.route('/api/checkout', methods=['POST'])
def create_checkout():
    if not sdk:
        return jsonify({'error': 'Mercado Pago SDK not configured'}), 500
    try:
        data = request.json
        item_id = data.get('item_id')
        item_name = data.get('item_name')
        item_price = float(data.get('item_price'))
        affiliate_code = data.get('affiliate_code')

        if not item_id or not item_price:
            return jsonify({'error': 'Missing item data'}), 400

        # Create Preference
        preference_data = {
            "items": [
                {
                    "id": item_id,
                    "title": item_name,
                    "quantity": 1,
                    "unit_price": item_price,
                    "currency_id": "BRL"
                }
            ],
            "external_reference": json.dumps({
                "affiliate_code": affiliate_code,
                "item_id": item_id
            }),
            "notification_url": f"{request.host_url}api/webhook/mp",
            "back_urls": {
                "success": f"{request.host_url}success",
                "failure": f"{request.host_url}failure",
                "pending": f"{request.host_url}pending"
            },
            "auto_return": "approved"
        }

        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]

        # Save pending sale
        db = read_db()
        db['sales'].append({
            'id': preference['id'],
            'token': f"mp_{preference['id']}",
            'code': affiliate_code,
            'item_id': item_id,
            'item_name': item_name,
            'item_price': item_price,
            'status': 'pending',
            'createdAt': datetime.datetime.now().isoformat()
        })
        write_db(db)

        return jsonify({
            'id': preference['id'],
            'init_point': preference['init_point'] # Link para pagamento
        })
    except Exception as e:
        print(f"Checkout error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/webhook/mp', methods=['POST'])
def mercadopago_webhook():
    if not sdk:
        return jsonify({'error': 'Not configured'}), 500
    try:
        # Get notification data
        data = request.args
        topic = data.get('topic') or request.json.get('type')
        id = data.get('id') or request.json.get('data', {}).get('id')

        if topic == 'payment':
            payment_info_response = sdk.payment().get(id)
            payment_info = payment_info_response["response"]
            
            status = payment_info.get('status')
            external_reference = json.loads(payment_info.get('external_reference', '{}'))
            
            if status == 'approved':
                db = read_db()
                # Find pending sale
                for sale in db['sales']:
                    # Match by id or external reference
                    if sale.get('item_id') == external_reference.get('item_id') and \
                       sale.get('code') == external_reference.get('affiliate_code') and \
                       sale.get('status') == 'pending':
                        
                        sale['status'] = 'confirmed'
                        sale['payment_id'] = id
                        sale['confirmedAt'] = datetime.datetime.now().isoformat()
                        write_db(db)
                        break
        
        return jsonify({'status': 'ok'}), 200
    except Exception as e:
        print(f"Webhook error: {e}")
        return jsonify({'error': str(e)}), 500

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
    # Try to serve requested static file
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    # Fallback to index.html for SPA routing
    index_path = os.path.join(app.static_folder, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(app.static_folder, 'index.html')
    else:
        return f"Static files not found at {app.static_folder}. Please ensure the build is complete.", 404

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=PORT)

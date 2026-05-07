import os
import uuid
import json
import datetime
import time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import mercadopago
from dotenv import load_dotenv

load_dotenv()

# Configure static folder with absolute path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_FOLDER = os.path.abspath(os.path.join(BASE_DIR, '../dist'))
if not os.path.exists(STATIC_FOLDER):
    STATIC_FOLDER = os.path.abspath(os.path.join(BASE_DIR, 'dist'))

app = Flask(__name__, static_folder=STATIC_FOLDER)
CORS(app)

# Mercado Pago Configuration
MP_ACCESS_TOKEN = os.environ.get('MERCADOPAGO_ACCESS_TOKEN')
sdk = mercadopago.SDK(MP_ACCESS_TOKEN) if MP_ACCESS_TOKEN else None

PORT = int(os.environ.get('PORT', 10000))
DB_FILE = os.path.join(os.path.dirname(__file__), 'db.json')
API_SECRET = os.environ.get('API_SECRET')

# Curated list of real Roblox items for the store (Asset IDs)
STORE_ITEM_IDS = [
    138992311, # Korblox Deathspeaker
    233018029, # Super Super Happy Face
    21070012,  # Dominus Empyreus
    439945661, # Valkyrie Helm
    1029025,   # Federation Conqueror
    1365767    # Headless Horseman
]

def init_db():
    if not os.path.exists(DB_FILE):
        initial_data = {
            "users": [],
            "affiliates": [],
            "sales": [],
            "clicks": [],
            "withdrawals": [],
            "config": {
                "commission_rate": 0.10, # 10% profit for affiliate
                "lastUpdate": datetime.datetime.now().isoformat()
            }
        }
        with open(DB_FILE, 'w') as f:
            json.dump(initial_data, f, indent=2)
        print('Local database initialized.')

def read_db():
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except:
        init_db()
        with open(DB_FILE, 'r') as f:
            return json.load(f)

def write_db(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def get_roblox_user_id(username):
    try:
        user_resp = requests.post("https://users.roblox.com/v1/usernames/users", json={"usernames": [username]}, timeout=5).json()
        data = user_resp.get("data", [])
        if data:
            return data[0].get("id")
    except Exception as e:
        print(f"Error fetching Roblox user id for {username}: {e}")
    return None

def get_roblox_avatar(user_id, username):
    if not user_id:
        return f'https://api.dicebear.com/7.x/avataaars/svg?seed={username}'
    try:
        thumb_resp = requests.get(f"https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds={user_id}&size=150x150&format=Png", timeout=5).json()
        thumb_data = thumb_resp.get("data", [])
        if thumb_data:
            return thumb_data[0].get("imageUrl")
    except Exception as e:
        print(f"Error fetching Roblox avatar for {user_id}: {e}")
    return f'https://api.dicebear.com/7.x/avataaars/svg?seed={username}'

def get_roblox_item_details(item_ids):
    if not item_ids:
        return []
    try:
        # Fetch basic details (name, description)
        details_resp = requests.post("https://catalog.roblox.com/v1/catalog/items/details", json={
            "items": [{"itemType": "Asset", "id": i} for i in item_ids]
        }, timeout=5).json()
        
        items_data = details_resp.get("data", [])
        
        # Fetch thumbnails
        ids_str = ",".join([str(i) for i in item_ids])
        thumb_resp = requests.get(f"https://thumbnails.roblox.com/v1/assets?assetIds={ids_str}&size=150x150&format=Png", timeout=5).json()
        thumb_data = {str(t['targetId']): t['imageUrl'] for t in thumb_resp.get("data", [])}
        
        # Enrich data
        enriched_items = []
        for item in items_data:
            asset_id = str(item.get("id"))
            # In a real scenario, the R$ price might be converted to BRL
            # For this demo, we'll assign a symbolic BRL price based on their rarity
            # 1 Robux ≈ R$ 0.05 (approximate value for profit calculation)
            robux_price = item.get("price", 1000)
            brl_price = max(10.0, float(robux_price) * 0.05)
            
            enriched_items.append({
                "id": asset_id,
                "name": item.get("name"),
                "description": item.get("description"),
                "price": brl_price,
                "price_formatted": f"R$ {brl_price:,.2f}".replace('.', 'v').replace(',', '.').replace('v', ','),
                "image": thumb_data.get(asset_id),
                "robux_price": robux_price
            })
        return enriched_items
    except Exception as e:
        print(f"Error fetching Roblox item details: {e}")
        return []

def get_roblox_item_thumbnails(item_ids):
    if not item_ids:
        return {}
    try:
        ids_str = ",".join([str(i) for i in item_ids])
        resp = requests.get(f"https://thumbnails.roblox.com/v1/assets?assetIds={ids_str}&returnPolicy=PlaceHolder&size=150x150&format=Png", timeout=5).json()
        data = resp.get("data", [])
        return {str(item.get("targetId")): item.get("imageUrl") for item in data}
    except Exception as e:
        print(f"Error fetching Roblox item thumbnails: {e}")
    return {}

@app.route('/api/products', methods=['GET'])
def get_products():
    items = get_roblox_item_details(STORE_ITEM_IDS)
    return jsonify(items)

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')

        if not username:
            return jsonify({'error': 'Missing username'}), 400

        db = read_db()
        affiliate = next((a for a in db['affiliates'] if a['username'].lower() == username.lower()), None)

        if not affiliate:
            affiliate = {
                'username': username,
                'createdAt': datetime.datetime.now().isoformat()
            }
            db['affiliates'].append(affiliate)
            write_db(db)

        user_id = get_roblox_user_id(username)
        avatar_url = get_roblox_avatar(user_id, username)

        return jsonify({
            'success': True,
            'user': {
                'username': username,
                'avatarUrl': avatar_url
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
        
        commission_rate = db.get('config', {}).get('commission_rate', 0.10)
        
        user_sales = [s for s in db['sales'] if s.get('code', '').lower() == username.lower() and s.get('status') == 'confirmed']
        sales_count = len(user_sales)
        
        total_earnings = 0
        available_balance = 0
        
        for s in user_sales:
            price = float(s.get('item_price', 0))
            commission = price * commission_rate
            total_earnings += commission
            
            confirmed_at_str = s.get('confirmedAt')
            if confirmed_at_str:
                confirmed_at = datetime.datetime.fromisoformat(confirmed_at_str)
                if confirmed_at <= seven_days_ago:
                    available_balance += commission
        
        # Calculate withdrawals already made
        user_withdrawals = [w for w in db.get('withdrawals', []) if w.get('username').lower() == username.lower() and w.get('status') != 'rejected']
        withdrawn_amount = 0
        for w in user_withdrawals:
            try:
                amt = float(w.get('amount', 'R$ 0').replace('R$ ', '').replace('.', '').replace(',', '.'))
                withdrawn_amount += amt
            except:
                pass
        
        available_balance = max(0, available_balance - withdrawn_amount)

        # Real clicks tracking
        clicks_count = len([c for c in db.get('clicks', []) if c.get('code', '').lower() == username.lower()])
        
        affiliates_map = {}
        for s in db['sales']:
            if s.get('status') == 'confirmed':
                code = s.get('code')
                if not code: continue
                if code not in affiliates_map:
                    affiliates_map[code] = 0
                affiliates_map[code] += float(s.get('item_price', 0)) * commission_rate
        
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
        
        withdrawals_history = [w for w in db.get('withdrawals', []) if w.get('username').lower() == username.lower()]
        
        # Compute sold_items
        sold_items_map = {}
        for s in user_sales:
            item_id = s.get('item_id')
            if item_id not in sold_items_map:
                sold_items_map[item_id] = {
                    'id': str(item_id),
                    'name': s.get('item_name', 'Item'),
                    'price': f"R$ {float(s.get('item_price', 0)):.2f}".replace('.', ','),
                    'salesCount': 0
                }
            sold_items_map[item_id]['salesCount'] += 1
            
        sold_items = list(sold_items_map.values())
        sold_items.sort(key=lambda x: x['salesCount'], reverse=True)
        
        # Compute popular_items (all confirmed sales across platform)
        popular_items_map = {}
        all_confirmed_sales = [s for s in db['sales'] if s.get('status') == 'confirmed']
        for s in all_confirmed_sales:
            item_id = s.get('item_id')
            if item_id not in popular_items_map:
                popular_items_map[item_id] = {
                    'id': str(item_id),
                    'name': s.get('item_name', 'Item'),
                    'price': f"R$ {float(s.get('item_price', 0)):.2f}".replace('.', ','),
                    'salesCount': 0
                }
            popular_items_map[item_id]['salesCount'] += 1
            
        popular_items = list(popular_items_map.values())
        popular_items.sort(key=lambda x: x['salesCount'], reverse=True)
        
        # Fetch item thumbnails
        item_ids_to_fetch = list(set([i['id'] for i in sold_items] + [i['id'] for i in popular_items]))
        thumbnails = get_roblox_item_thumbnails(item_ids_to_fetch)
        
        for item in sold_items:
            item['image'] = thumbnails.get(item['id'], f"https://api.dicebear.com/7.x/shapes/svg?seed={item['id']}")
            
        for item in popular_items:
            item['image'] = thumbnails.get(item['id'], f"https://api.dicebear.com/7.x/shapes/svg?seed={item['id']}")

        # Fetch top affiliates avatars
        usernames_to_fetch = [aff['username'] for aff in top_affiliates]
        if usernames_to_fetch:
            try:
                user_resp = requests.post("https://users.roblox.com/v1/usernames/users", json={"usernames": usernames_to_fetch}, timeout=5).json()
                data = user_resp.get("data", [])
                user_id_map = {item['name'].lower(): item['id'] for item in data}
                user_ids = list(user_id_map.values())
                
                if user_ids:
                    ids_str = ",".join([str(i) for i in user_ids])
                    thumb_resp = requests.get(f"https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds={ids_str}&size=150x150&format=Png", timeout=5).json()
                    thumb_data = thumb_resp.get("data", [])
                    thumb_map = {item['targetId']: item['imageUrl'] for item in thumb_data}
                    
                    for aff in top_affiliates:
                        uid = user_id_map.get(aff['username'].lower())
                        if uid and uid in thumb_map:
                            aff['avatarUrl'] = thumb_map[uid]
            except Exception as e:
                print(f"Error fetching top affiliates avatars: {e}")

        # Compute performance chart data (last 30 days)
        performance_map = {}
        for i in range(30):
            d = (now - datetime.timedelta(days=i)).strftime('%Y-%m-%d')
            performance_map[d] = {'earnings': 0, 'clicks': 0}
            
        for s in user_sales:
            d = datetime.datetime.fromisoformat(s['confirmedAt']).strftime('%Y-%m-%d')
            if d in performance_map:
                performance_map[d]['earnings'] += float(s.get('item_price', 0)) * commission_rate
        
        for c in db.get('clicks', []):
            if c.get('code', '').lower() == username.lower():
                d = datetime.datetime.fromisoformat(c['timestamp']).strftime('%Y-%m-%d')
                if d in performance_map:
                    performance_map[d]['clicks'] += 1
                    
        performance_data = []
        for d, vals in sorted(performance_map.items()):
            performance_data.append({
                'name': d,
                'earnings': vals['earnings'],
                'clicks': vals['clicks']
            })

        return jsonify({
            'stats': {
                'clicks': clicks_count,
                'sales': sales_count,
                'earnings': f'R$ {total_earnings:,.2f}'.replace('.', 'v').replace(',', '.').replace('v', ','),
                'available': f'R$ {available_balance:,.2f}'.replace('.', 'v').replace(',', '.').replace('v', ',')
            },
            'ranking': top_affiliates,
            'performance': performance_data,
            'withdrawals': withdrawals_history,
            'sold_items': sold_items,
            'popular_items': popular_items
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
            
        # Check if affiliate exists
        affiliate_exists = any(a['username'].lower() == code.lower() for a in db['affiliates'])
        if not affiliate_exists:
            # Maybe auto-create or just ignore. Here we auto-create if it looks like a valid username
            db['affiliates'].append({
                'username': code,
                'createdAt': datetime.datetime.now().isoformat()
            })
            
        db['clicks'].append({
            'code': code,
            'ip': request.remote_addr,
            'timestamp': datetime.datetime.now().isoformat()
        })
        write_db(db)
        return jsonify({'success': True})
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
                    "id": str(item_id),
                    "title": item_name,
                    "quantity": 1,
                    "unit_price": item_price,
                    "currency_id": "BRL"
                }
            ],
            "external_reference": json.dumps({
                "affiliate_code": affiliate_code,
                "item_id": str(item_id)
            }),
            "notification_url": f"{request.host_url}api/webhook/mp",
            "back_urls": {
                "success": f"{request.host_url}#success",
                "failure": f"{request.host_url}#failure",
                "pending": f"{request.host_url}#pending"
            },
            "auto_return": "approved"
        }

        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]

        # Save pending sale
        db = read_db()
        db['sales'].append({
            'id': preference['id'],
            'payment_id': None,
            'code': affiliate_code,
            'item_id': str(item_id),
            'item_name': item_name,
            'item_price': item_price,
            'status': 'pending',
            'createdAt': datetime.datetime.now().isoformat()
        })
        write_db(db)

        return jsonify({
            'id': preference['id'],
            'init_point': preference['init_point']
        })
    except Exception as e:
        print(f"Checkout error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/webhook/mp', methods=['POST'])
def mercadopago_webhook():
    if not sdk:
        return jsonify({'error': 'Not configured'}), 500
    try:
        data = request.args
        topic = data.get('topic') or request.json.get('type')
        resource_id = data.get('id') or request.json.get('data', {}).get('id')

        if topic == 'payment':
            payment_info_response = sdk.payment().get(resource_id)
            payment_info = payment_info_response["response"]
            
            status = payment_info.get('status')
            ext_ref_str = payment_info.get('external_reference', '{}')
            
            try:
                external_reference = json.loads(ext_ref_str)
            except:
                external_reference = {}
            
            if status == 'approved':
                db = read_db()
                # Find pending sale and confirm it
                updated = False
                for sale in db['sales']:
                    if sale.get('status') == 'pending':
                        # Match by item_id and affiliate_code from external_reference
                        if str(sale.get('item_id')) == str(external_reference.get('item_id')) and \
                           str(sale.get('code', '')).lower() == str(external_reference.get('affiliate_code', '')).lower():
                            
                            sale['status'] = 'confirmed'
                            sale['payment_id'] = resource_id
                            sale['confirmedAt'] = datetime.datetime.now().isoformat()
                            updated = True
                            break
                
                if updated:
                    write_db(db)
        
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
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    index_path = os.path.join(app.static_folder, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(app.static_folder, 'index.html')
    else:
        return f"Static files not found at {app.static_folder}", 404

init_db()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)

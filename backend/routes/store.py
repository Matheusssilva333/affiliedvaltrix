from flask import Blueprint, jsonify, request, current_app
from ..services.roblox import get_roblox_item_details
from ..services.mercadopago import create_preference, get_payment
from ..models.user import User
from ..models.sale import Sale
from ..app import db
import json
import datetime

store_bp = Blueprint('store', __name__)

STORE_ITEM_IDS = [
    138992311, 233018029, 21070012, 439945661, 1029025, 1365767
]

@store_bp.route('/products', methods=['GET'])
def get_products():
    items = get_roblox_item_details(STORE_ITEM_IDS)
    return jsonify(items)

@store_bp.route('/checkout', methods=['POST'])
def checkout():
    data = request.json
    item_id = data.get('item_id')
    item_name = data.get('item_name')
    item_price = data.get('item_price')
    affiliate_username = data.get('affiliate_code') # This is the username from the URL ?ref=...

    affiliate = None
    if affiliate_username:
        affiliate = User.query.filter_by(username=affiliate_username).first()

    affiliate_id = affiliate.id if affiliate else None
    
    # Use current_app.config['BASE_URL'] or request.host_url
    host_url = current_app.config.get('BASE_URL', request.host_url).rstrip('/')
    
    # Save pending sale
    new_sale = Sale(
        affiliate_id=affiliate_id,
        item_id=str(item_id),
        item_name=item_name,
        item_price=float(item_price),
        commission_amount=float(item_price) * current_app.config.get('COMMISSION_RATE', 0.1),
        status='pending'
    )
    db.session.add(new_sale)
    db.session.commit() # Get ID
    
    preference = create_preference(item_id, item_name, item_price, affiliate_id, host_url, new_sale.id)
    
    if not preference:
        db.session.delete(new_sale)
        db.session.commit()
        return jsonify({"error": "Failed to create payment preference"}), 500

    new_sale.preference_id = preference['id']
    db.session.commit()

    return jsonify({
        "id": preference['id'],
        "init_point": preference['init_point']
    })

@store_bp.route('/webhook', methods=['POST'])
def webhook():
    # Mercado Pago Webhook
    data = request.args
    topic = data.get('topic') or request.json.get('type')
    resource_id = data.get('id') or request.json.get('data', {}).get('id')

    if topic == 'payment':
        payment_info = get_payment(resource_id)
        if not payment_info:
            return jsonify({"msg": "Payment info not found"}), 404
            
        status = payment_info.get('status')
        ext_ref_str = payment_info.get('external_reference', '{}')
        
        try:
            external_reference = json.loads(ext_ref_str)
        except:
            external_reference = {}
            
        if status == 'approved':
            # Use Sale ID from external_reference for lookup
            sale_id = external_reference.get('sale_id')
            sale = Sale.query.get(sale_id)
            
            if sale and sale.status == 'pending':
                sale.status = 'confirmed'
                sale.payment_id = str(resource_id)
                sale.confirmed_at = datetime.datetime.now()
                
                # Credit affiliate balance with lock
                if sale.affiliate:
                    # Lock user for update
                    user = User.query.filter_by(id=sale.affiliate_id).with_for_update().first()
                    user.balance += sale.commission_amount
                    user.total_earnings += sale.commission_amount
                
                db.session.commit()
    
    return jsonify({"status": "ok"}), 200

@store_bp.route('/proxy', methods=['GET'])
def proxy():
    try:
        import requests
        target_url = request.args.get('url')
        if not target_url:
            return jsonify({'error': 'Missing url parameter'}), 400
            
        response = requests.get(target_url, timeout=5)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': 'Failed to fetch from Roblox API'}), 500

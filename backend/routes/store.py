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
    data = request.json or {}
    item_id = data.get('item_id')
    affiliate_username = data.get('affiliate_code')

    if not item_id:
        return jsonify({"error": "Missing item_id"}), 400

    try:
        item_id = int(item_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid item_id"}), 400

    item_details = get_roblox_item_details([item_id])
    if not item_details:
        return jsonify({"error": "Item not found"}), 404

    item = item_details[0]
    item_name = item.get('name', f'Roblox Item {item_id}')
    item_price = float(item.get('price', 0))

    if item_price <= 0:
        return jsonify({"error": "Invalid item price"}), 500

    affiliate = None
    if affiliate_username:
        affiliate = User.query.filter_by(username=affiliate_username).first()

    affiliate_id = affiliate.id if affiliate else None
    host_url = current_app.config.get('BASE_URL', request.host_url).rstrip('/')

    new_sale = Sale(
        affiliate_id=affiliate_id,
        item_id=str(item_id),
        item_name=item_name,
        item_price=item_price,
        commission_amount=item_price * current_app.config.get('COMMISSION_RATE', 0.1),
        status='pending'
    )
    db.session.add(new_sale)
    db.session.commit()

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
    data = request.args
    topic = data.get('topic') or (request.json or {}).get('type')
    resource_id = data.get('id') or (request.json or {}).get('data', {}).get('id')

    if topic == 'payment':
        payment_info = get_payment(resource_id)
        if not payment_info:
            return jsonify({"msg": "Payment info not found"}), 404

        status = payment_info.get('status')
        ext_ref_str = payment_info.get('external_reference', '{}')

        try:
            external_reference = json.loads(ext_ref_str)
        except Exception:
            external_reference = {}

        if status == 'approved':
            sale_id = external_reference.get('sale_id')
            sale = Sale.query.get(sale_id)

            if sale and sale.status == 'pending':
                sale.status = 'confirmed'
                sale.payment_id = str(resource_id)
                sale.confirmed_at = datetime.datetime.now()

                if sale.affiliate:
                    user = User.query.filter_by(id=sale.affiliate_id).with_for_update().first()
                    if user:
                        user.balance += sale.commission_amount
                        user.total_earnings += sale.commission_amount

                db.session.commit()

    return jsonify({"status": "ok"}), 200

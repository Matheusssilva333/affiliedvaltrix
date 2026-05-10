from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User
from ..models.transaction import Transaction
from ..models.withdraw_request import WithdrawRequest
from ..app import db
from ..services.roblox import get_roblox_item_thumbnails
from ..utils.validators import sanitize_input, validate_pix_key
import datetime

affiliate_bp = Blueprint('affiliate', __name__)

@affiliate_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    from ..models.sale import Sale
    from ..models.click import Click
    
    confirmed_sales = Sale.query.filter_by(affiliate_id=user_id, status='confirmed').all()
    total_clicks = Click.query.filter_by(affiliate_id=user_id).count()
    
    total_sales = len(confirmed_sales)
    total_earnings = sum(s.commission_amount for s in confirmed_sales)
    
    return jsonify({
        "stats": {
            "clicks": total_clicks,
            "sales": total_sales,
            "earnings": f"R$ {total_earnings:,.2f}".replace('.', 'v').replace(',', '.').replace('v', ','),
            "available": f"R$ {user.balance:,.2f}".replace('.', 'v').replace(',', '.').replace('v', ',')
        }
    })

@affiliate_bp.route('/withdraw', methods=['POST'])
@jwt_required()
def request_withdrawal():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.json
    
    amount = float(data.get('amount', 0))
    pix_key = sanitize_input(data.get('pix_key'))
    recipient = sanitize_input(data.get('recipient'))
    
    if amount <= 0 or amount > user.balance:
        return jsonify({"msg": "Invalid amount or insufficient balance"}), 400
        
    if not validate_pix_key(pix_key):
        return jsonify({"msg": "Invalid PIX key"}), 400
        
    try:
        # Atomic transaction with locking
        user = User.query.filter_by(id=user_id).with_for_update().first()
        
        if user.balance < amount:
             return jsonify({"msg": "Insufficient balance"}), 400

        user.balance -= amount
        
        req = WithdrawRequest(
            user_id=user_id,
            amount=amount,
            pix_key=pix_key,
            recipient_name=recipient,
            status='pending'
        )
        
        tx = Transaction(
            user_id=user_id,
            amount=-amount,
            type='withdrawal',
            description=f'Withdrawal to PIX: {pix_key}',
            status='pending'
        )
        
        db.session.add(req)
        db.session.add(tx)
        db.session.commit()
        
        return jsonify({"msg": "Withdrawal request submitted", "new_balance": user.balance}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Failed to process withdrawal", "error": str(e)}), 500

@affiliate_bp.route('/withdrawals', methods=['GET'])
@jwt_required()
def get_withdrawals():
    user_id = get_jwt_identity()
    history = WithdrawRequest.query.filter_by(user_id=user_id).order_by(WithdrawRequest.created_at.desc()).all()
    
    return jsonify([{
        "id": w.id,
        "amount": f"R$ {w.amount:,.2f}".replace('.', ','),
        "status": w.status,
        "date": w.created_at.strftime('%d de %b').lower()
    } for w in history])

@affiliate_bp.route('/click', methods=['POST'])
def register_click():
    from ..models.click import Click
    from ..models.user import User
    
    data = request.json
    code = sanitize_input(data.get('code'))
    if not code:
        return jsonify({'error': 'Missing code'}), 400
        
    affiliate = User.query.filter_by(username=code).first()
    if not affiliate:
        return jsonify({'error': 'Invalid code'}), 404
        
    click = Click(
        affiliate_id=affiliate.id,
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string
    )
    db.session.add(click)
    db.session.commit()
    
    return jsonify({'success': True})

from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User
from ..models.withdraw_request import WithdrawRequest
from ..models.sale import Sale
from ..services.pix import process_pix_withdrawal
from ..app import db
import datetime

admin_bp = Blueprint('admin', __name__)

def check_admin(user_id):
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        abort(403)
    return user

@admin_bp.route('/overview', methods=['GET'])
@jwt_required()
def overview():
    check_admin(get_jwt_identity())
    
    total_sales = db.session.query(db.func.sum(Sale.item_price)).filter_by(status='confirmed').scalar() or 0
    pending_withdrawals = WithdrawRequest.query.filter_by(status='pending').count()
    active_affiliates = User.query.filter_by(role='affiliate').count()
    
    return jsonify({
        "total_revenue": total_sales,
        "pending_withdrawals": pending_withdrawals,
        "active_affiliates": active_affiliates
    })

@admin_bp.route('/withdrawals/pending', methods=['GET'])
@jwt_required()
def pending_withdrawals():
    check_admin(get_jwt_identity())
    requests = WithdrawRequest.query.filter_by(status='pending').all()
    return jsonify([{
        "id": r.id,
        "username": r.user.username,
        "amount": r.amount,
        "pix_key": r.pix_key,
        "recipient": r.recipient_name,
        "created_at": r.created_at.isoformat()
    } for r in requests])

@admin_bp.route('/withdrawals/<int:req_id>/approve', methods=['POST'])
@jwt_required()
def approve_withdrawal(req_id):
    check_admin(get_jwt_identity())
    req = WithdrawRequest.query.get_or_404(req_id)
    
    if req.status != 'pending':
        return jsonify({"msg": "Request already processed"}), 400
        
    try:
        # Process PIX
        pix_result = process_pix_withdrawal(req.amount, req.pix_key, req.recipient_name, str(req.id))
        
        if pix_result['status'] == 'approved':
            req.status = 'paid'
            req.pix_tx_id = pix_result['id']
            req.processed_at = datetime.datetime.now()
            db.session.commit()
            return jsonify({"msg": "Withdrawal approved and paid", "pix_id": req.pix_tx_id})
        else:
            return jsonify({"msg": "PIX processing failed", "error": pix_result.get('message')}), 500
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Internal error", "error": str(e)}), 500

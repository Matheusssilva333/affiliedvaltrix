from ..app import db

class WithdrawRequest(db.Model):
    __tablename__ = "withdraw_requests"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    pix_key = db.Column(db.String(255), nullable=False)
    recipient_name = db.Column(db.String(255))
    status = db.Column(db.String(20), default='pending') # pending, approved, rejected, paid
    pix_tx_id = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=db.func.now())
    processed_at = db.Column(db.DateTime)

    user = db.relationship('User', backref=db.backref('withdraw_requests', lazy=True))

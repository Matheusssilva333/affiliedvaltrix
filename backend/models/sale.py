from ..app import db

class Sale(db.Model):
    __tablename__ = "sales"
    id = db.Column(db.Integer, primary_key=True)
    preference_id = db.Column(db.String(100), unique=True)
    affiliate_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    item_id = db.Column(db.String(50), nullable=False)
    item_name = db.Column(db.String(255))
    item_price = db.Column(db.Float, nullable=False)
    commission_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending') # pending, confirmed
    payment_id = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=db.func.now())
    confirmed_at = db.Column(db.DateTime)

    affiliate = db.relationship('User', backref=db.backref('sales', lazy=True))

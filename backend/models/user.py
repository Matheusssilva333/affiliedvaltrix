from ..app import db, bcrypt
import re

USERNAME_REGEX = re.compile(r'^[a-zA-Z0-9_]{3,30}$')

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(10), default='affiliate') # affiliate, admin
    balance = db.Column(db.Float, default=0.0)
    total_earnings = db.Column(db.Float, default=0.0)
    avatar_url = db.Column(db.String(256), default='')
    roblox_id = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    @staticmethod
    def validate_username(username):
        if not USERNAME_REGEX.fullmatch(username):
            return False
        return True

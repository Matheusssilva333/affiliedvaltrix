from backend.app import db

# Import models here to ensure they are registered with SQLAlchemy
from .user import User
from .transaction import Transaction
from .sale import Sale
from .withdraw_request import WithdrawRequest
from .click import Click

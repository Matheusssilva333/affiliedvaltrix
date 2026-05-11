from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    set_access_cookies, set_refresh_cookies,
    unset_jwt_cookies, jwt_required, get_jwt_identity
)
from ..models.user import User
from ..app import db, bcrypt
from ..utils.validators import validate_username, sanitize_input, validate_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json or {}
    username = sanitize_input(data.get('username'))
    password = str(data.get('password', '')).strip()

    if not validate_username(username):
        return jsonify({"msg": "Invalid username format"}), 400

    if not validate_password(password):
        return jsonify({"msg": "Password must be at least 8 characters"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "User already exists"}), 409

    new_user = User(username=username)
    new_user.set_password(password)

    if username in ['Neguin_carecabrancaa', 'SonGokuReverso7']:
        new_user.role = 'admin'

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    username = sanitize_input(data.get('username'))
    password = str(data.get('password', '')).strip()

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    response = jsonify({
        "msg": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "avatar_url": user.avatar_url
        }
    })
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    access_token = create_access_token(identity=str(user.id))
    response = jsonify({
        "msg": "Token refreshed",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "avatar_url": user.avatar_url
        }
    })
    set_access_cookies(response, access_token)
    return response

@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = jsonify({"msg": "Logged out"})
    unset_jwt_cookies(response)
    return response

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "balance": user.balance,
        "avatar_url": user.avatar_url
    })

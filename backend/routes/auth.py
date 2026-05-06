"""
Auth Routes - Login, logout, token refresh, and current user info.
"""

import bcrypt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from models import db, User

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT access token."""
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=data['username']).first()
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # Verify hashed password
    if not bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({"error": "Invalid credentials"}), 401

    # Create JWT with identity = user id and additional claims
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "username": user.username}
    )

    return jsonify({
        "access_token": access_token,
        "user": user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    """Return current authenticated user info."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change current user's password."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()

    if not bcrypt.checkpw(data['old_password'].encode(), user.password.encode()):
        return jsonify({"error": "Old password is incorrect"}), 400

    user.password = bcrypt.hashpw(
        data['new_password'].encode(), bcrypt.gensalt()
    ).decode('utf-8')
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200

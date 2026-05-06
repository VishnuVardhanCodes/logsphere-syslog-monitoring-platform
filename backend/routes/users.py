"""
Users Routes - User management for Super Admins.
CRUD operations on users with role-based access control.
"""

import bcrypt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, User

users_bp = Blueprint('users', __name__)


def _require_super_admin():
    """Helper to enforce Super Admin role."""
    claims = get_jwt()
    if claims.get('role') != 'Super Admin':
        return jsonify({"error": "Super Admin access required"}), 403
    return None


@users_bp.route('/', methods=['GET'])
@jwt_required()
def list_users():
    """Return all users. Super Admin only."""
    err = _require_super_admin()
    if err:
        return err

    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


@users_bp.route('/', methods=['POST'])
@jwt_required()
def create_user():
    """Create a new user. Super Admin only."""
    err = _require_super_admin()
    if err:
        return err

    data = request.get_json()
    required = ['username', 'email', 'password', 'role']
    if not all(data.get(f) for f in required):
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 409
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 409

    hashed = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt()).decode()
    user = User(
        username=data['username'],
        email=data['email'],
        password=hashed,
        role=data['role']
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created", "user": user.to_dict()}), 201


@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update a user's role or email. Super Admin only."""
    err = _require_super_admin()
    if err:
        return err

    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if 'role' in data:
        user.role = data['role']
    if 'email' in data:
        user.email = data['email']
    if 'password' in data and data['password']:
        user.password = bcrypt.hashpw(
            data['password'].encode(), bcrypt.gensalt()
        ).decode()

    db.session.commit()
    return jsonify({"message": "User updated", "user": user.to_dict()}), 200


@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete a user. Super Admin only."""
    err = _require_super_admin()
    if err:
        return err

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200

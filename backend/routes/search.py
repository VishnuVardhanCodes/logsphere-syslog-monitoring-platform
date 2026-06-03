"""
Search Routes - Global search across the application.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Log, Alert, User, Anomaly

search_bp = Blueprint('search', __name__)

@search_bp.route('/', methods=['GET'])
@jwt_required()
def global_search():
    """Search across devices, logs, alerts, and users."""
    q = request.args.get('q', '')
    if not q or len(q) < 2:
        return jsonify({"results": {"devices": [], "logs": [], "alerts": [], "users": []}}), 200

    q_like = f"%{q}%"

    # Search Logs
    logs = Log.query.filter(
        (Log.message.like(q_like)) | (Log.hostname.like(q_like)) | (Log.ip_address.like(q_like))
    ).limit(10).all()

    # Search Alerts
    alerts = Alert.query.filter(
        Alert.message.like(q_like)
    ).limit(10).all()

    # Search Users
    users = User.query.filter(
        (User.username.like(q_like)) | (User.email.like(q_like))
    ).limit(10).all()

    # Devices (from logs, approximation)
    devices = db.session.query(Log.hostname, Log.ip_address).filter(
        (Log.hostname.like(q_like)) | (Log.ip_address.like(q_like))
    ).distinct().limit(10).all()

    return jsonify({
        "results": {
            "devices": [{"hostname": d[0], "ip_address": d[1]} for d in devices],
            "logs": [l.to_dict() for l in logs],
            "alerts": [a.to_dict() for a in alerts],
            "users": [{"id": u.id, "username": u.username} for u in users]
        }
    }), 200

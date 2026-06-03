"""
Notifications Routes - Real-time notification management.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Notification
from sqlalchemy import desc

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    """Return recent notifications, unread first."""
    limit = int(request.args.get('limit', 20))
    notifications = Notification.query.order_by(
        Notification.is_read.asc(),
        desc(Notification.created_at)
    ).limit(limit).all()
    unread_count = Notification.query.filter_by(is_read=False).count()
    return jsonify({
        "notifications": [n.to_dict() for n in notifications],
        "unread_count": unread_count
    }), 200


@notifications_bp.route('/<int:notif_id>/read', methods=['PUT'])
@jwt_required()
def mark_read(notif_id):
    """Mark a notification as read."""
    notif = Notification.query.get_or_404(notif_id)
    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"}), 200


@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_read():
    """Mark all notifications as read."""
    Notification.query.filter_by(is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200


@notifications_bp.route('/', methods=['POST'])
@jwt_required()
def create_notification():
    """Create a notification (internal use)."""
    data = request.json
    notif = Notification(
        title=data.get('title', 'System Alert'),
        message=data['message'],
        type=data.get('type', 'info')
    )
    db.session.add(notif)
    db.session.commit()
    return jsonify(notif.to_dict()), 201

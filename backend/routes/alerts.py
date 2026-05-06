"""
Alerts Routes - Manage alert records and their status.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Alert
from sqlalchemy import desc

alerts_bp = Blueprint('alerts', __name__)


@alerts_bp.route('/', methods=['GET'])
@jwt_required()
def get_alerts():
    """Return all alerts with optional status filter, newest first."""
    status   = request.args.get('status')
    page     = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    query = Alert.query
    if status:
        query = query.filter(Alert.status == status)

    paginated = query.order_by(desc(Alert.created_at)).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        "alerts": [a.to_dict() for a in paginated.items],
        "total": paginated.total,
        "pages": paginated.pages
    }), 200


@alerts_bp.route('/<int:alert_id>/resolve', methods=['PUT'])
@jwt_required()
def resolve_alert(alert_id):
    """Mark a specific alert as resolved."""
    alert = Alert.query.get_or_404(alert_id)
    alert.status = 'resolved'
    db.session.commit()
    return jsonify({"message": "Alert resolved", "alert": alert.to_dict()}), 200


@alerts_bp.route('/<int:alert_id>', methods=['DELETE'])
@jwt_required()
def delete_alert(alert_id):
    """Delete a specific alert."""
    alert = Alert.query.get_or_404(alert_id)
    db.session.delete(alert)
    db.session.commit()
    return jsonify({"message": "Alert deleted"}), 200


@alerts_bp.route('/stats', methods=['GET'])
@jwt_required()
def alert_stats():
    """Return alert counts by severity and status."""
    from sqlalchemy import func
    by_severity = (
        db.session.query(Alert.severity, func.count(Alert.id))
        .group_by(Alert.severity).all()
    )
    active_count = Alert.query.filter_by(status='active').count()
    resolved_count = Alert.query.filter_by(status='resolved').count()

    return jsonify({
        "active": active_count,
        "resolved": resolved_count,
        "by_severity": {sev: cnt for sev, cnt in by_severity}
    }), 200

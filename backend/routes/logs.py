"""
Logs Routes - CRUD and filtering for syslog entries.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Log
from sqlalchemy import desc, or_
from datetime import datetime

logs_bp = Blueprint('logs', __name__)


@logs_bp.route('/', methods=['GET'])
@jwt_required()
def get_logs():
    """
    Fetch paginated logs with optional filters:
    - severity, ip, hostname, date_from, date_to, search, page, per_page
    """
    page      = int(request.args.get('page', 1))
    per_page  = int(request.args.get('per_page', 50))
    severity  = request.args.get('severity')
    ip        = request.args.get('ip')
    hostname  = request.args.get('hostname')
    date_from = request.args.get('date_from')
    date_to   = request.args.get('date_to')
    search    = request.args.get('search')

    query = Log.query

    if severity:
        query = query.filter(Log.severity == severity)
    if ip:
        query = query.filter(Log.ip_address.like(f'%{ip}%'))
    if hostname:
        query = query.filter(Log.hostname.like(f'%{hostname}%'))
    if date_from:
        query = query.filter(Log.timestamp >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.filter(Log.timestamp <= datetime.fromisoformat(date_to))
    if search:
        query = query.filter(
            or_(
                Log.message.like(f'%{search}%'),
                Log.hostname.like(f'%{search}%'),
                Log.ip_address.like(f'%{search}%')
            )
        )

    paginated = query.order_by(desc(Log.timestamp)).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        "logs": [log.to_dict() for log in paginated.items],
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": paginated.page
    }), 200


@logs_bp.route('/recent', methods=['GET'])
@jwt_required()
def recent_logs():
    """Return last 20 log entries for the live feed widget."""
    logs = Log.query.order_by(desc(Log.timestamp)).limit(20).all()
    return jsonify([l.to_dict() for l in logs]), 200


@logs_bp.route('/stats', methods=['GET'])
@jwt_required()
def log_stats():
    """Return aggregate counts: total, by severity."""
    from sqlalchemy import func
    total = Log.query.count()
    by_severity = (
        db.session.query(Log.severity, func.count(Log.id))
        .group_by(Log.severity)
        .all()
    )
    return jsonify({
        "total": total,
        "by_severity": {sev: cnt for sev, cnt in by_severity}
    }), 200


@logs_bp.route('/hourly', methods=['GET'])
@jwt_required()
def logs_per_hour():
    """Return log counts grouped by hour for the last 24 hours."""
    from sqlalchemy import func, text
    rows = db.session.execute(text(
        """
        SELECT DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') AS hour,
               COUNT(*) AS count
        FROM logs
        WHERE timestamp >= NOW() - INTERVAL 24 HOUR
        GROUP BY hour
        ORDER BY hour ASC
        """
    )).fetchall()
    return jsonify([{"hour": r[0], "count": r[1]} for r in rows]), 200

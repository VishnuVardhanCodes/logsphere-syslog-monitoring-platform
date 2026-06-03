"""
Analytics Routes - Aggregated data for charts and insights.
"""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import db, Log, Alert
from sqlalchemy import func, text

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
def overview():
    """
    High-level dashboard overview stats:
    - total_logs, active_devices, critical_alerts, warnings
    """
    from datetime import datetime, timedelta
    from models import User

    total_logs     = Log.query.count()
    active_devices = db.session.query(
        func.count(func.distinct(Log.ip_address))
    ).scalar()
    critical_alerts = Alert.query.filter(
        Alert.severity.in_(['Critical', 'Emergency', 'Alert']),
        Alert.status == 'active'
    ).count()
    warnings = Log.query.filter(Log.severity == 'Warning').count()

    return jsonify({
        "total_logs":      total_logs,
        "active_devices":  active_devices,
        "critical_alerts": critical_alerts,
        "warnings":        warnings
    }), 200


@analytics_bp.route('/severity-distribution', methods=['GET'])
@jwt_required()
def severity_distribution():
    """Pie chart data: log count per severity level."""
    rows = (
        db.session.query(Log.severity, func.count(Log.id))
        .group_by(Log.severity)
        .all()
    )
    return jsonify([{"severity": r[0], "count": r[1]} for r in rows]), 200


@analytics_bp.route('/logs-per-hour', methods=['GET'])
@jwt_required()
def logs_per_hour():
    """Area chart data: logs count based on time range (24h, 7d, 30d)."""
    from flask import request
    time_range = request.args.get('range', '24h')
    
    if time_range == '7d':
        interval_sql = "NOW() - INTERVAL 7 DAY"
        date_format = "%b %d"
    elif time_range == '30d':
        interval_sql = "NOW() - INTERVAL 30 DAY"
        date_format = "%b %d"
    else:
        interval_sql = "NOW() - INTERVAL 24 HOUR"
        date_format = "%H:00"

    query = text(f"""
        SELECT DATE_FORMAT(timestamp, '{date_format}') AS time_label,
               COUNT(*) AS count,
               MIN(timestamp) as min_ts
        FROM logs
        WHERE timestamp >= {interval_sql}
        GROUP BY time_label 
        ORDER BY min_ts ASC
    """)
    rows = db.session.execute(query).fetchall()
    return jsonify([{"time": r[0], "count": r[1]} for r in rows]), 200


@analytics_bp.route('/device-activity', methods=['GET'])
@jwt_required()
def device_activity():
    """Bar chart data: log count per device (top 10)."""
    rows = (
        db.session.query(Log.hostname, func.count(Log.id).label('count'))
        .group_by(Log.hostname)
        .order_by(func.count(Log.id).desc())
        .limit(10)
        .all()
    )
    return jsonify([{"hostname": r[0], "count": r[1]} for r in rows]), 200


@analytics_bp.route('/alert-trends', methods=['GET'])
@jwt_required()
def alert_trends():
    """Line chart data: alerts per day for the last 7 days."""
    rows = db.session.execute(text(
        """
        SELECT DATE(created_at) AS day, COUNT(*) AS count
        FROM alerts
        WHERE created_at >= NOW() - INTERVAL 7 DAY
        GROUP BY day ORDER BY day ASC
        """
    )).fetchall()
    return jsonify([{"day": str(r[0]), "count": r[1]} for r in rows]), 200

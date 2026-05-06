"""
Reports Routes - CSV export and report generation endpoints.
"""

import csv
import io
from flask import Blueprint, jsonify, send_file, request
from flask_jwt_extended import jwt_required
from models import Log, Alert
from sqlalchemy import desc

reports_bp = Blueprint('reports', __name__)


@reports_bp.route('/export/logs', methods=['GET'])
@jwt_required()
def export_logs_csv():
    """Export logs as a downloadable CSV file."""
    limit = int(request.args.get('limit', 1000))
    logs = Log.query.order_by(desc(Log.timestamp)).limit(limit).all()

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        'id', 'timestamp', 'hostname', 'ip_address',
        'severity', 'facility', 'message', 'device_type'
    ])
    writer.writeheader()
    for log in logs:
        writer.writerow(log.to_dict())

    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype='text/csv',
        as_attachment=True,
        download_name='logsphere_logs.csv'
    )


@reports_bp.route('/export/alerts', methods=['GET'])
@jwt_required()
def export_alerts_csv():
    """Export alerts as a downloadable CSV file."""
    alerts = Alert.query.order_by(desc(Alert.created_at)).all()

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        'id', 'severity', 'message', 'status', 'created_at'
    ])
    writer.writeheader()
    for alert in alerts:
        writer.writerow(alert.to_dict())

    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype='text/csv',
        as_attachment=True,
        download_name='logsphere_alerts.csv'
    )


@reports_bp.route('/summary', methods=['GET'])
@jwt_required()
def report_summary():
    """Return a JSON summary for report generation UI."""
    from models import db
    from sqlalchemy import func

    total_logs   = Log.query.count()
    total_alerts = Alert.query.count()
    active_alerts = Alert.query.filter_by(status='active').count()
    sev_dist = (
        db.session.query(Log.severity, func.count(Log.id))
        .group_by(Log.severity).all()
    )

    return jsonify({
        "total_logs":    total_logs,
        "total_alerts":  total_alerts,
        "active_alerts": active_alerts,
        "severity_distribution": {s: c for s, c in sev_dist}
    }), 200

"""
Devices Routes - Derive unique device info from the logs table.
Since we don't have a separate devices table, devices are inferred
from unique IP + hostname combinations in the logs.
"""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import db, Log
from sqlalchemy import func, desc
from datetime import datetime, timedelta

devices_bp = Blueprint('devices', __name__)


@devices_bp.route('/', methods=['GET'])
@jwt_required()
def get_devices():
    """
    Return unique devices (ip + hostname) with their:
    - last seen timestamp
    - total log count
    - online/offline status (seen in last 5 minutes)
    - device type
    """
    five_min_ago = datetime.utcnow() - timedelta(minutes=5)

    rows = (
        db.session.query(
            Log.ip_address,
            Log.hostname,
            Log.device_type,
            func.count(Log.id).label('log_count'),
            func.max(Log.timestamp).label('last_seen')
        )
        .group_by(Log.ip_address, Log.hostname, Log.device_type)
        .order_by(desc('last_seen'))
        .all()
    )

    devices = []
    for row in rows:
        last_seen = row.last_seen
        status = 'online' if last_seen and last_seen >= five_min_ago else 'offline'
        devices.append({
            "ip_address":  row.ip_address,
            "hostname":    row.hostname,
            "device_type": row.device_type or 'Unknown',
            "log_count":   row.log_count,
            "last_seen":   last_seen.isoformat() if last_seen else None,
            "status":      status
        })

    return jsonify({
        "devices": devices,
        "total": len(devices),
        "online": sum(1 for d in devices if d['status'] == 'online'),
        "offline": sum(1 for d in devices if d['status'] == 'offline')
    }), 200


@devices_bp.route('/<ip_address>/logs', methods=['GET'])
@jwt_required()
def device_logs(ip_address):
    """Return last 50 logs for a specific device IP."""
    logs = (
        Log.query
        .filter_by(ip_address=ip_address)
        .order_by(desc(Log.timestamp))
        .limit(50)
        .all()
    )
    return jsonify([l.to_dict() for l in logs]), 200

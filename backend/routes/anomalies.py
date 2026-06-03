"""
Anomalies Routes - Report and manage detected anomalies.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Anomaly
from sqlalchemy import desc

anomalies_bp = Blueprint('anomalies', __name__)

@anomalies_bp.route('/', methods=['GET'])
@jwt_required()
def get_anomalies():
    """Return all anomalies, newest first."""
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    status = request.args.get('status')

    query = Anomaly.query
    if status:
        query = query.filter(Anomaly.status == status)

    paginated = query.order_by(desc(Anomaly.created_at)).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        "anomalies": [a.to_dict() for a in paginated.items],
        "total": paginated.total,
        "pages": paginated.pages
    }), 200


@anomalies_bp.route('/', methods=['POST'])
@jwt_required()
def create_anomaly():
    """Report a new anomaly."""
    data = request.json
    if not data or not data.get('hostname') or not data.get('description'):
        return jsonify({"error": "hostname and description are required"}), 400

    anomaly = Anomaly(
        hostname=data['hostname'],
        severity=data.get('severity', 'Warning'),
        category=data.get('category', 'General'),
        description=data['description'],
        notes=data.get('notes', ''),
        status='open'
    )
    db.session.add(anomaly)
    db.session.commit()
    return jsonify({"message": "Anomaly reported", "anomaly": anomaly.to_dict()}), 201


@anomalies_bp.route('/<int:anomaly_id>/close', methods=['PUT'])
@jwt_required()
def close_anomaly(anomaly_id):
    """Mark anomaly as closed."""
    anomaly = Anomaly.query.get_or_404(anomaly_id)
    anomaly.status = 'closed'
    db.session.commit()
    return jsonify({"message": "Anomaly closed", "anomaly": anomaly.to_dict()}), 200


@anomalies_bp.route('/<int:anomaly_id>', methods=['DELETE'])
@jwt_required()
def delete_anomaly(anomaly_id):
    """Delete an anomaly record."""
    anomaly = Anomaly.query.get_or_404(anomaly_id)
    db.session.delete(anomaly)
    db.session.commit()
    return jsonify({"message": "Anomaly deleted"}), 200

"""
Settings Routes - Manage configurable platform parameters.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Setting

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/', methods=['GET'])
@jwt_required()
def get_settings():
    """Retrieve all settings as a key-value dictionary."""
    settings = Setting.query.all()
    result = {s.key: s.value for s in settings}
    return jsonify(result), 200

@settings_bp.route('/', methods=['PUT'])
@jwt_required()
def update_settings():
    """Update multiple settings."""
    data = request.json
    if not isinstance(data, dict):
        return jsonify({"error": "Expected a dictionary of settings"}), 400

    for key, value in data.items():
        setting = Setting.query.filter_by(key=key).first()
        if setting:
            setting.value = str(value)
        else:
            new_setting = Setting(key=key, value=str(value))
            db.session.add(new_setting)
            
    db.session.commit()
    return jsonify({"message": "Settings updated successfully"}), 200

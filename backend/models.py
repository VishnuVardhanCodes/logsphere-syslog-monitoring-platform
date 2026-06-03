from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='Admin')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat()
        }

class Log(db.Model):
    __tablename__ = 'logs'
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    hostname = db.Column(db.String(100))
    ip_address = db.Column(db.String(45))
    severity = db.Column(db.String(20))
    facility = db.Column(db.String(20))
    message = db.Column(db.Text)
    device_type = db.Column(db.String(50))

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "hostname": self.hostname,
            "ip_address": self.ip_address,
            "severity": self.severity,
            "facility": self.facility,
            "message": self.message,
            "device_type": self.device_type
        }

class Alert(db.Model):
    __tablename__ = 'alerts'
    id = db.Column(db.Integer, primary_key=True)
    severity = db.Column(db.String(20))
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='active')
    escalated_to = db.Column(db.String(50))
    assigned_to = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "severity": self.severity,
            "message": self.message,
            "status": self.status,
            "escalated_to": self.escalated_to,
            "assigned_to": self.assigned_to,
            "created_at": self.created_at.isoformat()
        }

class Anomaly(db.Model):
    __tablename__ = 'anomalies'
    id = db.Column(db.Integer, primary_key=True)
    hostname = db.Column(db.String(100))
    severity = db.Column(db.String(20))
    category = db.Column(db.String(50))
    description = db.Column(db.Text)
    notes = db.Column(db.Text)
    status = db.Column(db.String(20), default='open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "hostname": self.hostname,
            "severity": self.severity,
            "category": self.category,
            "description": self.description,
            "notes": self.notes,
            "status": self.status,
            "created_at": self.created_at.isoformat()
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    message = db.Column(db.Text)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "message": self.message,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat()
        }

class Setting(db.Model):
    __tablename__ = 'settings'
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False)
    value = db.Column(db.Text)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "key": self.key,
            "value": self.value,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

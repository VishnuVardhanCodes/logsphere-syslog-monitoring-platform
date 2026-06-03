"""
LogSphere Backend - Main Flask Application
Entry point for the Flask server with SocketIO, JWT, and MySQL integration.
"""

import os
import threading
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from dotenv import load_dotenv
from models import db

# Load environment variables
load_dotenv()

# Initialize SocketIO globally so routes can access it
socketio = SocketIO(cors_allowed_origins="*", async_mode='eventlet')


def create_app():
    """Application factory pattern."""
    app = Flask(__name__)

    # ── Database Configuration ──────────────────────────────────────────────
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+mysqlconnector://{os.getenv('MYSQL_USER')}:"
        f"{os.getenv('MYSQL_PASSWORD')}@{os.getenv('MYSQL_HOST')}:"
        f"{os.getenv('MYSQL_PORT', 3306)}/{os.getenv('MYSQL_DB')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # ── JWT Configuration ────────────────────────────────────────────────────
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fallback_secret')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours

    # ── Secret Key ───────────────────────────────────────────────────────────
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback_secret')
    app.config['SYSLOG_PORT'] = int(os.getenv('SYSLOG_PORT', 514))

    # ── Initialize Extensions ────────────────────────────────────────────────
    db.init_app(app)
    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    socketio.init_app(app)

    # ── Register Blueprints ──────────────────────────────────────────────────
    from routes.auth import auth_bp
    from routes.logs import logs_bp
    from routes.alerts import alerts_bp
    from routes.devices import devices_bp
    from routes.analytics import analytics_bp
    from routes.users import users_bp
    from routes.reports import reports_bp
    from routes.settings import settings_bp
    from routes.anomalies import anomalies_bp
    from routes.notifications import notifications_bp
    from routes.search import search_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(logs_bp, url_prefix='/api/logs')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(devices_bp, url_prefix='/api/devices')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')
    app.register_blueprint(anomalies_bp, url_prefix='/api/anomalies')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(search_bp, url_prefix='/api/search')

    @app.route('/health')
    def health_check():
        return {"status": "ok"}, 200

    # ── Create Tables ────────────────────────────────────────────────────────
    with app.app_context():
        db.create_all()
        _seed_super_admin()

    return app


def _seed_super_admin():
    """Seed a default Super Admin if none exists."""
    from models import User
    import bcrypt
    if not User.query.filter_by(role='Super Admin').first():
        hashed = bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode('utf-8')
        admin = User(
            username='superadmin',
            email='admin@logsphere.com',
            password=hashed,
            role='Super Admin'
        )
        db.session.add(admin)
        db.session.commit()
        print("[INFO] Default Super Admin created: superadmin / admin123")


if __name__ == '__main__':
    app = create_app()

    # Start syslog UDP listener in a background thread
    from syslog_receiver import start_syslog_listener
    syslog_thread = threading.Thread(
        target=start_syslog_listener,
        args=(app, socketio),
        daemon=True
    )
    syslog_thread.start()

    print("[INFO] LogSphere backend starting on http://0.0.0.0:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, use_reloader=False)

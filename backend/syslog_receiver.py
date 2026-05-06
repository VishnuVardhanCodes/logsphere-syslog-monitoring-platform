"""
Syslog UDP Receiver - Listens on UDP port 514 and stores incoming syslog messages.
Broadcasts new log entries over WebSocket to connected clients.
"""

import socket
import re
from datetime import datetime
from models import db, Log, Alert

# Syslog severity mapping (RFC 5424)
SEVERITY_MAP = {
    0: 'Emergency',
    1: 'Alert',
    2: 'Critical',
    3: 'Error',
    4: 'Warning',
    5: 'Notice',
    6: 'Info',
    7: 'Debug'
}

# Syslog facility mapping
FACILITY_MAP = {
    0: 'kernel', 1: 'user', 2: 'mail', 3: 'daemon', 4: 'auth',
    5: 'syslog', 6: 'lpr', 7: 'news', 8: 'uucp', 9: 'clock',
    10: 'authpriv', 11: 'ftp', 16: 'local0', 17: 'local1',
    18: 'local2', 19: 'local3', 20: 'local4', 21: 'local5',
    22: 'local6', 23: 'local7'
}

# Known device type heuristics
DEVICE_KEYWORDS = {
    'cisco': 'Router', 'switch': 'Switch', 'firewall': 'Firewall',
    'nginx': 'Web Server', 'apache': 'Web Server', 'kernel': 'Linux Host',
    'sshd': 'SSH Service', 'sudo': 'Linux Host', 'windows': 'Windows Host'
}


def _parse_syslog(raw: str, sender_ip: str) -> dict:
    """
    Parse a raw syslog message into structured fields.
    Supports RFC 3164 and RFC 5424 formats.
    """
    data = {
        'timestamp': datetime.utcnow(),
        'ip_address': sender_ip,
        'hostname': sender_ip,
        'severity': 'Info',
        'facility': 'user',
        'message': raw.strip(),
        'device_type': 'Unknown'
    }

    # Extract PRI value: <PRI>
    pri_match = re.match(r'^<(\d{1,3})>(.*)', raw)
    if pri_match:
        pri_val = int(pri_match.group(1))
        facility_code = pri_val >> 3
        severity_code = pri_val & 0x07
        data['facility'] = FACILITY_MAP.get(facility_code, 'unknown')
        data['severity'] = SEVERITY_MAP.get(severity_code, 'Info')
        remainder = pri_match.group(2).strip()

        # Try RFC 3164: MMM DD HH:MM:SS hostname message
        rfc3164 = re.match(
            r'(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(.*)',
            remainder
        )
        if rfc3164:
            data['hostname'] = rfc3164.group(2)
            data['message'] = rfc3164.group(3)
        else:
            data['message'] = remainder

    # Infer device type from message content
    msg_lower = data['message'].lower()
    for keyword, dtype in DEVICE_KEYWORDS.items():
        if keyword in msg_lower:
            data['device_type'] = dtype
            break

    return data


def _create_alert_if_needed(log_data: dict, app_ctx):
    """Auto-create alerts for Critical/Emergency/Alert severity logs."""
    critical_severities = {'Emergency', 'Alert', 'Critical', 'Error'}
    if log_data['severity'] in critical_severities:
        with app_ctx:
            alert = Alert(
                severity=log_data['severity'],
                message=f"[{log_data['hostname']}] {log_data['message'][:200]}",
                status='active'
            )
            db.session.add(alert)
            db.session.commit()


def start_syslog_listener(app, socketio):
    """
    Starts a UDP socket on port 514 listening for syslog messages.
    Each message is parsed, stored, and broadcast via WebSocket.
    """
    port = int(app.config.get('SYSLOG_PORT', 514))

    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.bind(('0.0.0.0', port))
        print(f"[INFO] Syslog UDP listener started on port {port}")
    except PermissionError:
        print(f"[WARN] Cannot bind to port {port} (requires root/admin). "
              f"Use port > 1024 for development.")
        # Fallback to 5140 for dev environments
        port = 5140
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.bind(('0.0.0.0', port))
        print(f"[INFO] Syslog UDP listener started on fallback port {port}")

    while True:
        try:
            data, addr = sock.recvfrom(4096)
            raw_msg = data.decode('utf-8', errors='replace')
            sender_ip = addr[0]

            log_data = _parse_syslog(raw_msg, sender_ip)

            # Store in DB within app context
            with app.app_context():
                log = Log(**log_data)
                db.session.add(log)
                db.session.commit()

                # Broadcast to all WebSocket clients
                socketio.emit('new_log', log.to_dict())

                # Create alert if severity warrants it
                _create_alert_if_needed(log_data, app.app_context())

        except Exception as e:
            print(f"[ERROR] Syslog listener error: {e}")

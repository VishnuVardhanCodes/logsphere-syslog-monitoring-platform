"""
Syslog UDP Receiver - Listens on UDP port and stores incoming syslog messages.
Broadcasts new log entries over WebSocket to connected clients.
"""

import socket
import re
from datetime import datetime
from models import db, Log, Alert

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

FACILITY_MAP = {
    0: 'kernel', 1: 'user', 2: 'mail', 3: 'daemon', 4: 'auth',
    5: 'syslog', 6: 'lpr', 7: 'news', 8: 'uucp', 9: 'clock',
    10: 'authpriv', 11: 'ftp', 16: 'local0', 17: 'local1',
    18: 'local2', 19: 'local3', 20: 'local4', 21: 'local5',
    22: 'local6', 23: 'local7'
}

DEVICE_KEYWORDS = {
    'cisco': 'Router', 'switch': 'Switch', 'firewall': 'Firewall',
    'nginx': 'Web Server', 'apache': 'Web Server', 'kernel': 'Linux Host',
    'sshd': 'SSH Service', 'sudo': 'Linux Host', 'windows': 'Windows Host',
    'router': 'Router', 'fw': 'Firewall', 'web': 'Web Server', 'db': 'Database'
}

def parse_syslog(raw, sender_ip):
    data = {
        'timestamp': datetime.utcnow(),
        'ip_address': sender_ip,
        'hostname': sender_ip,
        'severity': 'Info',
        'facility': 'user',
        'message': raw.strip(),
        'device_type': 'Unknown'
    }

    pri_match = re.match(r'^<(\d{1,3})>(.*)', raw)

    if pri_match:
        pri_val = int(pri_match.group(1))

        facility_code = pri_val >> 3
        severity_code = pri_val & 0x07

        data['facility'] = FACILITY_MAP.get(facility_code, 'unknown')
        data['severity'] = SEVERITY_MAP.get(severity_code, 'Info')

        remainder = pri_match.group(2).strip()

        rfc3164 = re.match(
            r'(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(.*)',
            remainder
        )

        if rfc3164:
            data['hostname'] = rfc3164.group(2)
            data['message'] = rfc3164.group(3)
        else:
            data['message'] = remainder

    msg_lower = data['message'].lower()
    host_lower = data['hostname'].lower()
    for keyword, dtype in DEVICE_KEYWORDS.items():
        if keyword in msg_lower or keyword in host_lower:
            data['device_type'] = dtype
            break

    return data


def _create_alert_if_needed(log_data: dict, app_ctx):
    """Auto-create alerts for Critical/Emergency/Alert/Error severity logs."""
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
            return alert.to_dict()
    return None

def start_syslog_listener(app, socketio):
    port = 5514
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    try:
        sock.bind(('0.0.0.0', port))
        print(f"[INFO] Syslog UDP listener started on port {port}")
    except Exception as e:
        print(f"[ERROR] Could not bind UDP listener to port {port}: {e}")
        return

    while True:
        try:
            data, addr = sock.recvfrom(8192)
            raw_msg = data.decode('utf-8', errors='replace')
            sender_ip = addr[0]

            log_data = parse_syslog(raw_msg, sender_ip)

            with app.app_context():
                log = Log(**log_data)
                db.session.add(log)
                db.session.commit()

                print(f"[LOG RECEIVED] {log_data['severity']} from {log_data['hostname']}: {log_data['message'][:100]}")

                # Emit the log to clients
                socketio.emit('new_log', log.to_dict())

                # Check if it should be an alert
                alert_dict = _create_alert_if_needed(log_data, app.app_context())
                if alert_dict:
                    print(f"[ALERT CREATED] {alert_dict['severity']}: {alert_dict['message'][:100]}")
                    socketio.emit('new_alert', alert_dict)

        except Exception as e:
            print(f"[ERROR] Syslog listener exception: {e}")
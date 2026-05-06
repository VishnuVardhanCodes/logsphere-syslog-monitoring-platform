"""
Sample Syslog Generator
Sends realistic fake syslog UDP messages to localhost for development/testing.
Run: python syslog_generator.py
"""

import socket
import random
import time
from datetime import datetime

# Target
HOST = '127.0.0.1'
PORT = 5140  # Use 514 in production (requires root)

# Sample data pools
HOSTNAMES = [
    'router-core-01', 'switch-floor2', 'fw-edge-01',
    'web-server-01', 'db-server-02', 'linux-host-05',
    'win-server-03', 'vpn-gateway', 'ids-sensor-01', 'ap-lobby'
]

IPS = [
    '192.168.1.1', '192.168.1.10', '10.0.0.1',
    '172.16.0.5', '192.168.10.20', '10.10.1.50',
    '192.168.100.15', '10.0.5.2', '172.16.50.1', '192.168.2.254'
]

MESSAGES = {
    0: ["System panic: kernel crash", "Emergency shutdown initiated"],
    1: ["Alert: Intrusion detected on eth0", "Security alert: port scan detected"],
    2: ["Critical: Disk space below 5%", "Critical memory exhaustion"],
    3: ["Error: Connection refused", "Failed to authenticate user admin", "SSL handshake failed"],
    4: ["Warning: High CPU usage 92%", "Warning: Memory usage threshold exceeded", "Interface flapping detected"],
    5: ["Notice: User login successful", "Config saved", "Interface up"],
    6: ["Accepted password for root from 10.0.0.1 port 52341 ssh2",
        "DHCP lease assigned to 192.168.1.55",
        "NTP sync successful", "BGP neighbor up"],
    7: ["Debug: packet received on eth0", "Debug: Cache hit ratio 0.85"]
}

FACILITIES = list(range(0, 24))

def build_syslog_message(pri, hostname, message):
    """Build an RFC 3164 formatted syslog message."""
    timestamp = datetime.now().strftime('%b %d %H:%M:%S')
    return f"<{pri}>{timestamp} {hostname} {message}"

def generate_log():
    """Generate and send a single random syslog message."""
    severity = random.choices(
        population=[0, 1, 2, 3, 4, 5, 6, 7],
        weights=[1, 2, 3, 8, 15, 20, 40, 11],  # Weighted toward Info/Notice
        k=1
    )[0]
    facility = random.choice(FACILITIES)
    pri = (facility * 8) + severity
    hostname = random.choice(HOSTNAMES)
    message = random.choice(MESSAGES[severity])

    raw = build_syslog_message(pri, hostname, message)

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.sendto(raw.encode(), (HOST, PORT))
    sock.close()

    print(f"[SENT] PRI={pri} SEV={severity} HOST={hostname} MSG={message}")

if __name__ == '__main__':
    print(f"[INFO] Syslog generator running → {HOST}:{PORT}")
    print("[INFO] Press Ctrl+C to stop\n")
    try:
        while True:
            generate_log()
            time.sleep(random.uniform(0.5, 2.0))  # Random interval 0.5–2s
    except KeyboardInterrupt:
        print("\n[INFO] Generator stopped.")

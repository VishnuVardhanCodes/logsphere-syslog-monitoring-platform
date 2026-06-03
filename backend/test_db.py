import os
import socket

script_dir = os.path.dirname(os.path.abspath(__file__))
log_path = os.path.join(script_dir, "db_log.txt")

with open(log_path, "w", buffering=1) as f:
    f.write("Starting Socket Connection Test...\n")
    try:
        ip = "127.0.0.1"
        port = 3306
        f.write(f"Testing TCP connection to {ip}:{port}...\n")
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(3.0)
        result = s.connect_ex((ip, port))
        if result == 0:
            f.write("Port is OPEN!\n")
        else:
            f.write(f"Port is CLOSED! (code: {result})\n")
        s.close()
    except Exception as e:
        f.write(f"Socket test error: {e}\n")

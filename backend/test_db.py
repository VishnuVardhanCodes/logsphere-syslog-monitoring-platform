import os
import mysql.connector
from dotenv import load_dotenv

script_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(script_dir, ".env"))

log_path = os.path.join(script_dir, "db_log.txt")

with open(log_path, "w", buffering=1) as f:
    f.write("Starting DB test...\n")
    try:
        host = os.getenv('MYSQL_HOST')
        user = os.getenv('MYSQL_USER')
        password = os.getenv('MYSQL_PASSWORD')
        database = os.getenv('MYSQL_DB')
        port = os.getenv('MYSQL_PORT', 3306)
        
        f.write(f"Parameters: host={host}, port={port}, user={user}, db={database}\n")
        
        # Test 127.0.0.1 explicitly if host is localhost
        if host == 'localhost':
            f.write("Host is 'localhost', will try connecting via '127.0.0.1' as well.\n")
            host = '127.0.0.1'
            
        f.write("Connecting...\n")
        conn = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            connection_timeout=5
        )
        f.write("Success! Connected to database.\n")
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        f.write(f"Tables: {cursor.fetchall()}\n")
        cursor.close()
        conn.close()
    except Exception as e:
        f.write("Error connecting to database:\n")
        import traceback
        traceback.print_exc(file=f)

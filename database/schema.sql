CREATE DATABASE IF NOT EXISTS logsphere;
USE logsphere;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Super Admin') DEFAULT 'Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    hostname VARCHAR(100),
    ip_address VARCHAR(45),
    severity VARCHAR(20),
    facility VARCHAR(20),
    message TEXT,
    device_type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    severity VARCHAR(20),
    message TEXT,
    status ENUM('active', 'resolved') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Super Admin (Password: admin123 - hashed version should be used)
-- INSERT INTO users (username, email, password, role) VALUES ('admin', 'admin@logsphere.com', '$2b$12$K7...', 'Super Admin');

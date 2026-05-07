<div align="center">
  <img src="https://via.placeholder.com/150/0B1120/3B82F6?text=LogSphere" alt="LogSphere Logo" width="120" style="border-radius: 15px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.5);"/>
  <h1>🌐 LogSphere Syslog Platform</h1>
  <p><strong>Enterprise-Grade Real-Time Syslog Monitoring & Analytics</strong></p>
  <p>High-performance log ingestion, processing, and visualization for modern IT infrastructure. <br> Inspired by Datadog, Grafana, and Kibana.</p>
  
  <div style="margin-top: 15px;">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="SocketIO" />
  </div>
</div>

<br />

## 🌟 How It Works (System Architecture)

LogSphere is built on a high-performance, real-time pipeline that ingests, processes, and visualizes system logs instantly. 

```mermaid
flowchart TB
    subgraph Log Sources
        A1[📡 Network Devices]
        A2[💻 Servers]
        A3[🧪 Traffic Simulator]
    end

    subgraph Backend Services
        B[🔌 UDP Listener \n Port 5140]
        C[⚙️ Flask Backend \n Parser & Processor]
        D[(🗄️ MySQL DB \n Storage & Alerts)]
    end

    subgraph Frontend Client
        E[⚡ WebSocket \n Real-Time Broadcast]
        F[📊 React Dashboard \n UI & Analytics]
    end

    A1 -->|UDP / RFC 3164| B
    A2 -->|UDP / RFC 3164| B
    A3 -->|UDP / RFC 3164| B

    B -->|Raw Logs| C
    C -->|Normalized Data| D
    C -->|Parsed Log Object| E
    
    E -->|Socket.IO Event| F
    D -.->|Historical Data / REST API| F

    style A1 fill:#1e293b,stroke:#3b82f6,color:#fff
    style A2 fill:#1e293b,stroke:#3b82f6,color:#fff
    style A3 fill:#1e293b,stroke:#3b82f6,color:#fff
    style B fill:#0f172a,stroke:#06b6d4,color:#fff
    style C fill:#0f172a,stroke:#10b981,color:#fff
    style D fill:#0f172a,stroke:#f59e0b,color:#fff
    style E fill:#0f172a,stroke:#8b5cf6,color:#fff
    style F fill:#0b1120,stroke:#3b82f6,stroke-width:2px,color:#fff
```

### 🔄 The Process Flow:
1. **Log Generation (📡):** Devices or the built-in simulator (`syslog_generator.py`) emit standard syslog messages (RFC 3164 format).
2. **Ingestion (🔌):** Transmitted via UDP to the backend listener (`syslog_receiver.py`) operating on port `5140`.
3. **Parsing (⚙️):** The Python backend decodes raw bytes, extracting Timestamp, Hostname, App Name, Facility, Severity, and Message.
4. **Storage (🗄️):** Data is normalized and stored securely in MySQL. Alerts are triggered based on severity rules.
5. **Broadcasting (⚡):** `Flask-SocketIO` instantly pushes the newly parsed log to all connected web clients without polling.
6. **Visualization (📊):** The React frontend instantly renders updates across Live Logs, KPIs, and Charts in a premium glassmorphic UI.

---

## ✨ Key Features

- **⚡ Real-Time Ingestion:** Lightning-fast UDP listening capabilities processing thousands of logs/sec.
- **🔌 Zero-Latency Updates:** WebSockets push data directly to your dashboard—no refreshing required.
- **🎨 Enterprise UI:** Stunning dark-mode, glassmorphism-inspired interface built with TailwindCSS & Framer Motion.
- **🔐 Secure Access:** JWT authentication with robust `Admin` and `Super Admin` Role-Based Access Control (RBAC).
- **📈 Interactive Analytics:** Deep insights using dynamic Recharts visualizations (bar charts, line graphs, pie charts).
- **🚨 Smart Alerts:** Automated alert generation based on log severity with built-in resolution workflows.

---

## 📁 Project Structure

```text
logsphere/
├── frontend/               # React + Vite + TailwindCSS Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Full page layouts (Dashboard, Live Logs, etc.)
│   │   └── services/       # API and WebSocket client logic
├── backend/                # Python + Flask + SocketIO API
│   ├── routes/             # Modular API blueprints (auth, logs, alerts, analytics)
│   ├── app.py              # Main Flask application initialization
│   ├── models.py           # SQLAlchemy database models
│   ├── syslog_receiver.py  # Background UDP listening thread
│   └── syslog_generator.py # Development script for simulating network traffic
├── database/
│   └── schema.sql          # MySQL database initialization schema
└── README.md
```

---

## ⚙️ Prerequisites

Ensure you have the following installed before proceeding:
- **Python 3.10+**
- **Node.js 18+**
- **MySQL 8.0+**

---

## 🚀 Getting Started

### 1. Database Setup
```sql
-- Start your MySQL server, then initialize the database schema:
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Create a .env file and set your MySQL password:
# echo "MYSQL_PASSWORD=your_password" > .env

# Run the Flask backend
python app.py
```
> **Backend runs at:** `http://localhost:5000`
> **Default credentials:** `superadmin` / `admin123`

### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
> **Frontend runs at:** `http://localhost:3000`

### 4. Simulating Traffic (Development)
To see data flow through the system, run the traffic generator in a separate terminal:
```bash
cd backend
python syslog_generator.py
```
*This sends realistic RFC 3164 syslog packets to `127.0.0.1:5140` every 0.5–2 seconds.*

---

## 🔐 Authentication & Roles

LogSphere uses JWT (JSON Web Tokens) for secure API access. Tokens expire after **24 hours**.

| Role        | Capabilities |
|-------------|--------------|
| **Admin**       | View logs, manage alerts, view devices, and explore analytics. |
| **Super Admin** | All Admin rights **plus** access to the User Management control panel. |

---

## 🌐 API & WebSocket Reference

### REST API Endpoints
- **Auth:** `/api/auth/login`, `/api/auth/me`, `/api/auth/change-password`
- **Logs:** `/api/logs/`, `/api/logs/recent`, `/api/logs/stats`, `/api/logs/hourly`
- **Alerts:** `/api/alerts/`, `/api/alerts/<id>/resolve`, `/api/alerts/<id>`
- **Analytics:** `/api/analytics/overview`, `/api/analytics/severity-distribution`, `/api/analytics/logs-per-hour`

### WebSocket Events
| Event Name  | Direction       | Payload Description |
|-------------|-----------------|---------------------|
| `new_log`   | Server → Client | Full JSON object containing the newly processed log. |

---

## 🎨 Design System

LogSphere employs a high-end, futuristic enterprise design language:
- **Background Palette:** `#0B1120`, `#111827`, `#0F172A`
- **Accent Colors:** `#3B82F6` (Electric Blue), `#06B6D4` (Neon Cyan)
- **Status Indicators:** `#EF4444` (Critical), `#F59E0B` (Warning), `#10B981` (Success)
- **Typography:** Inter (Google Fonts) for clean, readable data presentation.
- **Aesthetics:** Glassmorphism, subtle gradient borders, soft glow shadows, and fluid Framer Motion animations.

---

## 🛠️ Production Deployment Notes

1. Set `FLASK_ENV=production` and `VITE_API_URL` securely in your `.env` files.
2. Use a robust WSGI server for the backend: `gunicorn --worker-class eventlet -w 1 app:app`
3. Bind the syslog receiver to the standard port **514** (requires root/administrative privileges).
4. Build the frontend for production: `npm run build`, and serve the `dist/` directory via **Nginx**.
5. Ensure strong, randomized secrets are used for `JWT_SECRET_KEY` and `SECRET_KEY`.

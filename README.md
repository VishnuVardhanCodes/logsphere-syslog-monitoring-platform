<div align="center">
  <img src="https://via.placeholder.com/150/0B1120/3B82F6?text=LogSphere" alt="LogSphere Logo" width="100"/>
  <h1>LogSphere</h1>
  <p><strong>Enterprise Syslog Monitoring Platform</strong></p>
  <p>Real-time syslog intelligence for enterprise IT infrastructure. Inspired by Datadog, Grafana, and Kibana.</p>
  
  <div>
    <img src="https://img.shields.io/badge/React-Vite-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Flask-Python-green?style=for-the-badge&logo=flask" alt="Flask" />
    <img src="https://img.shields.io/badge/MySQL-Database-orange?style=for-the-badge&logo=mysql" alt="MySQL" />
    <img src="https://img.shields.io/badge/TailwindCSS-UI-cyan?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  </div>
</div>

<br />

## 🌟 How It Works (The Process Flow)

LogSphere is designed to be a high-performance, real-time pipeline that ingests, processes, and visualizes system logs seamlessly. Here is the step-by-step architecture of how the process works:

1. **Log Generation & Ingestion (UDP)**
   Network devices, servers, or the built-in development traffic simulator (`syslog_generator.py`) emit standard syslog messages (RFC 3164 format). These are transmitted via UDP to the backend listener (`syslog_receiver.py`) operating on port `5140` (or `514` in production).

2. **Parsing & Processing (Flask Backend)**
   The Python backend intercepts the incoming UDP packets. It decodes the raw byte streams and parses out critical metadata: Timestamp, Hostname, Application Name, Facility, Severity, and the actual Message content.

3. **Storage & Evaluation (MySQL + SQLAlchemy)**
   Once parsed, the log data is securely stored in a normalized MySQL database. Simultaneously, the backend evaluates the log's severity to automatically trigger actionable **Alerts** and recalculates real-time aggregation metrics.

4. **Real-Time Broadcasting (WebSockets)**
   To eliminate the need for frontend polling, the backend uses `Flask-SocketIO` to instantly broadcast the newly parsed log object to all connected and authenticated web clients via the `new_log` WebSocket event.

5. **Interactive Visualization (React + Recharts)**
   The React frontend receives the WebSocket broadcast and immediately updates the UI. The **Live Logs** feed populates instantly, **Dashboard KPIs** shift dynamically, and the interactive **Analytics charts** redraw to reflect the latest system state—all wrapped in a premium, dark-themed, glassmorphic design.

---

## ✨ Key Features

- **Real-Time Ingestion:** Lightning-fast UDP listening capabilities.
- **Live Updates:** WebSocket integration for zero-latency dashboard updates.
- **Enterprise UI:** Stunning, dark-mode, glassmorphism-inspired interface with TailwindCSS and Framer Motion.
- **Role-Based Access Control:** Secure JWT authentication distinguishing between `Admin` and `Super Admin` privileges.
- **Interactive Analytics:** Deep insights using rich, interactive Recharts visualizations.
- **Alert Management:** Automated alert generation based on log severity with resolution workflows.

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

# LogSphere — Enterprise Syslog Monitoring Platform

> Real-time syslog intelligence for enterprise IT infrastructure. Inspired by Datadog, Grafana, and Kibana.

![Stack](https://img.shields.io/badge/React-Vite-blue) ![Stack](https://img.shields.io/badge/Flask-Python-green) ![Stack](https://img.shields.io/badge/MySQL-Database-orange) ![Stack](https://img.shields.io/badge/TailwindCSS-UI-cyan)

---

## 📁 Project Structure

```
logsphere/
├── frontend/          # React + Vite + TailwindCSS
├── backend/           # Flask + SocketIO + JWT
│   ├── routes/        # API blueprints
│   ├── app.py         # Main application
│   ├── models.py      # SQLAlchemy models
│   ├── syslog_receiver.py  # UDP listener
│   └── syslog_generator.py # Dev traffic simulator
├── database/
│   └── schema.sql     # MySQL schema
└── docs/
```

---

## ⚙️ Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+

---

## 🗄️ Database Setup

```sql
-- 1. Start MySQL and run:
mysql -u root -p < database/schema.sql
```

---

## 🐍 Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env and set your MySQL password:
# MYSQL_PASSWORD=your_password

# Run backend
python app.py
```

Backend runs at: `http://localhost:5000`

**Default credentials:** `superadmin` / `admin123`

---

## ⚡ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 📡 Syslog Testing

Run the built-in traffic generator in a separate terminal:

```bash
cd backend
python syslog_generator.py
```

This sends realistic RFC 3164 syslog packets to `127.0.0.1:5140` every 0.5–2 seconds.

> **Note:** In production, configure devices to send syslog to port **514** (UDP).  
> For development, port **5140** is used to avoid requiring admin privileges.

---

## 🔐 Authentication & Roles

| Role        | Capabilities                              |
|-------------|-------------------------------------------|
| Admin       | View logs, alerts, devices, analytics     |
| Super Admin | All Admin rights + User Management page   |

JWT tokens expire after **24 hours**.

---

## 📊 Pages

| Page            | Route          | Description                        |
|-----------------|----------------|------------------------------------|
| Login           | `/login`       | JWT authentication                 |
| Dashboard       | `/dashboard`   | KPI cards + live charts            |
| Live Logs       | `/live-logs`   | Real-time log table + filters      |
| Alerts          | `/alerts`      | Alert management + resolve/delete  |
| Devices         | `/devices`     | Device inventory + status          |
| Analytics       | `/analytics`   | Interactive Recharts dashboards    |
| Reports         | `/reports`     | CSV export + severity breakdown    |
| Settings        | `/settings`    | Config, notifications, password    |
| User Management | `/users`       | Super Admin: CRUD users            |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| POST   | `/api/auth/login`     | Login → JWT token   |
| GET    | `/api/auth/me`        | Current user info   |
| PUT    | `/api/auth/change-password` | Update password |

### Logs
| Method | Endpoint            | Description                        |
|--------|---------------------|------------------------------------|
| GET    | `/api/logs/`        | Paginated logs (with filters)      |
| GET    | `/api/logs/recent`  | Last 20 logs                       |
| GET    | `/api/logs/stats`   | Log count by severity              |
| GET    | `/api/logs/hourly`  | Logs per hour (last 24h)           |

### Alerts
| Method | Endpoint                        | Description        |
|--------|---------------------------------|--------------------|
| GET    | `/api/alerts/`                  | List alerts        |
| PUT    | `/api/alerts/<id>/resolve`      | Resolve alert      |
| DELETE | `/api/alerts/<id>`              | Delete alert       |
| GET    | `/api/alerts/stats`             | Alert statistics   |

### Analytics
| Method | Endpoint                               | Description           |
|--------|----------------------------------------|-----------------------|
| GET    | `/api/analytics/overview`              | Dashboard KPIs        |
| GET    | `/api/analytics/severity-distribution` | Pie chart data        |
| GET    | `/api/analytics/logs-per-hour`         | Area chart data       |
| GET    | `/api/analytics/device-activity`       | Bar chart data        |
| GET    | `/api/analytics/alert-trends`          | Line chart data       |

---

## 🔌 WebSocket Events

| Event     | Direction       | Payload              |
|-----------|-----------------|----------------------|
| `new_log` | Server → Client | Full log object (JSON) |

---

## 🎨 Design System

- **Background:** `#0B1120`, `#111827`, `#0F172A`
- **Accent:** `#3B82F6` (Blue), `#06B6D4` (Cyan)
- **Critical:** `#EF4444` | **Warning:** `#F59E0B` | **Success:** `#10B981`
- **Font:** Inter (Google Fonts)
- **Style:** Glassmorphism, gradient borders, glow shadows, Framer Motion animations

---

## 🚀 Production Notes

1. Set `FLASK_ENV=production` in `.env`
2. Use a WSGI server: `gunicorn --worker-class eventlet -w 1 app:app`
3. Bind syslog receiver to port 514 (requires root/admin)
4. Build frontend: `npm run build` → serve `dist/` via Nginx
5. Use environment secrets for `JWT_SECRET_KEY` and `SECRET_KEY`

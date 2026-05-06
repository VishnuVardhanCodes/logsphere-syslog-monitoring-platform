import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { Database, Monitor, AlertTriangle, AlertOctagon, Activity } from 'lucide-react'
import API from '../lib/api'
import socket from '../lib/socket'
import StatCard from '../components/StatCard'
import SeverityBadge from '../components/SeverityBadge'
import { SkeletonCard } from '../components/Skeleton'
import { fmtDate, severityColor } from '../lib/utils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs border border-blue-500/20">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [hourly, setHourly] = useState([])
  const [severity, setSeverity] = useState([])
  const [devices, setDevices] = useState([])
  const [alerts, setAlerts] = useState([])
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const [ov, hr, sv, dv, al, rl] = await Promise.all([
        API.get('/analytics/overview'),
        API.get('/analytics/logs-per-hour'),
        API.get('/analytics/severity-distribution'),
        API.get('/analytics/device-activity'),
        API.get('/alerts/?per_page=5'),
        API.get('/logs/recent'),
      ])
      setOverview(ov.data)
      setHourly(hr.data)
      setSeverity(sv.data)
      setDevices(dv.data)
      setAlerts(al.data.alerts)
      setRecentLogs(rl.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    socket.on('new_log', (log) => {
      setRecentLogs(prev => [log, ...prev].slice(0, 20))
      setOverview(prev => prev ? { ...prev, total_logs: prev.total_logs + 1 } : prev)
    })
    return () => { clearInterval(interval); socket.off('new_log') }
  }, [])

  const statCards = overview ? [
    { title: 'Total Logs',      value: overview.total_logs,      icon: Database,      color: 'blue',  trend: 'up',   trendValue: '+12% today', delay: 0 },
    { title: 'Active Devices',  value: overview.active_devices,  icon: Monitor,       color: 'cyan',  trend: 'flat', trendValue: 'No change',  delay: 0.1 },
    { title: 'Critical Alerts', value: overview.critical_alerts, icon: AlertOctagon,  color: 'red',   trend: 'down', trendValue: '-3 resolved',delay: 0.2 },
    { title: 'Warnings',        value: overview.warnings,        icon: AlertTriangle, color: 'amber', trend: 'up',   trendValue: '+5 new',     delay: 0.3 },
  ] : []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time network & syslog intelligence</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          <Activity size={12} className="animate-pulse" />
          Live monitoring active
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : statCards.map(c => <StatCard key={c.title} {...c} />)}
      </div>

      {/* Row 1: area + pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="xl:col-span-2 gradient-border p-5">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">Logs per Hour</h3>
            <span className="text-xs text-slate-500">Last 24h</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourly}>
              <defs>
                <linearGradient id="lgBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} fill="url(#lgBlue)" name="Logs" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="gradient-border p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={severity} dataKey="count" nameKey="severity" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                {severity.map((e, i) => <Cell key={i} fill={severityColor(e.severity)} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#131E35', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {severity.slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: severityColor(s.severity) }} />
                  <span className="text-slate-400">{s.severity}</span>
                </div>
                <span className="text-slate-300 font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2: bar + recent alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="gradient-border p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Top Device Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={devices} layout="vertical">
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="hostname" type="category" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Logs" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="gradient-border p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Recent Alerts</h3>
          {!alerts?.length
            ? <p className="text-slate-600 text-sm text-center py-8">No active alerts</p>
            : <div className="space-y-2">
                {alerts.map(a => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/5 border border-white/5 transition-colors">
                    <SeverityBadge severity={a.severity} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 truncate">{a.message}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{fmtDate(a.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
          }
        </motion.div>
      </div>

      {/* Live feed */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="gradient-border">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-sm">Live Log Feed</h3>
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <span className="pulse-dot" style={{ width: 5, height: 5 }} /> Live
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead><tr><th>Time</th><th>Hostname</th><th>IP</th><th>Severity</th><th>Message</th></tr></thead>
            <tbody>
              {recentLogs.map((log, i) => (
                <motion.tr key={log.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <td className="whitespace-nowrap text-xs text-slate-500">{fmtDate(log.timestamp)}</td>
                  <td className="font-mono text-xs text-cyan-400">{log.hostname}</td>
                  <td className="font-mono text-xs text-slate-400">{log.ip_address}</td>
                  <td><SeverityBadge severity={log.severity} /></td>
                  <td className="max-w-xs truncate text-slate-400 text-xs">{log.message}</td>
                </motion.tr>
              ))}
              {!recentLogs.length && <tr><td colSpan={5} className="text-center py-8 text-slate-600 text-sm">Waiting for logs…</td></tr>}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

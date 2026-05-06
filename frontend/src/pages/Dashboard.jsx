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
    
    const onNewLog = (log) => {
      setRecentLogs(prev => [log, ...prev].slice(0, 20))
      setOverview(prev => {
        if (!prev) return prev;
        return { 
          ...prev, 
          total_logs: prev.total_logs + 1,
          warnings: log.severity === 'Warning' ? prev.warnings + 1 : prev.warnings
        }
      })
    }

    const onNewAlert = (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 5))
      setOverview(prev => prev ? { ...prev, critical_alerts: prev.critical_alerts + 1 } : prev)
    }

    socket.on('new_log', onNewLog)
    socket.on('new_alert', onNewAlert)
    
    return () => { 
      clearInterval(interval)
      socket.off('new_log', onNewLog)
      socket.off('new_alert', onNewAlert)
    }
  }, [])

  const statCards = overview ? [
    { title: 'Total Logs',      value: overview.total_logs,      icon: Database,      color: 'blue',  trend: 'up',   trendValue: '+12% today', delay: 0 },
    { title: 'Active Devices',  value: overview.active_devices,  icon: Monitor,       color: 'cyan',  trend: 'flat', trendValue: 'No change',  delay: 0.1 },
    { title: 'Critical Alerts', value: overview.critical_alerts, icon: AlertOctagon,  color: 'red',   trend: 'down', trendValue: '-3 resolved',delay: 0.2 },
    { title: 'Warnings',        value: overview.warnings,        icon: AlertTriangle, color: 'amber', trend: 'up',   trendValue: '+5 new',     delay: 0.3 },
  ] : []

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time network & syslog intelligence</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Activity size={14} className="animate-pulse" />
          Live monitoring active
        </motion.div>
      </div>

      {/* Stat cards */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : statCards.map(c => <StatCard key={c.title} {...c} />)}
      </motion.div>

      {/* Row 1: area + pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="xl:col-span-2 glass-strong gradient-border p-6 rounded-2xl relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex justify-between mb-6">
            <h3 className="font-bold text-white text-base tracking-wide">Logs per Hour</h3>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">Last 24h</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="lgBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(59,130,246,0.2)', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fill="url(#lgBlue)" name="Logs" dot={{ r: 0 }} activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="glass-strong gradient-border p-6 rounded-2xl relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="relative z-10 font-bold text-white text-base tracking-wide mb-6">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={severity} dataKey="count" nameKey="severity" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                {severity.map((e, i) => <Cell key={i} fill={severityColor(e.severity)} className="drop-shadow-lg" />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="relative z-10 space-y-2.5 mt-4">
            {severity.slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: severityColor(s.severity), boxShadow: `0 0 10px ${severityColor(s.severity)}80` }} />
                  <span className="text-slate-400 font-medium capitalize">{s.severity}</span>
                </div>
                <span className="text-white font-bold">{s.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2: bar + recent alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="glass-strong gradient-border p-6 rounded-2xl relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="relative z-10 font-bold text-white text-base tracking-wide mb-6">Top Device Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={devices} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="hostname" type="category" tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#3B82F6" radius={[0, 6, 6, 0]} name="Logs" maxBarSize={30}>
                {devices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#colorPv${index})`} />
                ))}
              </Bar>
              <defs>
                {devices.map((entry, index) => (
                  <linearGradient key={`colorPv${index}`} id={`colorPv${index}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={1}/>
                  </linearGradient>
                ))}
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }} className="glass-strong gradient-border p-6 rounded-2xl relative group overflow-hidden flex flex-col h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="relative z-10 font-bold text-white text-base tracking-wide mb-4">Recent Alerts</h3>
          <div className="flex-1 relative z-10">
            {!alerts?.length
              ? <div className="h-full flex items-center justify-center text-slate-500 text-sm italic py-8">No active alerts currently.</div>
              : <div className="space-y-3">
                  {alerts.map((a, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      key={a.id} 
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    >
                      <SeverityBadge severity={a.severity} />
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm text-slate-200 truncate font-medium">{a.message}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <Activity size={10} className="text-slate-600" />
                          {fmtDate(a.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
            }
          </div>
        </motion.div>
      </div>

      {/* Live feed */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="glass-strong gradient-border rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-white text-base tracking-wide">Live Log Feed</h3>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="pulse-dot" style={{ width: 6, height: 6 }} /> Live Stream
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left w-32">Time</th>
                <th className="text-left w-32">Hostname</th>
                <th className="text-left w-32">IP</th>
                <th className="text-left w-24">Severity</th>
                <th className="text-left">Message</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {recentLogs.map((log, i) => (
                  <motion.tr 
                    key={log.id || `${log.timestamp}-${i}`} 
                    initial={{ opacity: 0, backgroundColor: 'rgba(59, 130, 246, 0.2)' }} 
                    animate={{ opacity: 1, backgroundColor: 'transparent' }} 
                    transition={{ duration: 0.5 }}
                    className="hover:bg-white/[0.04] transition-colors duration-200"
                  >
                    <td className="whitespace-nowrap text-xs text-slate-500 font-medium">{fmtDate(log.timestamp)}</td>
                    <td className="font-mono text-xs text-cyan-400">{log.hostname}</td>
                    <td className="font-mono text-xs text-slate-400">{log.ip_address}</td>
                    <td><SeverityBadge severity={log.severity} /></td>
                    <td className="text-slate-300 text-sm font-medium">{log.message}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {!recentLogs.length && <tr><td colSpan={5} className="text-center py-12 text-slate-500 text-sm italic bg-white/[0.01]">Waiting for initial telemetry data…</td></tr>}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

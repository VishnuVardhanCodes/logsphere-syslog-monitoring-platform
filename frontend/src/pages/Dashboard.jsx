import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { 
  Database, Monitor, AlertTriangle, AlertOctagon, Activity, 
  Cpu, Server, Globe, ShieldAlert, ArrowUpRight, ArrowDownRight,
  RefreshCw, Clock, Filter
} from 'lucide-react'
import API from '../lib/api'
import socket from '../lib/socket'
import StatCard from '../components/StatCard'
import SeverityBadge from '../components/SeverityBadge'
import { SkeletonCard } from '../components/Skeleton'
import { fmtDate, severityColor } from '../lib/utils'
import AnalyticsModal from '../components/Modals/AnalyticsModal'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <p className="text-sm font-bold text-white">{p.name}: {p.value}</p>
        </div>
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

  const [modalData, setModalData] = useState(null)
  
  const [throughputRange, setThroughputRange] = useState('24h')
  const rangeRef = useRef('24h')

  const handleRangeChange = (range) => {
    setThroughputRange(range)
    rangeRef.current = range
    API.get(`/analytics/logs-per-hour?range=${range}`).then(res => setHourly(res.data)).catch(console.error)
  }

  const fetchAll = async () => {
    try {
      const [ov, hr, sv, dv, al, rl] = await Promise.all([
        API.get('/analytics/overview'),
        API.get(`/analytics/logs-per-hour?range=${rangeRef.current}`),
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
    const interval = setInterval(fetchAll, 5000)
    
    const onNewLog = (log) => {
      setRecentLogs(prev => [log, ...prev].slice(0, 15))
      setOverview(prev => prev ? ({ 
        ...prev, 
        total_logs: prev.total_logs + 1,
        warnings: log.severity === 'Warning' ? prev.warnings + 1 : prev.warnings
      }) : prev)
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
    { title: 'Total Ingested Logs', value: overview.total_logs, icon: Database, color: 'blue', trend: 'up', trendValue: '+12.5%', delay: 0 },
    { title: 'Active Network Devices', value: overview.active_devices, icon: Server, color: 'cyan', trend: 'up', trendValue: '+2', delay: 0.1 },
    { title: 'Critical Alert Events', value: overview.critical_alerts, icon: ShieldAlert, color: 'red', trend: 'down', trendValue: '-5.2%', delay: 0.2 },
    { title: 'Security Warnings', value: overview.warnings, icon: AlertTriangle, color: 'amber', trend: 'up', trendValue: '+3', delay: 0.3 },
  ] : []

  return (
    <div className="pb-10 space-y-8 animate-fade-in">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">Live Intelligence Active</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Security Command Center</h1>
          <p className="text-slate-500 text-sm mt-1">Global infrastructure monitoring and real-time telemetry analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-xs font-bold">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Clock size={14} />
            Auto-sync: 5s
          </div>
        </div>
      </header>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : statCards.map(c => <StatCard key={c.title} {...c} />)}
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Logs Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="xl:col-span-2 glass-strong border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity size={120} className="text-blue-500" />
          </div>
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Ingestion Throughput</h3>
              <p className="text-xs text-slate-500">Log entries processed per hour across all nodes</p>
            </div>
            <div className="flex items-center gap-2 bg-[#0B1120] p-1 rounded-xl border border-white/5">
              {['24h', '7d', '30d'].map(t => (
                <button 
                  key={t} 
                  onClick={() => handleRangeChange(t)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${t === throughputRange ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] cursor-pointer" onClick={() => setModalData({ title: 'Ingestion Throughput', data: hourly, columns: ['time', 'count'] })}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fill="url(#areaGrad)" name="Logs" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Severity Intelligence */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-strong border border-white/5 rounded-3xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white tracking-tight mb-1">Threat Vectors</h3>
          <p className="text-xs text-slate-500 mb-8">Severity distribution analytics</p>
          
          <div className="flex-1 min-h-[240px] cursor-pointer" onClick={() => setModalData({ title: 'Severity Distribution', data: severity, columns: ['severity', 'count'] })}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severity} dataKey="count" nameKey="severity" cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} stroke="none">
                  {severity.map((e, i) => <Cell key={i} fill={severityColor(e.severity)} className="outline-none" />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {severity.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: severityColor(s.severity), color: severityColor(s.severity) }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 uppercase truncate leading-none mb-1">{s.severity}</p>
                  <p className="text-sm font-black text-white">{s.count}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Secondary Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Device Health Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-strong border border-white/5 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white tracking-tight">Infrastructure Pulse</h3>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full uppercase">Top Assets</span>
          </div>
          <div className="h-[280px] cursor-pointer" onClick={() => setModalData({ title: 'Infrastructure Pulse', data: devices, columns: ['hostname', 'count'] })}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={devices} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="hostname" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} width={100} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                  {devices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : index === 1 ? '#06B6D4' : '#1E293B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Alerts Stream */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-strong border border-white/5 rounded-3xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white tracking-tight">Active Critical Alerts</h3>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-400/10 px-3 py-1 rounded-full animate-pulse uppercase">
              <ShieldAlert size={12} /> Live Feed
            </div>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {!alerts?.length ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                <RefreshCw size={24} className="opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest italic">No critical events detected</p>
              </div>
            ) : (
              alerts.map((a, i) => (
                <motion.div 
                  key={a.id}
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.8 + (i * 0.1) }}
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:border-red-500/20 hover:bg-red-500/5 transition-all cursor-pointer"
                >
                  <div className={`p-2.5 rounded-xl ${a.severity === 'Critical' ? 'bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-amber-500/10 text-amber-500'}`}>
                    <AlertOctagon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-white group-hover:text-red-400 transition-colors truncate">{a.message}</p>
                      <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">{fmtDate(a.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{a.hostname || 'Global System'}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-700" />
                      <SeverityBadge severity={a.severity} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Real-time Ingestion Feed */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-strong border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-black text-white tracking-tight uppercase">Global Telemetry Stream</h3>
            <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Real-time</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Filter size={14} />
              <span className="text-[10px] font-bold uppercase">All severities</span>
            </div>
            <div className="h-4 w-[1px] bg-white/5" />
            <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">View All Logs</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hostname</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source IP</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Severity</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payload Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              <AnimatePresence mode="popLayout">
                {recentLogs.map((log, i) => (
                  <motion.tr 
                    key={log.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="hover:bg-white/[0.03] group transition-all"
                  >
                    <td className="px-8 py-4 whitespace-nowrap text-xs font-mono text-slate-500">{fmtDate(log.timestamp)}</td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Server size={12} className="text-blue-500 opacity-40" />
                        <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{log.hostname}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-xs font-mono text-slate-400 opacity-60">{log.ip_address}</td>
                    <td className="px-8 py-4 whitespace-nowrap"><SeverityBadge severity={log.severity} /></td>
                    <td className="px-8 py-4 text-sm font-medium text-slate-300 max-w-[400px] truncate">{log.message}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {!recentLogs.length && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <RefreshCw size={40} className="animate-spin text-blue-500" />
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-white">Listening for telemetry...</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnalyticsModal 
        isOpen={!!modalData} 
        onClose={() => setModalData(null)} 
        title={modalData?.title} 
        data={modalData?.data} 
        columns={modalData?.columns} 
      />
    </div>
  )
}

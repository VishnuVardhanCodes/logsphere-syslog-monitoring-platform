import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { RefreshCw, TrendingUp } from 'lucide-react'
import API from '../lib/api'
import { severityColor } from '../lib/utils'

const GlassChart = ({ title, subtitle, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="gradient-border p-5"
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-semibold text-white text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <TrendingUp size={15} className="text-blue-400 opacity-60" />
    </div>
    {children}
  </motion.div>
)

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs border border-blue-500/20">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function Analytics() {
  const [hourly, setHourly] = useState([])
  const [severity, setSeverity] = useState([])
  const [devices, setDevices] = useState([])
  const [alertTrend, setAlertTrend] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [h, s, d, a] = await Promise.all([
        API.get('/analytics/logs-per-hour'),
        API.get('/analytics/severity-distribution'),
        API.get('/analytics/device-activity'),
        API.get('/analytics/alert-trends'),
      ])
      setHourly(h.data); setSeverity(s.data); setDevices(d.data); setAlertTrend(a.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Syslog traffic patterns & network insights</p>
        </div>
        <button onClick={fetchAll} className="btn-ghost text-xs py-2 px-3"><RefreshCw size={13} /> Refresh</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GlassChart title="Logs per Hour" subtitle="Last 24 hours" delay={0.1}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hourly}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} />
              <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} fill="url(#ag1)" name="Logs" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassChart>

        <GlassChart title="Alert Trends" subtitle="Last 7 days" delay={0.15}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={alertTrend}>
              <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} />
              <Line type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 3 }} name="Alerts" />
            </LineChart>
          </ResponsiveContainer>
        </GlassChart>

        <GlassChart title="Device Activity" subtitle="Top 10 devices by log volume" delay={0.2}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={devices} layout="vertical">
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="hostname" type="category" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} width={115} />
              <Tooltip content={<TT />} />
              <Bar dataKey="count" fill="#06B6D4" radius={[0, 4, 4, 0]} name="Logs" />
            </BarChart>
          </ResponsiveContainer>
        </GlassChart>

        <GlassChart title="Severity Distribution" subtitle="All-time breakdown" delay={0.25}>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={severity} dataKey="count" nameKey="severity" cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {severity.map((e, i) => <Cell key={i} fill={severityColor(e.severity)} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#131E35', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {severity.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: severityColor(s.severity) }} />
                    <span className="text-slate-400">{s.severity}</span>
                  </div>
                  <span className="text-slate-300 font-medium">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassChart>
      </div>

      {/* AI Insights placeholder */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="gradient-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">AI Insights</h3>
            <p className="text-xs text-slate-500">Automated anomaly detection & pattern analysis</p>
          </div>
          <span className="ml-auto text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">Coming Soon</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Anomaly Detection', 'Pattern Recognition', 'Predictive Alerts'].map((t) => (
            <div key={t} className="bg-white/3 rounded-lg p-4 border border-white/5">
              <p className="text-sm font-medium text-slate-400 mb-1">{t}</p>
              <div className="skeleton h-3 w-full rounded mb-1" />
              <div className="skeleton h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

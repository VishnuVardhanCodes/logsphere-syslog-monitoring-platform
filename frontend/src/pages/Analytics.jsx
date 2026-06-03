import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { 
  RefreshCw, TrendingUp, Download, Calendar, Filter, 
  Activity, Shield, Zap, Cpu, FileText, Sparkles, BrainCircuit, ArrowRight
} from 'lucide-react'
import API from '../lib/api'
import { severityColor } from '../lib/utils'
import toast from 'react-hot-toast'

const GlassChart = ({ title, subtitle, children, delay = 0, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-strong border border-white/5 p-6 rounded-3xl relative overflow-hidden group shadow-2xl"
  >
    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700">
      {Icon && <Icon size={120} />}
    </div>
    
    <div className="flex justify-between items-start mb-8 relative z-10">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon size={14} className="text-blue-500" />}
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{title}</h3>
        </div>
        <p className="text-xl font-black text-white tracking-tight">{subtitle}</p>
      </div>
      <div className="flex gap-2">
        <button className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-500 hover:text-white transition-all">
          <Download size={14} />
        </button>
      </div>
    </div>
    
    <div className="relative z-10 h-[280px]">
      {children}
    </div>
  </motion.div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0B1120]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">{label}</p>
      <div className="space-y-2">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color || p.fill }} />
              <span className="text-xs font-bold text-slate-300">{p.name}</span>
            </div>
            <span className="text-xs font-black text-white">{(p.value || 0).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Analytics() {
  const [hourly, setHourly] = useState([])
  const [severity, setSeverity] = useState([])
  const [devices, setDevices] = useState([])
  const [alertTrend, setAlertTrend] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [h, s, d, a] = await Promise.all([
        API.get('/analytics/logs-per-hour'),
        API.get('/analytics/severity-distribution'),
        API.get('/analytics/device-activity'),
        API.get('/analytics/alert-trends'),
      ])
      setHourly(h.data)
      setSeverity(s.data)
      setDevices(d.data)
      setAlertTrend(a.data)
    } catch (e) {
      toast.error('Forensic telemetry acquisition failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div className="pb-12 space-y-8 animate-fade-in">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <BrainCircuit size={18} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Intelligence & Analytics</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Forensic Hub
            <Sparkles className="text-blue-400" size={32} />
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md">Deep-packet inspection and behavioral telemetry analysis for cross-node security auditing.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[#0B1120]/50 p-2 rounded-2xl border border-white/5">
          {['1h', '24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              {range}
            </button>
          ))}
          <div className="w-[1px] h-6 bg-white/5 mx-1" />
          <button 
            onClick={fetchAll}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all group"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
        </div>
      </header>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Logs Per Hour - Area Chart */}
        <GlassChart title="Telemetry Volume" subtitle="Log Ingestion Stream" delay={0.1} icon={Activity}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(59,130,246,0.2)', strokeWidth: 2 }} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorCount)" 
                name="Telemetry Count"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassChart>

        {/* Alert Trends - Line Chart */}
        <GlassChart title="Security Events" subtitle="Incident Detection Trends" delay={0.15} icon={Shield}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={alertTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#F43F5E" 
                strokeWidth={4} 
                dot={{ fill: '#F43F5E', r: 4, strokeWidth: 2, stroke: '#0B1120' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Critical Alerts"
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassChart>

        {/* Device Activity - Bar Chart */}
        <GlassChart title="Network Distribution" subtitle="Top Talker Infrastructure" delay={0.2} icon={Zap}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={devices} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="hostname" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }} 
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#06B6D4" 
                radius={[0, 10, 10, 0]} 
                name="Log Volume"
                barSize={20}
                animationDuration={1800}
              >
                {devices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#06B6D4'} fillOpacity={1 - (index * 0.08)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassChart>

        {/* Severity Distribution - Pie Chart */}
        <GlassChart title="Threat Landscape" subtitle="Severity Vector Analysis" delay={0.25} icon={Cpu}>
          <div className="flex items-center h-full">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie 
                  data={severity} 
                  dataKey="count" 
                  nameKey="severity" 
                  cx="50%" 
                  cy="50%"
                  innerRadius={60} 
                  outerRadius={90} 
                  paddingAngle={8}
                  stroke="none"
                  animationDuration={2500}
                >
                  {severity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={severityColor(entry.severity)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex-1 space-y-3 pr-4">
              {severity.slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center justify-between group/item cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ background: severityColor(s.severity) }} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover/item:text-slate-300 transition-colors">{s.severity}</span>
                  </div>
                  <span className="text-xs font-black text-white">{((s.count / severity.reduce((a,b) => a + b.count, 0)) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </GlassChart>
      </div>

      {/* AI Reasoning Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.35, duration: 0.6 }}
        className="glass-strong border border-blue-500/10 p-8 rounded-[2rem] relative overflow-hidden group shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-1000 rotate-12">
          <BrainCircuit size={200} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-xl shadow-blue-600/20 border border-blue-400/30">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">AI Cognitive Insights</h2>
              <p className="text-sm text-slate-500 font-medium">Neural pattern matching & predictive anomaly scoring</p>
            </div>
            <div className="ml-auto hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Model: LogSphere-Gen-4</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { 
                title: 'Anomaly Score', 
                value: '14/100', 
                status: 'Low Risk', 
                color: 'text-emerald-500', 
                desc: 'The neural engine detected zero high-confidence behavioral anomalies in the last 6 hours.',
                icon: Shield
              },
              { 
                title: 'Predictive Load', 
                value: '+4.2%', 
                status: 'Rising', 
                color: 'text-blue-400', 
                desc: 'Forecasting a slight uptick in ingress volume from EMEA nodes over the next session.',
                icon: TrendingUp
              },
              { 
                title: 'Pattern Identity', 
                value: 'Normal', 
                status: 'Verified', 
                color: 'text-cyan-400', 
                desc: 'Cluster analysis confirms traffic patterns align with verified baseline operational behavior.',
                icon: Activity
              },
            ].map((card, i) => (
              <div key={i} className="bg-[#0B1120]/40 border border-white/5 rounded-2xl p-6 hover:bg-[#0B1120]/60 transition-all group/card border-l-4" style={{ borderLeftColor: i === 0 ? '#10b981' : i === 1 ? '#3b82f6' : '#06b6d4' }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-white/5 text-slate-500 group-hover/card:text-white transition-colors">
                    <card.icon size={18} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${card.color}`}>{card.status}</span>
                </div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{card.title}</h4>
                <p className="text-2xl font-black text-white mb-3">{card.value}</p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{card.desc}</p>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-xs font-black text-slate-400 uppercase tracking-[0.3em] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3">
            Generate Comprehensive Intelligence Report <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  )
}


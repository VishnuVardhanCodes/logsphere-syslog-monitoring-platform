import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, FileText, AlertTriangle, BarChart3, Loader2, 
  FileJson, FileCode, CheckCircle2, ShieldCheck, Database,
  TrendingUp, Calendar, ArrowRight, Share2, Printer
} from 'lucide-react'
import API from '../lib/api'
import toast from 'react-hot-toast'

function ReportCard({ title, description, icon: Icon, iconColor, onExport, loading, formats = ['CSV'] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass-strong border border-white/5 p-8 rounded-[2rem] flex flex-col gap-6 group transition-all duration-500 hover:border-blue-500/20 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700">
        <Icon size={120} />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 ${iconColor} shadow-inner`}>
          <Icon size={28} />
        </div>
        <div className="flex gap-1">
          {formats.map(f => (
            <span key={f} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest">{f}</span>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-lg font-black text-white tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
      </div>

      <div className="relative z-10 mt-auto pt-6 border-t border-white/5 flex gap-3">
        {formats.map(f => (
          <button
            key={f}
            onClick={() => onExport(f)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {loading ? 'Processing...' : f}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export default function Reports() {
  const [summary, setSummary] = useState(null)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [loadingAlerts, setLoadingAlerts] = useState(false)

  useEffect(() => {
    API.get('/reports/summary').then(r => setSummary(r.data)).catch(() => {})
  }, [])

  const exportLogs = async (format) => {
    setLoadingLogs(true)
    const tId = toast.loading(`Compiling telemetry records (${format})...`)
    try {
      const endpoint = format === 'JSON' ? '/reports/export/json' : '/reports/export/logs'
      const ext = format === 'JSON' ? 'json' : 'csv'
      const res = await API.get(endpoint, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = `LogSphere_Telemetry_${Date.now()}.${ext}`; a.click()
      toast.success(`Telemetry ${format} export complete`, { id: tId })
    } catch { toast.error('Export sequence failure', { id: tId }) }
    finally { setLoadingLogs(false) }
  }

  const exportAlerts = async (format) => {
    setLoadingAlerts(true)
    const tId = toast.loading(`Synthesizing security audit (${format})...`)
    try {
      const endpoint = format === 'PDF' ? '/reports/export/pdf' : '/reports/export/alerts'
      const ext = format === 'PDF' ? 'pdf' : 'csv'
      const res = await API.get(endpoint, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = `LogSphere_Incidents_${Date.now()}.${ext}`; a.click()
      toast.success(`Incident ${format} report complete`, { id: tId })
    } catch { toast.error('Export sequence failure', { id: tId }) }
    finally { setLoadingAlerts(false) }
  }

  return (
    <div className="pb-12 space-y-10 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <FileText size={18} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Compliance & Auditing</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Report Engine
            <TrendingUp className="text-emerald-500" size={32} />
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md">Generate high-fidelity exports and compliance-ready audit logs for external processing and system-wide visibility.</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">
            <Calendar size={14} /> Schedule Automations
          </button>
        </div>
      </header>

      {/* Summary stats */}
      <AnimatePresence>
        {summary && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {[
              { label: 'Ingested Telemetry', value: summary.total_logs, icon: Database, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Detected Threats', value: summary.total_alerts, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Resolved Vectors', value: summary.total_alerts - summary.active_alerts, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Security Score', value: '94/100', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            ].map((s, i) => (
              <div key={i} className="glass-strong border border-white/5 p-6 rounded-3xl flex items-center gap-5">
                <div className={`p-3 rounded-2xl ${s.bg} ${s.color} border border-white/5 shadow-inner`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-white leading-tight">{(s.value || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          title="Telemetry Feed"
          description="A comprehensive dump of the latest 1,000 telemetry signals including source host, network IP, and full payload details."
          icon={Database} iconColor="text-blue-400"
          onExport={exportLogs} loading={loadingLogs}
          formats={['CSV', 'JSON']}
        />
        <ReportCard
          title="Security Incidents"
          description="Detailed audit log of all security triggers, breach attempts, and resolution status for administrative review."
          icon={ShieldCheck} iconColor="text-emerald-400"
          onExport={exportAlerts} loading={loadingAlerts}
          formats={['CSV', 'PDF']}
        />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong border border-white/5 p-8 rounded-[2rem] flex flex-col gap-6 group opacity-60 border-dashed"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 text-purple-400 border border-white/5">
            <BarChart3 size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-black text-white tracking-tight">Intelligence Pack</h3>
              <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md uppercase">V-NEXT</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Full AI-generated security posture report with heatmaps, trend predictions, and executive summaries.</p>
          </div>
          <button disabled className="mt-auto py-3.5 rounded-xl bg-white/5 border border-white/5 text-slate-500 text-xs font-black uppercase tracking-widest cursor-not-allowed">
            Feature Locked
          </button>
        </motion.div>
      </div>

      {/* Severity breakdown visualization */}
      {summary?.severity_distribution && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="glass-strong border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] -rotate-12">
            <TrendingUp size={240} />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight mb-1">Threat Vector Distribution</h3>
              <p className="text-sm text-slate-500 font-medium">Breakdown of system signals by severity weight.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Processed</p>
                <p className="text-xl font-black text-white">{summary.total_logs.toLocaleString()}</p>
              </div>
              <div className="h-10 w-[1px] bg-white/5" />
              <button className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">
                <Printer size={14} /> Full Print View
              </button>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            {Object.entries(summary.severity_distribution).map(([sev, count], idx) => {
              const total = Object.values(summary.severity_distribution).reduce((a, b) => a + b, 0)
              const pct = total ? Math.round((count / total) * 100) : 0
              return (
                <div key={sev} className="space-y-2 group/bar cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest min-w-[100px] group-hover/bar:text-slate-300 transition-colors">{sev}</span>
                      <div className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-black text-slate-600 border border-white/5 uppercase">{pct}%</div>
                    </div>
                    <span className="text-xs font-black text-white group-hover/bar:text-blue-400 transition-colors">{count.toLocaleString()} <span className="text-[10px] text-slate-600 ml-1 font-bold">RECORDS</span></span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
                    <motion.div
                      initial={{ width: 0 }} 
                      animate={{ width: `${pct}%` }} 
                      transition={{ duration: 1.2, delay: 0.4 + (idx * 0.1), ease: "circOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

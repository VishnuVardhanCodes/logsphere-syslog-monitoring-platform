import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, AlertTriangle, BarChart3, Loader2 } from 'lucide-react'
import API from '../lib/api'
import toast from 'react-hot-toast'

function ReportCard({ title, description, icon: Icon, iconColor, onExport, loading }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="gradient-border p-6 flex flex-col gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 ${iconColor}`}>
        <Icon size={22} />
      </div>
      <div>
        <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onExport}
        disabled={loading}
        className="btn-primary mt-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {loading ? 'Generating…' : 'Export CSV'}
      </button>
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

  const exportLogs = async () => {
    setLoadingLogs(true)
    try {
      const res = await API.get('/reports/export/logs', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = 'logsphere_logs.csv'; a.click()
      toast.success('Logs exported successfully')
    } catch { toast.error('Export failed') }
    finally { setLoadingLogs(false) }
  }

  const exportAlerts = async () => {
    setLoadingAlerts(true)
    try {
      const res = await API.get('/reports/export/alerts', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = 'logsphere_alerts.csv'; a.click()
      toast.success('Alerts exported successfully')
    } catch { toast.error('Export failed') }
    finally { setLoadingAlerts(false) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Export and generate system reports</p>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Logs',    value: summary.total_logs,    color: 'text-blue-400' },
            { label: 'Total Alerts',  value: summary.total_alerts,  color: 'text-amber-400' },
            { label: 'Active Alerts', value: summary.active_alerts, color: 'text-red-400' },
            { label: 'Severities',    value: Object.keys(summary.severity_distribution).length, color: 'text-purple-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="gradient-border p-4 text-center">
              <p className={`text-3xl font-bold ${color}`}>{value?.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Export cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ReportCard
          title="Logs Report"
          description="Export up to 1,000 recent syslog entries including timestamp, hostname, IP, severity, and message fields."
          icon={FileText} iconColor="text-blue-400"
          onExport={exportLogs} loading={loadingLogs}
        />
        <ReportCard
          title="Alerts Report"
          description="Export all alert records with severity, status, and timestamps for compliance and incident review."
          icon={AlertTriangle} iconColor="text-amber-400"
          onExport={exportAlerts} loading={loadingAlerts}
        />
        <motion.div whileHover={{ y: -2 }} className="gradient-border p-6 flex flex-col gap-4 opacity-60">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 text-purple-400">
            <BarChart3 size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white text-sm">Analytics Report</h3>
              <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-full">Soon</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">Scheduled PDF reports with charts and executive summaries.</p>
          </div>
          <button disabled className="btn-primary mt-auto justify-center opacity-50 cursor-not-allowed">
            <Download size={14} /> PDF Export
          </button>
        </motion.div>
      </div>

      {/* Severity breakdown */}
      {summary?.severity_distribution && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="gradient-border p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Severity Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(summary.severity_distribution).map(([sev, count]) => {
              const total = Object.values(summary.severity_distribution).reduce((a, b) => a + b, 0)
              const pct = total ? Math.round((count / total) * 100) : 0
              return (
                <div key={sev} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-20 shrink-0">{sev}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: 0.3 }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-12 text-right">{count} <span className="text-slate-600">({pct}%)</span></span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

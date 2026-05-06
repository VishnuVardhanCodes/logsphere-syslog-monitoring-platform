import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Trash2, RefreshCw, AlertOctagon } from 'lucide-react'
import API from '../lib/api'
import SeverityBadge from '../components/SeverityBadge'
import { SkeletonRow } from '../components/Skeleton'
import { fmtDate } from '../lib/utils'
import toast from 'react-hot-toast'
import socket from '../lib/socket'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 25 }
      if (statusFilter) params.status = statusFilter
      const res = await API.get('/alerts/', { params })
      setAlerts(res.data.alerts)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch { toast.error('Failed to load alerts') }
    finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { 
    fetchAlerts() 
    const handleNewAlert = (alert) => {
      if (statusFilter === '' || statusFilter === alert.status) {
        setAlerts(prev => [alert, ...prev].slice(0, 25))
        setTotal(prev => prev + 1)
      }
    }
    socket.on('new_alert', handleNewAlert)
    return () => socket.off('new_alert', handleNewAlert)
  }, [fetchAlerts, statusFilter])

  const resolve = async (id) => {
    try {
      await API.put(`/alerts/${id}/resolve`)
      toast.success('Alert resolved')
      fetchAlerts()
    } catch { toast.error('Failed to resolve') }
  }

  const remove = async (id) => {
    try {
      await API.delete(`/alerts/${id}`)
      toast.success('Alert deleted')
      fetchAlerts()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} alert{total !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center gap-2">
          {['', 'active', 'resolved'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                statusFilter === s
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button onClick={fetchAlerts} className="btn-ghost text-xs py-1.5 px-3">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="gradient-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr><th>Created</th><th>Severity</th><th>Message</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => <SkeletonRow key={i} cols={5} />)
                : alerts.map((alert, i) => (
                    <motion.tr key={alert.id}
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <td className="text-xs text-slate-500 whitespace-nowrap font-mono">{fmtDate(alert.created_at)}</td>
                      <td><SeverityBadge severity={alert.severity} /></td>
                      <td className="max-w-md text-sm text-slate-300">{alert.message}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          alert.status === 'active'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {alert.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {alert.status === 'active' && (
                            <button onClick={() => resolve(alert.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                              <CheckCircle size={13} /> Resolve
                            </button>
                          )}
                          <button onClick={() => remove(alert.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
              }
              {!loading && !alerts.length && (
                <tr><td colSpan={5} className="text-center py-12">
                  <AlertOctagon size={32} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-600 text-sm">No alerts found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex justify-between items-center px-5 py-3 border-t border-white/5">
            <p className="text-xs text-slate-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn-ghost py-1 px-3 text-xs disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages} className="btn-ghost py-1 px-3 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, Trash2, RefreshCw, AlertOctagon, ShieldAlert, 
  ShieldCheck, Clock, ArrowRight, Filter, Search,
  BellRing, Flag, MoreHorizontal, Terminal, Activity
} from 'lucide-react'
import API from '../lib/api'
import SeverityBadge from '../components/SeverityBadge'
import { SkeletonRow } from '../components/Skeleton'
import { fmtDate } from '../lib/utils'
import socket from '../lib/socket'
import AlertDetailsModal from '../components/Modals/AlertDetailsModal'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // all, active, resolved
  const [selectedAlert, setSelectedAlert] = useState(null)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 25 }
      if (statusFilter) params.status = statusFilter
      const res = await API.get('/alerts/', { params })
      setAlerts(res.data.alerts)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch { toast.error('Security alert retrieval failed') }
    finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { 
    fetchAlerts() 
    const handleNewAlert = (alert) => {
      if (statusFilter === '' || statusFilter === alert.status) {
        setAlerts(prev => [alert, ...prev].slice(0, 25))
        setTotal(prev => prev + 1)
        toast.error(`NEW ALERT: ${alert.severity.toUpperCase()}`, {
          icon: '🚨',
          style: { background: '#7f1d1d', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
        })
      }
    }
    socket.on('new_alert', handleNewAlert)
    return () => socket.off('new_alert', handleNewAlert)
  }, [fetchAlerts, statusFilter])

  const resolve = async (id) => {
    try {
      await API.put(`/alerts/${id}/resolve`)
      toast.success('Incident resolved successfully')
      fetchAlerts()
    } catch { toast.error('Resolution sequence failed') }
  }

  const remove = async (id) => {
    try {
      await API.delete(`/alerts/${id}`)
      toast.success('Incident record purged')
      fetchAlerts()
    } catch { toast.error('Purge sequence failed') }
  }

  return (
    <div className="pb-12 space-y-8 animate-fade-in">
      {/* Page Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <ShieldAlert size={18} className="animate-pulse" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Incident Command Center</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Threat Sentinel
            <BellRing className="text-blue-500" size={32} />
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md">Real-time threat detection and incident response management for all infrastructure layers.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[#0B1120]/50 p-2 rounded-2xl border border-white/5 shadow-2xl">
          {[
            { id: '', label: 'All Incidents', icon: Activity },
            { id: 'active', label: 'Active Threats', icon: ShieldAlert },
            { id: 'resolved', label: 'Resolved', icon: ShieldCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(1); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
          <div className="w-[1px] h-6 bg-white/5 mx-1" />
          <button 
            onClick={fetchAlerts}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all group"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
        </div>
      </header>

      {/* Alert Stats / Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-strong border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <Activity size={100} />
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Active Threat Exposure</p>
          <p className="text-4xl font-black text-white">{alerts.filter(a => a.status === 'active').length}</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-red-500">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
            LIVE MONITORING ACTIVE
          </div>
        </div>
        
        <div className="glass-strong border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <ShieldCheck size={100} />
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Mean Time To Resolve</p>
          <p className="text-4xl font-black text-white">12.4m</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500">
            <Clock size={12} />
            8% FASTER THAN PREV WEEK
          </div>
        </div>

        <div className="glass-strong border border-white/5 p-6 rounded-3xl relative overflow-hidden group bg-gradient-to-br from-blue-600/10 to-indigo-600/10">
          <div className="absolute top-0 right-0 p-8 opacity-[0.1] group-hover:opacity-[0.2] transition-opacity">
            <Flag size={100} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Priority</p>
          <p className="text-4xl font-black text-white">{alerts.filter(a => ['critical', 'error', 'emergency', 'alert'].includes(a.severity.toLowerCase())).length}</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-400">
            <Terminal size={12} />
            REQUIRES IMMEDIATE ACTION
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {loading && alerts.length === 0 ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="glass-strong border border-white/5 p-6 rounded-3xl h-32 animate-pulse" />
            ))
          ) : alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.02 }}
              className={`
                group glass-strong border p-6 rounded-3xl flex flex-col md:flex-row md:items-center gap-6 transition-all duration-300
                ${alert.status === 'active' ? 'border-red-500/10 hover:border-red-500/30' : 'border-white/5 hover:border-white/10 opacity-70'}
              `}
            >
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="hidden sm:flex flex-col items-center gap-1 min-w-[100px]">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Incident Timestamp</p>
                  <p className="text-[11px] font-mono text-slate-400">{fmtDate(alert.created_at)}</p>
                </div>
                
                <div className="h-10 w-[1px] bg-white/5 hidden sm:block" />
                
                <div className="shrink-0">
                  <SeverityBadge severity={alert.severity} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${alert.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <p className={`text-[10px] font-black uppercase tracking-widest ${alert.status === 'active' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {alert.status === 'active' ? 'Security Incident' : 'Resolved Record'}
                    </p>
                  </div>
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors leading-relaxed">
                    {alert.message}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
                {alert.status === 'active' && (
                  <button 
                    onClick={() => resolve(alert.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5"
                  >
                    Resolve Incident
                  </button>
                )}
                <button 
                  onClick={() => remove(alert.id)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => setSelectedAlert(alert)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white transition-all"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && alerts.length === 0 && (
          <div className="py-32 flex flex-col items-center text-center">
            <div className="p-8 rounded-full bg-white/[0.02] border border-white/5 text-slate-700 mb-6 shadow-inner">
              <ShieldCheck size={64} strokeWidth={1} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Perimeter Secured</h3>
            <p className="text-sm text-slate-500 max-w-sm">No security incidents detected matching your current filtering parameters. System state is currently optimal.</p>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between pt-8 px-6">
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                Page <span className="text-blue-500">{page}</span> of <span className="text-slate-400">{pages}</span>
              </p>
              <div className="h-4 w-[1px] bg-white/5" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                Total: <span className="text-slate-400">{total}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPage(p => Math.max(1, p-1))} 
                disabled={page === 1}
                className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(pages, p+1))} 
                disabled={page === pages}
                className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AlertDetailsModal 
        isOpen={!!selectedAlert} 
        onClose={() => setSelectedAlert(null)} 
        alert={selectedAlert} 
        onUpdate={fetchAlerts}
      />
    </div>
  )
}

import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight, 
  ChevronDown, Wifi, WifiOff, FileText, Share2, MoreHorizontal,
  LayoutGrid, List, Terminal, Activity, Shield
} from 'lucide-react'
import API from '../lib/api'
import socket from '../lib/socket'
import SeverityBadge from '../components/SeverityBadge'
import { SkeletonRow } from '../components/Skeleton'
import { fmtDate } from '../lib/utils'
import toast from 'react-hot-toast'
import HostHealthModal from '../components/Modals/HostHealthModal'
import AnomalyReportModal from '../components/Modals/AnomalyReportModal'

const SEVERITIES = ['Emergency','Alert','Critical','Error','Warning','Notice','Info','Debug']

export default function LiveLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filters, setFilters] = useState({ severity: '', ip: '', hostname: '', search: '' })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [healthModalTarget, setHealthModalTarget] = useState(null)
  const [anomalyTarget, setAnomalyTarget] = useState(null)

  const fetchLogs = useCallback(async (p = page) => {
    setLoading(true)
    try {
      const params = { page: p, per_page: 50, ...filters }
      Object.keys(params).forEach(k => !params[k] && delete params[k])
      const res = await API.get('/logs/', { params })
      setLogs(res.data.logs)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch (e) {
      toast.error('Telemetry acquisition failed')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchLogs(page) }, [page])
  
  // Debounced search/filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchLogs(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [filters, fetchLogs])

  useEffect(() => {
    if (!live) return
    const handler = (log) => {
      // Basic client-side filter check to keep live feed clean
      const matchesSearch = !filters.search || 
        log.message.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.hostname.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.ip_address.includes(filters.search)
      
      const matchesSeverity = !filters.severity || log.severity === filters.severity
      
      if (matchesSearch && matchesSeverity) {
        setLogs(prev => [log, ...prev].slice(0, 50))
        setTotal(prev => prev + 1)
      }
    }
    socket.on('new_log', handler)
    return () => socket.off('new_log', handler)
  }, [live, filters])

  const exportData = async (format) => {
    try {
      const res = await API.get(`/reports/export/logs?format=${format}`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `telemetry_export_${new Date().getTime()}.${format}`
      a.click()
      toast.success(`${format.toUpperCase()} export initiated`)
    } catch { toast.error('Export sequence failed') }
  }

  return (
    <div className="pb-12 space-y-6 animate-fade-in">
      {/* Page Header */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${live ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              {live ? <Wifi size={12} className="animate-pulse" /> : <WifiOff size={12} />}
              {live ? 'Live Stream Active' : 'Stream Paused'}
            </div>
            <span className="text-slate-700 font-bold">/</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{total.toLocaleString()} Records</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Telemetry Inspector
            <Activity className="text-blue-500" size={32} />
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-[#111827] border border-white/5 p-1 rounded-xl">
            <button onClick={() => setLive(true)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${live ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}>Stream</button>
            <button onClick={() => setLive(false)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!live ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-500 hover:text-slate-300'}`}>Pause</button>
          </div>
          
          <div className="h-8 w-[1px] bg-white/5 mx-2 hidden md:block" />

          <button onClick={() => exportData('csv')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all">
            <Download size={14} />
            Export CSV
          </button>
          
          <button onClick={() => fetchLogs()} className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Advanced Filter Controls */}
      <div className="glass-strong border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
          <Terminal size={120} />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={filters.search} 
              onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
              placeholder="Search global telemetry by message, hostname, or IP..."
              className="w-full bg-[#0B1120] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all focus:ring-4 focus:ring-blue-500/5" 
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Severity</label>
              <select 
                value={filters.severity} 
                onChange={e => setFilters(p => ({ ...p, severity: e.target.value }))}
                className="bg-[#0B1120] border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 focus:outline-none focus:border-blue-500/50 min-w-[160px] cursor-pointer"
              >
                <option value="">All Levels</option>
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Source Node</label>
              <input 
                value={filters.hostname} 
                onChange={e => setFilters(p => ({ ...p, hostname: e.target.value }))}
                placeholder="e.g. core-router-01"
                className="bg-[#0B1120] border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 w-48 transition-all" 
              />
            </div>

            <button 
              onClick={() => setFilters({ severity: '', ip: '', hostname: '', search: '' })}
              className="mt-auto h-[46px] px-6 rounded-xl border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500/10 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="glass-strong border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-20 bg-[#0F172A] border-b border-white/5">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Severity</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Hostname</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Facility</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Message Payload</th>
                <th className="px-6 py-5 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading && logs.length === 0 ? (
                Array(15).fill(0).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : (
                logs.map((log, i) => (
                  <Fragment key={log.id || i}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      onClick={() => setExpanded(expanded === (log.id || i) ? null : (log.id || i))}
                      className={`
                        group cursor-pointer transition-all duration-200
                        ${expanded === (log.id || i) ? 'bg-blue-500/5' : 'hover:bg-white/[0.03]'}
                      `}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-[11px] font-mono text-slate-500">
                        {fmtDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <SeverityBadge severity={log.severity} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40" />
                          <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                            {log.hostname}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                          {log.facility}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300 font-medium max-w-lg truncate group-hover:text-white transition-colors">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                            <Share2 size={14} />
                          </button>
                          <ChevronDown size={16} className={`text-slate-600 transition-transform duration-300 ${expanded === (log.id || i) ? 'rotate-180 text-blue-500' : ''}`} />
                        </div>
                      </td>
                    </motion.tr>
                    
                    <AnimatePresence>
                      {expanded === (log.id || i) && (
                        <motion.tr 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-[#0B1120]/60"
                        >
                          <td colSpan={6} className="px-12 py-8 border-b border-blue-500/10">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                              {/* Metadata Grid */}
                              <div className="lg:col-span-1 space-y-6">
                                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Extended Metadata</h4>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                  {[
                                    ['Event ID', `#${log.id || 'N/A'}`],
                                    ['Timestamp', fmtDate(log.timestamp)],
                                    ['Source Host', log.hostname],
                                    ['Network IP', log.ip_address],
                                    ['Severity', log.severity],
                                    ['Facility', log.facility],
                                    ['Device Type', log.device_type],
                                    ['Process ID', '4922']
                                  ].map(([k, v]) => (
                                    <div key={k}>
                                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">{k}</p>
                                      <p className="text-xs font-bold text-white break-all">{v}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Raw Payload Section */}
                              <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Raw Payload Trace</h4>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(log.message)
                                      toast.success("Payload copied successfully")
                                    }}
                                    className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest"
                                  >
                                    <FileText size={12} /> Copy Raw
                                  </button>
                                </div>
                                <div className="bg-black/40 rounded-2xl p-6 border border-white/5 relative overflow-hidden group/payload">
                                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover/payload:opacity-100 transition-opacity">
                                    <Terminal size={14} className="text-slate-600" />
                                  </div>
                                  <code className="text-xs text-blue-400 leading-relaxed font-mono whitespace-pre-wrap break-all">
                                    {log.message}
                                  </code>
                                </div>
                                
                                <div className="flex gap-4">
                                  <button onClick={() => setHealthModalTarget(log.hostname)} className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all">
                                    Inspect Host Health
                                  </button>
                                  <button onClick={() => setAnomalyTarget(log)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                    Report Anomaly
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))
              )}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 text-slate-700">
                        <Search size={48} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white mb-1">No telemetry found</p>
                        <p className="text-sm text-slate-500">Your filters didn't match any system logs in the last 7 days.</p>
                      </div>
                      <button 
                        onClick={() => setFilters({ severity: '', ip: '', hostname: '', search: '' })}
                        className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest"
                      >
                        Clear Active Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Control */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-8 py-6 border-t border-white/5 bg-[#0F172A]/50">
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                Page <span className="text-blue-500">{page}</span> of <span className="text-slate-400">{pages}</span>
              </p>
              <div className="h-4 w-[1px] bg-white/5" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                Total: <span className="text-slate-400">{total.toLocaleString()}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p-1))} 
                disabled={page === 1}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex gap-1">
                {[...Array(Math.min(5, pages))].map((_, i) => {
                  const pNum = page > 3 ? page - 2 + i : i + 1;
                  if (pNum > pages) return null;
                  return (
                    <button 
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${page === pNum ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setPage(p => Math.min(pages, p+1))} 
                disabled={page === pages}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <HostHealthModal 
        isOpen={!!healthModalTarget} 
        onClose={() => setHealthModalTarget(null)} 
        hostname={healthModalTarget} 
      />
      <AnomalyReportModal 
        isOpen={!!anomalyTarget} 
        onClose={() => setAnomalyTarget(null)} 
        defaultHostname={anomalyTarget?.hostname} 
        defaultDescription={`Suspicious activity detected on ${anomalyTarget?.hostname}: ${anomalyTarget?.message}`}
      />
    </div>
  )
}

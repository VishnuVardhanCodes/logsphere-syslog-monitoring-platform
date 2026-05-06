import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, Wifi } from 'lucide-react'
import API from '../lib/api'
import socket from '../lib/socket'
import SeverityBadge from '../components/SeverityBadge'
import { SkeletonRow } from '../components/Skeleton'
import { fmtDate } from '../lib/utils'
import toast from 'react-hot-toast'

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
  const [showFilters, setShowFilters] = useState(false)

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
      toast.error('Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchLogs(page) }, [page])
  useEffect(() => { setPage(1); fetchLogs(1) }, [filters])

  useEffect(() => {
    if (!live) return
    const handler = (log) => setLogs(prev => [log, ...prev].slice(0, 50))
    socket.on('new_log', handler)
    return () => socket.off('new_log', handler)
  }, [live])

  const exportCSV = async () => {
    try {
      const res = await API.get('/reports/export/logs', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = 'logs.csv'; a.click()
      toast.success('CSV exported')
    } catch { toast.error('Export failed') }
  }

  const FilterBadge = ({ label, value, field }) => value ? (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/15 text-blue-400 border border-blue-500/25">
      {label}: {value}
      <button onClick={() => setFilters(p => ({ ...p, [field]: '' }))} className="ml-1 hover:text-white">×</button>
    </span>
  ) : null

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Logs Monitor</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total.toLocaleString()} total entries</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLive(p => !p)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${live ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>
            <Wifi size={13} /> {live ? 'Live ON' : 'Live OFF'}
          </button>
          <button onClick={() => fetchLogs(page)} className="btn-ghost text-xs py-2 px-3">
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={exportCSV} className="btn-primary text-xs py-2 px-3">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="gradient-border p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
              placeholder="Search messages, hostnames, IPs…"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" />
          </div>
          <select value={filters.severity} onChange={e => setFilters(p => ({ ...p, severity: e.target.value }))}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 min-w-[130px] cursor-pointer">
            <option value="" className="bg-[#050A15] text-slate-300">All Severities</option>
            {SEVERITIES.map(s => <option key={s} value={s} className="bg-[#050A15] text-slate-300">{s}</option>)}
          </select>
          <input value={filters.ip} onChange={e => setFilters(p => ({ ...p, ip: e.target.value }))}
            placeholder="Filter IP…"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 w-36 transition-all" />
          <input value={filters.hostname} onChange={e => setFilters(p => ({ ...p, hostname: e.target.value }))}
            placeholder="Filter hostname…"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 w-40 transition-all" />
        </div>
        {/* Active filter badges */}
        <div className="flex flex-wrap gap-2">
          <FilterBadge label="Severity" value={filters.severity} field="severity" />
          <FilterBadge label="IP" value={filters.ip} field="ip" />
          <FilterBadge label="Host" value={filters.hostname} field="hostname" />
          <FilterBadge label="Search" value={filters.search} field="search" />
        </div>
      </div>

      {/* Table */}
      <div className="gradient-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Timestamp</th><th>Severity</th><th>Hostname</th>
                <th>IP Address</th><th>Facility</th><th>Device Type</th><th>Message</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(10).fill(0).map((_, i) => <SkeletonRow key={i} cols={8} />)
                : logs.map((log, i) => (
                    <>
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                        className="cursor-pointer"
                      >
                        <td className="whitespace-nowrap text-xs text-slate-500 font-mono">{fmtDate(log.timestamp)}</td>
                        <td><SeverityBadge severity={log.severity} /></td>
                        <td className="text-xs text-cyan-400 font-mono">{log.hostname}</td>
                        <td className="text-xs text-slate-400 font-mono">{log.ip_address}</td>
                        <td className="text-xs text-slate-500">{log.facility}</td>
                        <td className="text-xs text-purple-400">{log.device_type}</td>
                        <td className="max-w-sm truncate text-xs text-slate-400">{log.message}</td>
                        <td><ChevronDown size={14} className={`text-slate-600 transition-transform ${expanded === log.id ? 'rotate-180' : ''}`} /></td>
                      </motion.tr>
                      <AnimatePresence>
                        {expanded === log.id && (
                          <motion.tr key={`exp-${log.id}`}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <td colSpan={8} className="px-6 py-4 bg-blue-500/5 border-b border-blue-500/10">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-3">
                                {[['ID', log.id], ['Timestamp', fmtDate(log.timestamp)], ['Hostname', log.hostname], ['IP', log.ip_address],
                                  ['Severity', log.severity], ['Facility', log.facility], ['Device Type', log.device_type]].map(([k, v]) => (
                                  <div key={k}>
                                    <p className="text-slate-600 uppercase tracking-wider text-[10px] mb-0.5">{k}</p>
                                    <p className="text-slate-200 font-mono">{v}</p>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <p className="text-slate-600 uppercase tracking-wider text-[10px] mb-1">Full Message</p>
                                <p className="text-slate-300 text-xs font-mono bg-black/30 rounded px-3 py-2 break-all">{log.message}</p>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </>
                  ))
              }
              {!loading && !logs.length && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-600">No logs match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <p className="text-xs text-slate-500">Page {page} of {pages} · {total.toLocaleString()} total</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="btn-ghost py-1 px-2 text-xs disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
                className="btn-ghost py-1 px-2 text-xs disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

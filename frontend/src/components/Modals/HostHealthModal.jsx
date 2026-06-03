import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Activity, Server, AlertTriangle, AlertOctagon, Terminal } from 'lucide-react'
import API from '../../lib/api'
import { fmtDate } from '../../lib/utils'

export default function HostHealthModal({ isOpen, onClose, hostname }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !hostname) return
    const fetchHealth = async () => {
      setLoading(true)
      try {
        const res = await API.get(`/devices/health/${hostname}`)
        setData(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHealth()
  }, [isOpen, hostname])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="fixed z-[101] glass-strong rounded-[2rem] border border-white/10 p-8 w-full max-w-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Activity size={120} />
          </div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <Server className="text-blue-500" /> Host Health Report
              </h3>
              <p className="text-slate-400 text-sm mt-1">Diagnostic telemetry for {hostname}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400">
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-500 animate-pulse">Running diagnostics...</div>
          ) : data ? (
            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Health Score</p>
                  <p className="text-4xl font-black text-white">{data.health_score}/100</p>
                </div>
                <div className="p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-center">
                  <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-1"><AlertTriangle size={12}/> Warnings</p>
                  <p className="text-4xl font-black text-white">{data.warning_count}</p>
                </div>
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-1"><AlertOctagon size={12}/> Criticals</p>
                  <p className="text-4xl font-black text-white">{data.critical_count}</p>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Terminal size={14}/> Recent Activity Logs
                </h4>
                <div className="bg-black/40 rounded-xl border border-white/5 p-4 max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                  {data.recent_logs.map(log => (
                    <div key={log.id} className="text-xs font-mono pb-2 border-b border-white/5 last:border-0 last:pb-0">
                      <span className="text-slate-500">[{fmtDate(log.timestamp)}]</span>
                      <span className={`ml-2 font-bold ${log.severity === 'Critical' ? 'text-red-400' : log.severity === 'Warning' ? 'text-yellow-400' : 'text-blue-400'}`}>
                        {log.severity.toUpperCase()}
                      </span>
                      <span className="ml-2 text-slate-300">{log.message}</span>
                    </div>
                  ))}
                  {data.recent_logs.length === 0 && <p className="text-slate-500 text-xs">No recent logs found.</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-red-400">Failed to load diagnostics.</div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Server, Globe, ShieldCheck, Terminal, AlertOctagon } from 'lucide-react'
import API from '../../lib/api'
import { fmtDate } from '../../lib/utils'

export default function DeviceDetailModal({ isOpen, onClose, hostname }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !hostname) return
    const fetchDetails = async () => {
      setLoading(true)
      try {
        const res = await API.get(`/devices/${hostname}/detail`)
        setData(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
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
          className="fixed z-[101] glass-strong rounded-[2rem] border border-white/10 p-8 w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <Server className="text-emerald-500" /> Device Profile
              </h3>
              <p className="text-slate-400 text-sm mt-1">{hostname}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400">
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-500 animate-pulse">Loading device profile...</div>
          ) : data ? (
            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Globe size={12}/> IP Address</p>
                  <p className="text-sm font-bold text-white">{data.ip_address}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Device Type</p>
                  <p className="text-sm font-bold text-white">{data.device_type}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><ShieldCheck size={12}/> Last Seen</p>
                  <p className="text-sm font-bold text-white">{fmtDate(data.last_seen)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-sm font-bold text-emerald-400">Active</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertOctagon size={14}/> Incident History
                  </h4>
                  <div className="bg-black/40 rounded-xl border border-white/5 p-4 max-h-60 overflow-y-auto custom-scrollbar space-y-3">
                    {data.alerts.map(alert => (
                      <div key={alert.id} className="text-xs p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-bold ${alert.severity === 'Critical' ? 'text-red-400' : 'text-yellow-400'}`}>{alert.severity}</span>
                          <span className="text-slate-500 text-[10px]">{fmtDate(alert.created_at)}</span>
                        </div>
                        <p className="text-slate-300 font-mono break-all">{alert.message}</p>
                      </div>
                    ))}
                    {data.alerts.length === 0 && <p className="text-slate-500 text-xs text-center py-4">No recent security incidents.</p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Terminal size={14}/> Raw Telemetry Log
                  </h4>
                  <div className="bg-black/40 rounded-xl border border-white/5 p-4 max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                    {data.recent_logs.map(log => (
                      <div key={log.id} className="text-[10px] font-mono pb-2 border-b border-white/5 last:border-0 last:pb-0 text-slate-300">
                        <span className="text-blue-400">[{fmtDate(log.timestamp)}]</span> {log.message}
                      </div>
                    ))}
                    {data.recent_logs.length === 0 && <p className="text-slate-500 text-xs text-center py-4">No telemetry found.</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-red-400">Failed to load device profile.</div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

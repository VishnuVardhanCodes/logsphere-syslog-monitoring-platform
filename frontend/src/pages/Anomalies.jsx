import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, Trash2, CheckCircle, RefreshCw, Server, AlertTriangle } from 'lucide-react'
import API from '../lib/api'
import { fmtDate } from '../lib/utils'
import toast from 'react-hot-toast'

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAnomalies = async () => {
    setLoading(true)
    try {
      const res = await API.get('/anomalies/')
      setAnomalies(res.data.anomalies)
    } catch {
      toast.error('Failed to load anomalies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnomalies()
  }, [])

  const closeAnomaly = async (id) => {
    try {
      await API.put(`/anomalies/${id}/close`)
      toast.success('Anomaly closed')
      fetchAnomalies()
    } catch {
      toast.error('Failed to close anomaly')
    }
  }

  const deleteAnomaly = async (id) => {
    if(!window.confirm("Delete anomaly report?")) return
    try {
      await API.delete(`/anomalies/${id}`)
      toast.success('Anomaly deleted')
      fetchAnomalies()
    } catch {
      toast.error('Failed to delete anomaly')
    }
  }

  return (
    <div className="pb-12 space-y-8 animate-fade-in">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Anomaly Reports <AlertTriangle className="text-yellow-500" size={32} />
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md">Analyst reported system anomalies and potential security incidents.</p>
        </div>
        <button onClick={fetchAnomalies} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {anomalies.map((a, i) => (
            <motion.div key={a.id} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, scale:0.9}} className="glass-strong border border-white/5 rounded-3xl p-6 relative group overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${a.status === 'open' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {a.status}
                </div>
                <div className="text-[10px] font-mono text-slate-500">{fmtDate(a.created_at)}</div>
              </div>
              
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Server size={14} className="text-blue-500"/> {a.hostname}
              </h3>
              
              <div className="flex gap-2 mb-4">
                <span className="text-[9px] font-black px-2 py-1 bg-white/5 rounded text-slate-400">{a.severity}</span>
                <span className="text-[9px] font-black px-2 py-1 bg-white/5 rounded text-slate-400">{a.category}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 mb-4">
                <p className="text-xs text-slate-300 leading-relaxed">{a.description}</p>
              </div>

              {a.notes && (
                <div className="mb-4">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Analyst Notes</p>
                  <p className="text-xs text-slate-400">{a.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-white/5">
                {a.status === 'open' && (
                  <button onClick={() => closeAnomaly(a.id)} className="flex-1 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all">Close</button>
                )}
                <button onClick={() => deleteAnomaly(a.id)} className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={14}/></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && anomalies.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500">No anomalies reported yet.</div>
        )}
      </div>
    </div>
  )
}

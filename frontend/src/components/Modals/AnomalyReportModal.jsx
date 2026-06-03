import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldAlert, Loader2 } from 'lucide-react'
import API from '../../lib/api'
import toast from 'react-hot-toast'

export default function AnomalyReportModal({ isOpen, onClose, defaultHostname = '', defaultDescription = '' }) {
  const [form, setForm] = useState({
    hostname: defaultHostname,
    severity: 'Warning',
    category: 'Network',
    description: defaultDescription,
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const tId = toast.loading('Filing anomaly report...')
    try {
      await API.post('/anomalies/', form)
      toast.success('Anomaly reported successfully', { id: tId })
      onClose()
    } catch (err) {
      toast.error('Failed to report anomaly', { id: tId })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const inputClass = "w-full bg-[#0B1120] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition-all"

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
          className="fixed z-[101] glass-strong rounded-[2rem] border border-white/10 p-8 w-full max-w-lg overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <ShieldAlert className="text-red-500" /> Report Anomaly
            </h3>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Affected Hostname</label>
              <input required value={form.hostname} onChange={e => setForm({...form, hostname: e.target.value})} className={inputClass} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Severity</label>
                <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className={inputClass}>
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inputClass}>
                  <option value="Network">Network</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Security">Security</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
              <textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={inputClass} />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Analyst Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={inputClass} />
            </div>

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-400 text-xs font-bold uppercase hover:bg-white/10">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-500 flex justify-center items-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin" />} Submit Report
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

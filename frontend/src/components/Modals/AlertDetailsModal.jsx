import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldAlert, ArrowUpRight, UserPlus, FileText } from 'lucide-react'
import API from '../../lib/api'
import { fmtDate } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function AlertDetailsModal({ isOpen, onClose, alert, onUpdate }) {
  const [loading, setLoading] = useState(false)

  if (!isOpen || !alert) return null

  const handleEscalate = async () => {
    setLoading(true)
    const tId = toast.loading('Escalating alert...')
    try {
      await API.put(`/alerts/${alert.id}/escalate`)
      toast.success('Alert escalated successfully', { id: tId })
      onUpdate()
      onClose()
    } catch (err) {
      toast.error('Failed to escalate', { id: tId })
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    const assignee = window.prompt("Enter username to assign this alert:")
    if (!assignee) return
    setLoading(true)
    const tId = toast.loading('Assigning alert...')
    try {
      await API.put(`/alerts/${alert.id}/assign`, { assignee })
      toast.success(`Alert assigned to ${assignee}`, { id: tId })
      onUpdate()
      onClose()
    } catch (err) {
      toast.error('Failed to assign', { id: tId })
    } finally {
      setLoading(false)
    }
  }

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
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <ShieldAlert className="text-red-500" /> Incident Profile #{alert.id}
            </h3>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                <p className={`text-sm font-bold ${alert.status === 'active' ? 'text-red-400' : 'text-emerald-400'}`}>{alert.status.toUpperCase()}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Severity</p>
                <p className="text-sm font-bold text-white">{alert.severity}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Timestamp</p>
                <p className="text-sm font-bold text-white">{fmtDate(alert.created_at)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Assigned To</p>
                <p className="text-sm font-bold text-blue-400">{alert.assigned_to || 'Unassigned'}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><FileText size={12}/> Incident Description</p>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <p className="text-sm text-slate-300 font-mono break-all leading-relaxed">{alert.message}</p>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button disabled={loading} onClick={handleEscalate} className="flex-1 py-3 rounded-xl bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 text-xs font-bold uppercase hover:bg-yellow-600/40 flex justify-center items-center gap-2">
                <ArrowUpRight size={14} /> Escalate Alert
              </button>
              <button disabled={loading} onClick={handleAssign} className="flex-1 py-3 rounded-xl bg-blue-600/20 text-blue-500 border border-blue-600/30 text-xs font-bold uppercase hover:bg-blue-600/40 flex justify-center items-center gap-2">
                <UserPlus size={14} /> Assign Operator
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

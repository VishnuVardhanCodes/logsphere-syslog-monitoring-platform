import { motion, AnimatePresence } from 'framer-motion'
import { X, Table, Download } from 'lucide-react'

export default function AnalyticsModal({ isOpen, onClose, title, data, columns }) {
  if (!isOpen || !data) return null

  const handleExportCSV = () => {
    if (!data.length) return
    const headers = columns.join(',')
    const rows = data.map(row => columns.map(col => row[col]).join(','))
    const csv = [headers, ...rows].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_export.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
          className="fixed z-[101] glass-strong rounded-[2rem] border border-white/10 p-8 w-full max-w-3xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <Table className="text-blue-500" /> {title} - Raw Data
            </h3>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto custom-scrollbar border border-white/5 rounded-2xl mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  {columns.map(c => (
                    <th key={c} className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.01]">
                    {columns.map(c => (
                      <td key={c} className="px-6 py-4 text-sm text-slate-300 font-mono">{row[c]}</td>
                    ))}
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500 text-xs">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-all"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

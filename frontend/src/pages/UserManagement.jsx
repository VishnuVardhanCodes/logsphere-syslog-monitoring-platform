import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Plus, X, Trash2, Edit, Shield, Loader2, 
  Search, Filter, MoreVertical, Mail, Key, 
  Clock, ShieldAlert, ShieldCheck, UserPlus, UserCog
} from 'lucide-react'
import API from '../lib/api'
import { fmtDate } from '../lib/utils'
import toast from 'react-hot-toast'

function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[101] glass-strong rounded-[2.5rem] border border-white/10 p-8 w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">{title}</h3>
                <div className="h-1 w-12 bg-blue-500 rounded-full mt-2" />
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative z-10">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const emptyForm = { username: '', email: '', password: '', role: 'Admin' }

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try { 
      const r = await API.get('/users/')
      setUsers(r.data) 
    } catch { 
      toast.error('Identity database retrieval failure') 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const openCreate = () => { setEditUser(null); setForm(emptyForm); setModal(true) }
  const openEdit = (u) => { setEditUser(u); setForm({ username: u.username, email: u.email, password: '', role: u.role }); setModal(true) }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    const tId = toast.loading(editUser ? 'Synchronizing user profile...' : 'Provisioning new operator...')
    try {
      if (editUser) {
        await API.put(`/users/${editUser.id}`, form)
        toast.success('Identity profile updated', { id: tId })
      } else {
        await API.post('/users/', form)
        toast.success('Operator provisioned successfully', { id: tId })
      }
      setModal(false); fetchUsers()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Administrative action rejected', { id: tId })
    } finally { setSaving(false) }
  }

  const remove = async (id, username) => {
    if (!window.confirm(`Permanently de-provision user "${username}" from the system?`)) return
    const tId = toast.loading('Purging identity records...')
    try { 
      await API.delete(`/users/${id}`)
      toast.success('Identity purged successfully', { id: tId })
      fetchUsers() 
    } catch { 
      toast.error('Purge sequence failure', { id: tId }) 
    }
  }

  const inputClass = "w-full bg-[#0B1120] border border-white/5 rounded-2xl px-4 py-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner font-medium"

  const filtered = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="pb-12 space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-500 border border-purple-500/20">
              <Shield size={18} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Access Control (RBAC)</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Identity Node
            <UserCog className="text-purple-500" size={32} />
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md">Manage administrative clearance, operator identities, and system-wide permission structures.</p>
        </div>

        <button 
          onClick={openCreate} 
          className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <UserPlus size={16} /> Provision Operator
        </button>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative group w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by identity or mail..."
            className="w-full bg-[#0B1120] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" 
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{users.length} Active Operators</span>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="glass-strong border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operator Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Security Clearance</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Last Access</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Administrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-white/5" /><div className="space-y-2"><div className="h-4 w-32 bg-white/5 rounded" /><div className="h-3 w-24 bg-white/5 rounded" /></div></div></td>
                    <td className="px-8 py-6"><div className="h-6 w-24 bg-white/5 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-28 bg-white/5 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-10 w-10 bg-white/5 rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.map((u, i) => (
                <motion.tr 
                  key={u.id} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-all"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-lg border border-white/10 group-hover:scale-110 transition-transform">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white mb-0.5 group-hover:text-blue-400 transition-colors">{u.username}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                          <Mail size={10} /> {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'Super Admin'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    }`}>
                      <Shield size={10} /> {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                        <Clock size={10} className="text-slate-600" />
                        {fmtDate(u.created_at)}
                      </div>
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Initialization Logged</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEdit(u)} 
                        className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/20 transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => remove(u.id, u.username)} 
                        className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {!loading && !filtered.length && (
                <tr>
                  <td colSpan={4} className="py-32 text-center">
                    <div className="p-8 rounded-full bg-white/[0.02] border border-white/5 text-slate-700 mx-auto w-fit mb-6">
                      <Users size={64} strokeWidth={1} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No identities found</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">No system operators match your current search parameters or identity filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editUser ? 'Modify Clearance' : 'Provision Operator'}>
        <form onSubmit={save} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Users size={12} /> Username Identity
              </label>
              <input 
                type="text" 
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                disabled={!!editUser}
                placeholder="Ex: alpha_operator"
                required
                className={`${inputClass} ${editUser ? 'opacity-50 cursor-not-allowed grayscale' : ''}`} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail size={12} /> System Notification Email
              </label>
              <input 
                type="email" 
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="Ex: operator@logsphere.net"
                required
                className={inputClass} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Key size={12} /> Cryptographic Access Key
              </label>
              <input 
                type="password" 
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder={editUser ? '•••••••• (Encrypted)' : '••••••••'}
                required={!editUser}
                className={inputClass} 
              />
              {editUser && <p className="text-[10px] text-slate-600 font-medium italic">Leave blank to maintain current signature</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Shield size={12} /> Assigned Security Clearance
              </label>
              <div className="relative">
                <select 
                  value={form.role} 
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))} 
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="Admin" className="bg-[#0B1120]">Admin Clearance</option>
                  <option value="Super Admin" className="bg-[#0B1120]">Super Admin (Root Access)</option>
                </select>
                <MoreVertical size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none rotate-90" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => setModal(false)} 
              className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
            >
              Abort sequence
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="flex-2 flex items-center justify-center gap-3 py-4 px-10 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {editUser ? 'Confirm Update' : 'Provision Now'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, X, Trash2, Edit, Shield, Loader2 } from 'lucide-react'
import API from '../lib/api'
import { fmtDate } from '../lib/utils'
import toast from 'react-hot-toast'

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="glass-strong rounded-2xl border border-blue-500/20 p-6 w-full max-w-md shadow-glass"
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">{title}</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
          </div>
          {children}
        </motion.div>
      </motion.div>
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

  const fetchUsers = async () => {
    setLoading(true)
    try { const r = await API.get('/users/'); setUsers(r.data) }
    catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const openCreate = () => { setEditUser(null); setForm(emptyForm); setModal(true) }
  const openEdit = (u) => { setEditUser(u); setForm({ username: u.username, email: u.email, password: '', role: u.role }); setModal(true) }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editUser) {
        await API.put(`/users/${editUser.id}`, form)
        toast.success('User updated')
      } else {
        await API.post('/users/', form)
        toast.success('User created')
      }
      setModal(false); fetchUsers()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Operation failed')
    } finally { setSaving(false) }
  }

  const remove = async (id, username) => {
    if (!confirm(`Delete user "${username}"?`)) return
    try { await API.delete(`/users/${id}`); toast.success('User deleted'); fetchUsers() }
    catch { toast.error('Failed to delete user') }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition-all"

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage platform users and roles</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={15} /> Add User</button>
      </div>

      <div className="gradient-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr><th>Username</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}>{Array(5).fill(0).map((_, j) => <td key={j}><div className="skeleton h-4 rounded w-24" /></td>)}</tr>
                  ))
                : users.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                            {u.username[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-white font-medium">{u.username}</span>
                        </div>
                      </td>
                      <td className="text-slate-400 text-sm">{u.email}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.role === 'Super Admin'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                        }`}>
                          <Shield size={10} /> {u.role}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500">{fmtDate(u.created_at)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(u)} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-blue-400 hover:bg-blue-500/10 transition-colors">
                            <Edit size={12} /> Edit
                          </button>
                          <button onClick={() => remove(u.id, u.username)} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
              }
              {!loading && !users.length && (
                <tr><td colSpan={5} className="text-center py-12">
                  <Users size={32} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-600 text-sm">No users found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editUser ? 'Edit User' : 'Create New User'}>
        <form onSubmit={save} className="space-y-4">
          {[
            { label: 'Username', key: 'username', type: 'text', disabled: !!editUser },
            { label: 'Email',    key: 'email',    type: 'email' },
            { label: 'Password', key: 'password', type: 'password', placeholder: editUser ? 'Leave blank to keep current' : '' },
          ].map(({ label, key, type, disabled, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
              <input type={type} value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                disabled={disabled}
                placeholder={placeholder || ''}
                required={key !== 'password' || !editUser}
                className={`${inputClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className={inputClass}>
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : editUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

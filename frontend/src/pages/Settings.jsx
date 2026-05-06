import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Server, Bell, Shield, User, Save, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import API from '../lib/api'

function Section({ title, icon: Icon, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="gradient-border p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Icon size={18} /></div>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="md:w-56 shrink-0">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        {hint && <p className="text-xs text-slate-600 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const [syslogPort, setSyslogPort] = useState('5140')
  const [maxLogs, setMaxLogs] = useState('10000')
  const [notifCritical, setNotifCritical] = useState(true)
  const [notifWarning, setNotifWarning] = useState(true)
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  const saveGeneral = () => toast.success('Settings saved (demo)')

  const changePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setPwLoading(true)
    try {
      await API.put('/auth/change-password', { old_password: pwForm.old_password, new_password: pwForm.new_password })
      toast.success('Password changed successfully')
      setPwForm({ old_password: '', new_password: '', confirm: '' })
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to change password')
    } finally { setPwLoading(false) }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition-all"
  const toggle = (val, setter) => (
    <button onClick={() => setter(p => !p)}
      className={`relative w-10 h-5 rounded-full transition-colors ${val ? 'bg-blue-500' : 'bg-slate-700'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform configuration and preferences</p>
      </div>

      <Section title="Syslog Configuration" icon={Server}>
        <Field label="Syslog UDP Port" hint="Port used to receive syslog messages">
          <input value={syslogPort} onChange={e => setSyslogPort(e.target.value)} className={inputClass} placeholder="514" />
        </Field>
        <Field label="Max Log Retention" hint="Maximum logs to keep in database">
          <input value={maxLogs} onChange={e => setMaxLogs(e.target.value)} className={inputClass} placeholder="10000" />
        </Field>
        <div className="pt-3">
          <button onClick={saveGeneral} className="btn-primary"><Save size={14} /> Save Configuration</button>
        </div>
      </Section>

      <Section title="Notifications" icon={Bell}>
        <Field label="Critical Alerts" hint="Notify on Critical/Emergency/Alert severity">
          <div className="flex items-center gap-3">
            {toggle(notifCritical, setNotifCritical)}
            <span className="text-xs text-slate-500">{notifCritical ? 'Enabled' : 'Disabled'}</span>
          </div>
        </Field>
        <Field label="Warning Alerts" hint="Notify on Warning severity">
          <div className="flex items-center gap-3">
            {toggle(notifWarning, setNotifWarning)}
            <span className="text-xs text-slate-500">{notifWarning ? 'Enabled' : 'Disabled'}</span>
          </div>
        </Field>
      </Section>

      <Section title="Security – Change Password" icon={Shield}>
        <form onSubmit={changePassword} className="space-y-4">
          {[
            { label: 'Current Password', key: 'old_password', type: 'password' },
            { label: 'New Password',     key: 'new_password', type: 'password' },
            { label: 'Confirm Password', key: 'confirm',      type: 'password' },
          ].map(({ label, key, type }) => (
            <Field key={key} label={label}>
              <input type={type} value={pwForm[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                className={inputClass} placeholder="••••••••" required />
            </Field>
          ))}
          <div className="pt-2">
            <button type="submit" disabled={pwLoading} className="btn-primary disabled:opacity-50">
              {pwLoading ? 'Saving…' : <><Check size={14} /> Update Password</>}
            </button>
          </div>
        </form>
      </Section>

      <Section title="Account Info" icon={User}>
        <Field label="Username"><p className="text-sm text-slate-300 font-mono">{user?.username}</p></Field>
        <Field label="Email"><p className="text-sm text-slate-300">{user?.email || '—'}</p></Field>
        <Field label="Role">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/25">
            <Shield size={10} /> {user?.role}
          </span>
        </Field>
        <Field label="Member Since"><p className="text-sm text-slate-400">{new Date(user?.created_at).toLocaleDateString()}</p></Field>
      </Section>
    </div>
  )
}

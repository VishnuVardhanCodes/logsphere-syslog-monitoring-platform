import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings as SettingsIcon, Server, Bell, Shield, User, 
  Save, Check, Lock, Globe, Key, Database, Activity,
  ChevronRight, LogOut, Terminal, Cpu, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import API from '../lib/api'

function SettingSection({ title, subtitle, icon: Icon, children }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong border border-white/5 p-8 rounded-[2rem] relative overflow-hidden"
    >
      <div className="flex items-start gap-6 mb-8">
        <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-inner">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
          <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </motion.div>
  )
}

function SettingField({ label, hint, children }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-6 border-b border-white/5 last:border-0 group">
      <div className="max-w-md">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-300 transition-colors">{label}</p>
        {hint && <p className="text-xs text-slate-600 font-medium leading-relaxed">{hint}</p>}
      </div>
      <div className="lg:w-72 shrink-0">{children}</div>
    </div>
  )
}

export default function Settings() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('general')
  const [syslogPort, setSyslogPort] = useState('5140')
  const [maxLogs, setMaxLogs] = useState('10000')
  const [notifCritical, setNotifCritical] = useState(true)
  const [notifWarning, setNotifWarning] = useState(true)
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    API.get('/settings').then(res => {
      const data = res.data
      if (data.syslogPort) setSyslogPort(data.syslogPort)
      if (data.maxLogs) setMaxLogs(data.maxLogs)
      if (data.notifCritical) setNotifCritical(data.notifCritical === 'true')
      if (data.notifWarning) setNotifWarning(data.notifWarning === 'true')
    }).catch(err => {
      console.error('Failed to load settings', err)
    })
  }, [])

  const saveSettings = async () => {
    const tId = toast.loading('Synchronizing core parameters...')
    try {
      await API.put('/settings', {
        syslogPort,
        maxLogs,
        notifCritical,
        notifWarning
      })
      toast.success('System configuration updated', { id: tId })
    } catch (err) {
      toast.error('Failed to update settings', { id: tId })
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('Cryptographic mismatch: Passwords do not match')
      return
    }
    setPwLoading(true)
    const tId = toast.loading('Updating security credentials...')
    try {
      await API.put('/auth/change-password', { 
        old_password: pwForm.old_password, 
        new_password: pwForm.new_password 
      })
      toast.success('Security identity refreshed', { id: tId })
      setPwForm({ old_password: '', new_password: '', confirm: '' })
    } catch (e) {
      toast.error(e.response?.data?.error || 'Security update rejected', { id: tId })
    } finally { setPwLoading(false) }
  }

  const inputClass = "w-full bg-[#0B1120] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner font-medium"
  
  const toggle = (val, setter) => (
    <button onClick={() => setter(p => !p)}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${val ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-slate-800'}`}>
      <motion.span 
        animate={{ x: val ? 24 : 4 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md" 
      />
    </button>
  )

  const TABS = [
    { id: 'general', label: 'Core Engine', icon: Cpu },
    { id: 'security', label: 'Security & Keys', icon: Shield },
    { id: 'notifications', label: 'Alert Signals', icon: Bell },
    { id: 'account', label: 'Identity', icon: User },
  ]

  return (
    <div className="pb-12 space-y-8 animate-fade-in">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <SettingsIcon size={18} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Command & Control</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Environment
            <Terminal className="text-slate-700" size={32} />
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md">Configure global platform parameters, security headers, and specialized telemetry processing hooks.</p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-72 shrink-0 space-y-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group ${activeTab === tab.id ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20' : 'bg-[#0B1120]/50 border-white/5 text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </div>
              <ChevronRight size={14} className={`transition-transform duration-300 ${activeTab === tab.id ? 'translate-x-1' : 'opacity-0'}`} />
            </button>
          ))}
          
          <div className="pt-8 border-t border-white/5 mt-8">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all group"
            >
              <LogOut size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <SettingSection 
                key="general"
                title="Telemetry Engine" 
                subtitle="Configure how the platform ingests and processes raw system signals."
                icon={Cpu}
              >
                <SettingField label="Syslog Listener Port" hint="The UDP port designated for receiving cross-node system logs. Default is 5140.">
                  <input value={syslogPort} onChange={e => setSyslogPort(e.target.value)} className={inputClass} placeholder="5140" />
                </SettingField>
                <SettingField label="Retention Policy" hint="Maximum number of historical telemetry records to store in the hot database before pruning.">
                  <input value={maxLogs} onChange={e => setMaxLogs(e.target.value)} className={inputClass} placeholder="10000" />
                </SettingField>
                <SettingField label="Data Sovereignty" hint="Current data persistence region for infrastructure telemetry.">
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#0B1120] border border-white/5 rounded-xl text-xs font-bold text-slate-400">
                    <Globe size={14} /> US-EAST-CORE-01
                  </div>
                </SettingField>
                <div className="pt-6">
                  <button onClick={saveSettings} className="flex items-center gap-3 px-8 py-3.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                    <Save size={16} /> Synchronize Config
                  </button>
                </div>
              </SettingSection>
            )}

            {activeTab === 'security' && (
              <SettingSection 
                key="security"
                title="Access & Identity" 
                subtitle="Update your cryptographic credentials and security clearance."
                icon={Shield}
              >
                <form onSubmit={changePassword} className="space-y-4">
                  <SettingField label="Current Signature" hint="Verify your current operational password.">
                    <input type="password" value={pwForm.old_password} onChange={e => setPwForm(p => ({ ...p, old_password: e.target.value }))} className={inputClass} placeholder="••••••••" required />
                  </SettingField>
                  <SettingField label="New Identity Key" hint="Define a new secure access signature. Min 8 characters.">
                    <input type="password" value={pwForm.new_password} onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))} className={inputClass} placeholder="••••••••" required />
                  </SettingField>
                  <SettingField label="Verify Key" hint="Confirm your new signature to prevent lockout.">
                    <input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} className={inputClass} placeholder="••••••••" required />
                  </SettingField>
                  <div className="pt-6">
                    <button type="submit" disabled={pwLoading} className="flex items-center gap-3 px-8 py-3.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50">
                      {pwLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                      Update Access Key
                    </button>
                  </div>
                </form>
              </SettingSection>
            )}

            {activeTab === 'notifications' && (
              <SettingSection 
                key="notifications"
                title="Signal Routing" 
                subtitle="Manage how and when you receive security incident notifications."
                icon={Bell}
              >
                <SettingField label="Critical Path" hint="Trigger high-priority alerts for Critical, Emergency, and System Failure events.">
                  <div className="flex items-center gap-3">
                    {toggle(notifCritical, setNotifCritical)}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${notifCritical ? 'text-emerald-500' : 'text-slate-600'}`}>{notifCritical ? 'Active' : 'Muted'}</span>
                  </div>
                </SettingField>
                <SettingField label="Operational Warnings" hint="Receive signals for Warning and Error level events that don't require immediate shutdown.">
                  <div className="flex items-center gap-3">
                    {toggle(notifWarning, setNotifWarning)}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${notifWarning ? 'text-emerald-500' : 'text-slate-600'}`}>{notifWarning ? 'Active' : 'Muted'}</span>
                  </div>
                </SettingField>
                <SettingField label="Signal Latency" hint="Maximum delay before a detected incident is pushed to the notification stack.">
                  <div className="text-xs font-black text-blue-500 font-mono tracking-tighter">&lt; 150ms</div>
                </SettingField>
                <div className="pt-6">
                  <button onClick={saveSettings} className="flex items-center gap-3 px-8 py-3.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                    <Save size={16} /> Save Routing Policy
                  </button>
                </div>
              </SettingSection>
            )}

            {activeTab === 'account' && (
              <SettingSection 
                key="account"
                title="Operator Profile" 
                subtitle="Your assigned identity and clearance level within LogSphere."
                icon={User}
              >
                <div className="flex items-center gap-8 mb-8 pb-8 border-b border-white/5">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl border border-white/10">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white tracking-tight">{user?.username}</h4>
                    <p className="text-slate-500 font-medium">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                        {user?.role} CLEARANCE
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-white/5 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] border border-white/5">
                        ID: {user?.id}
                      </span>
                    </div>
                  </div>
                </div>
                
                <SettingField label="Registration Timestamp">
                  <p className="text-sm text-slate-400 font-medium">{new Date(user?.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </SettingField>
                <SettingField label="Session Token Persistence">
                  <p className="text-sm text-slate-400 font-medium">JWT / 24 Hours</p>
                </SettingField>
              </SettingSection>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

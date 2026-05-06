import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Shield, AlertCircle, Fingerprint, Activity, Command, Terminal, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  // For random matrix-like or log-like background text effect
  const [bgLogs, setBgLogs] = useState([]);
  
  useEffect(() => {
    const generateLogs = () => {
       const newLogs = Array.from({ length: 20 }).map((_, i) => ({
         id: i,
         text: `[SYS-${Math.floor(Math.random() * 999)}] AUTH_REQ: ${Math.random().toString(36).substring(7)} STATUS: PENDING`,
         top: `${Math.random() * 100}%`,
         left: `${Math.random() * 100}%`,
         opacity: Math.random() * 0.15 + 0.05,
         delay: Math.random() * 5
       }));
       setBgLogs(newLogs);
    }
    generateLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      toast.success(`Welcome back, ${user.username}!`)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication sequence failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center relative overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#030712] to-[#030712]" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.5, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-600/10 blur-[100px]" 
        />

        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />

        {/* Ambient Log Streams */}
        {bgLogs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: log.opacity, y: -20 }}
            transition={{ duration: 10, repeat: Infinity, delay: log.delay, ease: "linear" }}
            className="absolute font-mono text-[10px] text-indigo-300/40 whitespace-nowrap"
            style={{ top: log.top, left: log.left }}
          >
            {log.text}
          </motion.div>
        ))}
      </div>

      {/* Main Layout Container */}
      <div className="z-10 w-full max-w-[1400px] h-screen lg:h-[800px] lg:max-h-[90vh] mx-auto p-4 lg:p-8 flex items-center justify-center">
        <div className="w-full h-full flex flex-col lg:flex-row bg-[#0a0f1c]/80 backdrop-blur-2xl rounded-3xl border border-white/[0.05] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden relative">
          
          {/* Subtle reflection on the card top edge */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

          {/* ── Left side: Branding & Info ── */}
          <div className="hidden lg:flex flex-col justify-between w-[55%] p-16 relative overflow-hidden bg-gradient-to-br from-[#0a0f1c] to-[#030712] border-r border-white/[0.02]">
            
            <div className="relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center gap-3 mb-16"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <div className="w-full h-full bg-[#0a0f1c] rounded-2xl flex items-center justify-center">
                    <Command className="text-indigo-400 w-6 h-6" />
                  </div>
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">Log<span className="text-indigo-400">Sphere</span></span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-6xl font-medium tracking-tight text-white leading-[1.1] mb-8"
              >
                See the unseen.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
                  Control the chaos.
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-lg text-slate-400 max-w-md leading-relaxed"
              >
                Advanced enterprise telemetry and real-time syslog intelligence. Detect anomalies before they cascade.
              </motion.p>
            </div>

            {/* Feature list */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="relative z-10 grid grid-cols-2 gap-8"
            >
              {[
                { icon: <Activity className="text-fuchsia-400" />, title: "Real-time Metrics", desc: "Sub-millisecond latency" },
                { icon: <Lock className="text-indigo-400" />, title: "Zero-Trust RBAC", desc: "Military-grade access" },
                { icon: <Terminal className="text-emerald-400" />, title: "CLI Integration", desc: "Native terminal feel" },
                { icon: <Shield className="text-blue-400" />, title: "Threat Intel", desc: "Automated heuristics" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] h-fit">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm mb-1">{item.title}</h3>
                    <p className="text-slate-500 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Decorative Radar/Circle Effect */}
            <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] border border-white/[0.03] rounded-full flex items-center justify-center pointer-events-none">
              <div className="w-[400px] h-[400px] border border-indigo-500/20 rounded-full flex items-center justify-center relative">
                <div className="w-[200px] h-[200px] border border-fuchsia-500/10 rounded-full" />
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_70%,rgba(99,102,241,0.1)_100%)] rounded-full"
                />
              </div>
            </div>

          </div>

          {/* ── Right side: Login Form ── */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center p-8 sm:p-12 lg:p-20 relative">
            
            <div className="lg:hidden flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 p-[1px]">
                <div className="w-full h-full bg-[#0a0f1c] rounded-xl flex items-center justify-center">
                  <Command className="text-indigo-400 w-5 h-5" />
                </div>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">Log<span className="text-indigo-400">Sphere</span></span>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md mx-auto"
            >
              <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">Secure Access</h2>
              <p className="text-slate-400 text-sm mb-10">Authenticate to enterprise dashboard.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Username Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-1">
                    System ID
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Fingerprint className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      value={form.username}
                      onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                      placeholder="superadmin"
                      required
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/[0.02] transition-all focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-1 flex justify-between">
                    <span>Access Key</span>
                    <a href="#" className="text-indigo-400 hover:text-indigo-300 capitalize text-[11px] tracking-normal font-medium">Forgot key?</a>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-12 pr-12 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/[0.02] transition-all focus:ring-4 focus:ring-indigo-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mt-4">
                        <AlertCircle size={16} className="shrink-0" />
                        <span className="font-medium">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group mt-8"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
                  <div className="relative w-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center py-4 rounded-xl text-sm font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Authenticating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 z-10">
                        Initiate Session
                        <motion.span 
                          className="ml-1"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >→</motion.span>
                      </span>
                    )}
                  </div>
                </button>

              </form>

              <div className="mt-14 text-center">
                <p className="text-[10px] text-slate-500 font-mono tracking-wider bg-white/[0.02] inline-block py-1.5 px-3 rounded-md border border-white/[0.05]">
                  DEV_CREDS: superadmin / admin123
                </p>
                <div className="mt-8 flex justify-center items-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
                  <Shield size={12} /> LogSphere Enterprise v2.0
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </div>
      
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      toast.success(`Welcome back, ${user.username}!`)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1120] bg-grid flex items-center justify-center relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

      <div className="w-full max-w-5xl mx-4 grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-glass border border-blue-500/15">
        {/* ── Left panel: branding ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#0B1120] border-r border-white/5"
        >
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-glow-blue flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">LogSphere</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Enterprise Syslog<br />
              <span className="gradient-text">Intelligence</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Real-time log monitoring, intelligent alerting, and network visibility — built for enterprise IT teams.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: '⚡', text: 'Real-time WebSocket log streaming' },
              { icon: '🔐', text: 'JWT authentication & RBAC' },
              { icon: '📊', text: 'Interactive charts & analytics' },
              { icon: '🚨', text: 'Automated alert detection' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-400">
                <span className="text-base">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-xs text-slate-600">Default credentials</p>
              <p className="text-xs text-slate-500 font-mono mt-1">superadmin / admin123</p>
            </div>
          </div>
        </motion.div>

        {/* ── Right panel: login form ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center p-10 glass"
        >
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1 lg:hidden">
              <Zap size={18} className="text-blue-400" />
              <span className="font-bold text-lg gradient-text">LogSphere</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Sign in</h2>
            <p className="text-slate-500 text-sm mt-1">Access your monitoring dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="Enter username"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
              >
                <AlertCircle size={15} />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Authenticating…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield size={16} /> Sign In
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-8">
            LogSphere v1.0 · Enterprise Syslog Monitor
          </p>
        </motion.div>
      </div>
    </div>
  )
}

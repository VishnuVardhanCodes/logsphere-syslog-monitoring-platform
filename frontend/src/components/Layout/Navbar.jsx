import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Search, Bell, LogOut, User, Wifi, WifiOff, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import socket from '../../lib/socket'
import toast from 'react-hot-toast'

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [connected, setConnected] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  useEffect(() => {
    socket.connect()
    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    return () => { socket.off('connect'); socket.off('disconnect') }
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="flex items-center justify-between px-6 py-3.5 glass border-b border-white/5 z-40 shrink-0">
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuToggle} className="text-slate-400 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
        <div className="relative max-w-xs w-full hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Search logs, devices…"
            className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
          />
        </div>
      </div>

      {/* Right: indicators + profile */}
      <div className="flex items-center gap-3">
        {/* WebSocket status */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
          connected
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span className="hidden sm:inline">{connected ? 'Live' : 'Offline'}</span>
          {connected && <span className="pulse-dot w-1.5 h-1.5" style={{ width: 6, height: 6 }} />}
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(p => !p)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-white">{user?.username}</p>
              <p className="text-[10px] text-slate-500">{user?.role}</p>
            </div>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 glass-strong rounded-xl border border-white/10 shadow-glass py-1 z-50"
              >
                <div className="px-4 py-2.5 border-b border-white/5">
                  <p className="text-sm font-semibold text-white">{user?.username}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/settings') }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User size={14} /> Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                >
                  <LogOut size={14} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Bell, Moon, Sun, User, LogOut, Settings, 
  Shield, CheckCircle2, AlertCircle, Menu, ChevronDown,
  Globe, Activity, Zap
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import socket from '../../lib/socket'
import API from '../../lib/api'
import toast from 'react-hot-toast'
import GlobalSearch from './GlobalSearch'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    
    fetchNotifications()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications/')
      setNotifications(res.data.notifications)
      setUnreadCount(res.data.unread_count)
    } catch (err) {}
  }

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`)
      fetchNotifications()
    } catch (err) {}
  }

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all')
      fetchNotifications()
    } catch (err) {}
  }

  const handleLogout = () => {
    logout()
    toast.success('Secure session terminated')
  }

  return (
    <nav className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${scrolled ? 'bg-[#0B1120]/80 backdrop-blur-xl border-white/5 py-2 shadow-2xl' : 'bg-transparent border-transparent py-4'}`}>
      <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
        
        {/* Left: Search & Status */}
        <div className="flex items-center gap-6 flex-1">
          <button onClick={onToggleSidebar} className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
            <Menu size={20} />
          </button>

          <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.05)] ${connected ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${connected ? 'text-emerald-500' : 'text-red-500'}`}>
              System Status: {connected ? 'Optimal' : 'Interrupted'}
            </span>
          </div>

          <GlobalSearch />

          <div className="hidden xl:flex items-center gap-4 text-slate-500">
            <div className="flex items-center gap-1.5 group cursor-pointer">
              <Globe size={14} className="group-hover:text-blue-400 transition-colors" />
              <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors">Global Node: US-EAST</span>
            </div>
            <div className="h-4 w-[1px] bg-white/5" />
            <div className="flex items-center gap-1.5 group cursor-pointer">
              <Activity size={14} className="group-hover:text-cyan-400 transition-colors" />
              <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors">Latency: 14ms</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications)
                if(!showNotifications) fetchNotifications()
              }}
              className={`p-2.5 rounded-xl transition-all duration-300 relative group border ${showNotifications ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-white/5'}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0B1120]" />}
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 bg-[#0B1120]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">System Alerts</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-black hover:bg-blue-500 hover:text-white transition-all">
                        MARK ALL READ
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">No notifications.</div>
                    ) : notifications.map((n, i) => {
                      const Icon = n.type === 'critical' ? ShieldAlert : n.type === 'warning' ? AlertCircle : Activity
                      const colorClass = n.type === 'critical' ? 'text-red-500 bg-red-500/10' : n.type === 'warning' ? 'text-yellow-500 bg-yellow-500/10' : 'text-blue-500 bg-blue-500/10'
                      
                      return (
                      <div key={i} onClick={() => { if(!n.is_read) markAsRead(n.id) }} className={`flex gap-4 p-3 rounded-xl border transition-all cursor-pointer group/item ${n.is_read ? 'bg-white/[0.01] border-transparent opacity-60' : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]'}`}>
                        <div className={`p-2 rounded-lg h-fit ${colorClass}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-bold text-slate-200 group-hover/item:text-white transition-colors">{n.title}</p>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed truncate">{n.message}</p>
                        </div>
                      </div>
                    )})}
                  </div>
                  <button onClick={() => { setShowNotifications(false); navigate('/alerts') }} className="w-full mt-4 py-3 text-[10px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-widest border-t border-white/5 pt-4 transition-colors">Go to Incident Command</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-[1px] bg-white/5 mx-1" />

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className={`flex items-center gap-3 p-1.5 pr-4 rounded-xl transition-all duration-300 border ${showProfile ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'}`}
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-xl">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0B1120]" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-none mb-1 truncate max-w-[80px]">{user?.username}</p>
                <div className="flex items-center gap-1 opacity-60">
                  <Shield size={10} className={showProfile ? 'text-white' : 'text-blue-400'} />
                  <p className="text-[9px] font-black uppercase tracking-tighter truncate">{user?.role}</p>
                </div>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-60 bg-[#0B1120]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/5 mb-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated ID</p>
                    <p className="text-xs font-mono text-blue-400 truncate tracking-tighter">SEC-UUID-85C7-4EE5</p>
                  </div>
                  <div className="p-1 space-y-1">
                    {[
                      { icon: User, label: 'Profile Intelligence' },
                      { icon: Settings, label: 'System Configuration' },
                    ].map((item, i) => (
                      <button key={i} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all">
                        <item.icon size={16} /> {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="h-[1px] bg-white/5 my-1 mx-2" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={16} /> Terminate Session
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  )
}

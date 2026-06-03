import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Activity, Bell, Monitor, BarChart3,
  FileText, Settings, Users, Shield, ChevronLeft, ChevronRight, Zap,
  Search, Command, AlertTriangle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/live-logs',  icon: Activity,         label: 'Live Logs' },
  { to: '/alerts',     icon: Bell,             label: 'Alerts' },
  { to: '/anomalies',  icon: AlertTriangle,    label: 'Anomalies' },
  { to: '/devices',    icon: Monitor,          label: 'Devices' },
  { to: '/analytics',  icon: BarChart3,        label: 'Analytics' },
  { to: '/reports',    icon: FileText,         label: 'Reports' },
  { to: '/settings',   icon: Settings,         label: 'Settings' },
]

const ADMIN_ITEMS = [
  { to: '/users', icon: Users, label: 'User Management' },
]

export default function Sidebar({ open, onToggle }) {
  const { user } = useAuth()

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 260 : 80 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="relative flex flex-col h-screen bg-[#0B1120]/80 backdrop-blur-xl border-r border-white/5 z-50 shrink-0 overflow-hidden"
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#111827] border border-white/10 shadow-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Zap size={20} className="text-blue-400 fill-blue-400/20" />
          </div>
        </div>
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="font-bold text-xl text-white tracking-tight leading-none">LogSphere</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Enterprise</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Bar (Collapsed/Expanded) */}
      <div className="px-4 mb-6">
        <div className={`flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/5 p-2.5 transition-all duration-300 ${open ? 'w-full' : 'w-12 mx-auto justify-center'}`}>
          <Search size={16} className="text-slate-500 shrink-0" />
          {open && <input type="text" placeholder="Search telemetry..." className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-600 w-full" />}
          {open && <Command size={12} className="text-slate-600 shrink-0" />}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {open && <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">Main Menu</p>}
        
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `
            group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative
            ${isActive ? 'bg-blue-500/10 text-blue-400' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'}
            ${!open ? 'justify-center px-0' : ''}
          `}>
            {({ isActive }) => (
              <>
                <Icon size={20} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-400' : ''}`} />
                {open && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {!open && isActive && (
                  <div className="absolute inset-0 border border-blue-500/20 rounded-xl" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {user?.role === 'Super Admin' && (
          <div className="pt-6">
            {open && <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">Admin Tools</p>}
            {ADMIN_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `
                group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative
                ${isActive ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'}
                ${!open ? 'justify-center px-0' : ''}
              `}>
                {({ isActive }) => (
                  <>
                    <Icon size={20} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-400' : ''}`} />
                    {open && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabAdmin"
                        className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 mt-auto border-t border-white/5 bg-white/[0.01]">
        <div className={`flex items-center gap-3 p-2 rounded-2xl bg-white/[0.02] border border-white/5 ${!open ? 'justify-center' : ''}`}>
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-xl">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0B1120] animate-pulse" />
          </div>
          {open && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-none mb-1">{user?.username}</p>
              <div className="flex items-center gap-1.5 opacity-60">
                <Shield size={10} className="text-blue-400" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{user?.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute bottom-24 -right-3 w-6 h-6 rounded-full bg-[#111827] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-all shadow-2xl z-[60]"
      >
        {open ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </motion.aside>
  )
}

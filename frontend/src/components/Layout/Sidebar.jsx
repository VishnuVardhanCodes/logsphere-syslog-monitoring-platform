import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Activity, Bell, Monitor, BarChart3,
  FileText, Settings, Users, Shield, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/live-logs',  icon: Activity,         label: 'Live Logs' },
  { to: '/alerts',     icon: Bell,             label: 'Alerts' },
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
      animate={{ width: open ? 240 : 64 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen glass-strong border-r border-blue-500/10 z-50 shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-glow-blue shrink-0">
          <Zap size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <span className="font-bold text-lg gradient-text tracking-tight">LogSphere</span>
              <p className="text-[10px] text-slate-500 font-medium -mt-0.5">Enterprise Monitor</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {/* Label */}
        {open && (
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2 pb-2">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''} ${!open ? 'justify-center px-0' : ''}`
          }>
            <Icon size={18} className="shrink-0" />
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}

        {/* Super Admin section */}
        {user?.role === 'Super Admin' && (
          <>
            {open && (
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2 pt-4 pb-2">
                Administration
              </p>
            )}
            {!open && <div className="border-t border-white/5 my-2" />}
            {ADMIN_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''} ${!open ? 'justify-center px-0' : ''}`
              }>
                <Icon size={18} className="shrink-0" />
                <AnimatePresence>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div className="border-t border-white/5 p-3">
        <div className={`flex items-center gap-3 ${!open ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                <div className="flex items-center gap-1">
                  <Shield size={10} className="text-blue-400 shrink-0" />
                  <p className="text-[10px] text-blue-400 truncate">{user?.role}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-blue-500/30 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-400 transition-all z-50"
      >
        {open ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </motion.aside>
  )
}

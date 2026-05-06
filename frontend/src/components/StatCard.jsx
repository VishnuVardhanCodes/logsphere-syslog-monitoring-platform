import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { fmtNumber } from '../lib/utils'

/**
 * Animated statistic card used on the dashboard.
 * Props: title, value, icon, color, trend, trendValue, delay
 */
export default function StatCard({ title, value, icon: Icon, color = 'blue', trend, trendValue, delay = 0 }) {
  const colorMap = {
    blue:   { bg: 'from-blue-500/10 to-blue-500/0', border: 'border-blue-500/20', icon: 'text-blue-400', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]', bgGlow: 'bg-blue-500/20' },
    cyan:   { bg: 'from-cyan-500/10 to-cyan-500/0', border: 'border-cyan-500/20', icon: 'text-cyan-400', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]', bgGlow: 'bg-cyan-500/20' },
    red:    { bg: 'from-red-500/10 to-red-500/0', border: 'border-red-500/20', icon: 'text-red-400', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]', bgGlow: 'bg-red-500/20' },
    amber:  { bg: 'from-amber-500/10 to-amber-500/0', border: 'border-amber-500/20', icon: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]', bgGlow: 'bg-amber-500/20' },
    green:  { bg: 'from-emerald-500/10 to-emerald-500/0', border: 'border-emerald-500/20', icon: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]', bgGlow: 'bg-emerald-500/20' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden glass-strong bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-6 cursor-pointer ${c.glow} transition-all duration-300 group`}
    >
      <div className={`absolute -right-10 -top-10 w-32 h-32 ${c.bgGlow} rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative flex items-start justify-between z-10">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
          <motion.p
            key={value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md"
          >
            {value !== undefined && value !== null ? fmtNumber(Number(value)) : '—'}
          </motion.p>
          {trendValue !== undefined && (
            <div className={`flex items-center gap-1.5 mt-2.5 text-xs font-semibold ${
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500'
            }`}>
              {trend === 'up' && <TrendingUp size={14} className="animate-pulse" />}
              {trend === 'down' && <TrendingDown size={14} />}
              {trend === 'flat' && <Minus size={14} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-inner ${c.icon} group-hover:rotate-12 group-hover:scale-110 transition-all duration-300`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  )
}

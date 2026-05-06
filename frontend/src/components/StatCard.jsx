import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { fmtNumber } from '../lib/utils'

/**
 * Animated statistic card used on the dashboard.
 * Props: title, value, icon, color, trend, trendValue, delay
 */
export default function StatCard({ title, value, icon: Icon, color = 'blue', trend, trendValue, delay = 0 }) {
  const colorMap = {
    blue:   { bg: 'from-blue-500/20 to-blue-500/5',  border: 'border-blue-500/25', icon: 'text-blue-400', glow: 'shadow-glow-blue' },
    cyan:   { bg: 'from-cyan-500/20 to-cyan-500/5',   border: 'border-cyan-500/25',  icon: 'text-cyan-400',  glow: 'shadow-glow-cyan' },
    red:    { bg: 'from-red-500/20 to-red-500/5',     border: 'border-red-500/25',   icon: 'text-red-400',   glow: 'shadow-glow-red' },
    amber:  { bg: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/25', icon: 'text-amber-400', glow: 'shadow-glow-amber' },
    green:  { bg: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/25', icon: 'text-emerald-400', glow: 'shadow-glow-green' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      whileHover={{ y: -3, scale: 1.01 }}
      className={`gradient-border bg-gradient-to-br ${c.bg} border ${c.border} rounded-xl p-5 cursor-default ${c.glow} transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
          <motion.p
            key={value}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold text-white tracking-tight"
          >
            {value !== undefined && value !== null ? fmtNumber(Number(value)) : '—'}
          </motion.p>
          {trendValue !== undefined && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500'
            }`}>
              {trend === 'up' && <TrendingUp size={12} />}
              {trend === 'down' && <TrendingDown size={12} />}
              {trend === 'flat' && <Minus size={12} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-white/5 ${c.icon}`}>
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  )
}

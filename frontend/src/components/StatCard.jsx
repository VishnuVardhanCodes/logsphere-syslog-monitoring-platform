import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { fmtNumber } from '../lib/utils'

/**
 * Animated statistic card with mini-charts (sparklines).
 */
export default function StatCard({ title, value, icon: Icon, color = 'blue', trend, trendValue, delay = 0, chartData = [] }) {
  const colorMap = {
    blue:   { 
      bg: 'from-blue-500/10 to-blue-500/0', 
      border: 'border-blue-500/20', 
      icon: 'text-blue-400', 
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]', 
      chart: '#3B82F6' 
    },
    cyan:   { 
      bg: 'from-cyan-500/10 to-cyan-500/0', 
      border: 'border-cyan-500/20', 
      icon: 'text-cyan-400', 
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]', 
      chart: '#06B6D4' 
    },
    red:    { 
      bg: 'from-red-500/10 to-red-500/0', 
      border: 'border-red-500/20', 
      icon: 'text-red-400', 
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]', 
      chart: '#EF4444' 
    },
    amber:  { 
      bg: 'from-amber-500/10 to-amber-500/0', 
      border: 'border-amber-500/20', 
      icon: 'text-amber-400', 
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]', 
      chart: '#F59E0B' 
    },
    green:  { 
      bg: 'from-emerald-500/10 to-emerald-500/0', 
      border: 'border-emerald-500/20', 
      icon: 'text-emerald-400', 
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]', 
      chart: '#10B981' 
    },
  }
  const c = colorMap[color] || colorMap.blue

  // Mock chart data if none provided
  const displayData = chartData.length > 0 ? chartData : [
    { v: 30 }, { v: 45 }, { v: 35 }, { v: 50 }, { v: 40 }, { v: 60 }, { v: 55 }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden glass-strong bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5 cursor-pointer ${c.glow} transition-all duration-300 group`}
    >
      {/* Background Glow */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${color}-500/10 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] ${c.icon}`}>
            <Icon size={20} />
          </div>
          {trendValue && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
              trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trendValue}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
            <motion.h3
              key={value}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-white tracking-tight"
            >
              {value !== undefined ? fmtNumber(value) : '—'}
            </motion.h3>
          </div>

          <div className="flex-1 h-12 max-w-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.chart} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={c.chart} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="v" 
                  stroke={c.chart} 
                  strokeWidth={2} 
                  fill={`url(#grad-${color})`} 
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Interaction line */}
      <div className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent w-0 group-hover:w-full transition-all duration-500`} />
    </motion.div>
  )
}

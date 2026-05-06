/**
 * Utility helpers for LogSphere frontend.
 */

/** Map severity string → Tailwind badge class */
export const severityBadgeClass = (severity = '') => {
  const s = severity.toLowerCase()
  if (['emergency', 'alert', 'critical'].includes(s)) return 'badge-critical'
  if (s === 'error') return 'badge-critical'
  if (s === 'warning') return 'badge-warning'
  if (s === 'notice') return 'badge-notice'
  if (s === 'info') return 'badge-info'
  if (s === 'debug') return 'badge-debug'
  return 'badge-info'
}

/** Map severity → color hex for charts */
export const severityColor = (severity = '') => {
  const s = severity.toLowerCase()
  if (['emergency', 'alert', 'critical', 'error'].includes(s)) return '#EF4444'
  if (s === 'warning') return '#F59E0B'
  if (s === 'notice') return '#A855F7'
  if (s === 'info') return '#3B82F6'
  if (s === 'debug') return '#64748B'
  return '#3B82F6'
}

/** Format ISO timestamp → readable string */
export const fmtDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  })
}

/** Format number with K/M suffix */
export const fmtNumber = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

/** Truncate long strings */
export const truncate = (str, max = 80) =>
  str && str.length > max ? str.slice(0, max) + '…' : str

/** Merge class names (tiny clsx-like) */
export const cn = (...classes) => classes.filter(Boolean).join(' ')

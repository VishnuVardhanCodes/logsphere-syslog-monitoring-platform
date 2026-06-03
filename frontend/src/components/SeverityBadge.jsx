import { severityBadgeClass } from '../lib/utils'

/**
 * Premium Severity Badge with glowing effect and status indicator.
 */
export default function SeverityBadge({ severity }) {
  if (!severity) return null
  
  const label = severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()
  
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest
      transition-all duration-300 border
      ${severityBadgeClass(severity)}
    `}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
      </span>
      {label}
    </span>
  )
}

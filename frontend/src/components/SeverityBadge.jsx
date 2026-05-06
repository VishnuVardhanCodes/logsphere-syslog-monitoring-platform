import { severityBadgeClass } from '../lib/utils'

/**
 * Severity badge pill component.
 * Renders glowing colored badge based on severity string.
 */
export default function SeverityBadge({ severity }) {
  if (!severity) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${severityBadgeClass(severity)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {severity}
    </span>
  )
}

/** Skeleton loader rows for tables and cards */
export function SkeletonRow({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonCard() {
  return (
    <div className="gradient-border p-5 rounded-xl space-y-3">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton h-8 w-20 rounded" />
      <div className="skeleton h-3 w-16 rounded" />
    </div>
  )
}

export function SkeletonList({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-12 rounded-lg" />
      ))}
    </div>
  )
}

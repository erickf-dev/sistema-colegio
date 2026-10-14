export default function StatCard({ title, value, subtitle }) {
  return (
    <article className="stat-card">
      <span className="stat-title">{title}</span>
      <strong className="stat-value">{value}</strong>
      {subtitle ? <small className="stat-subtitle">{subtitle}</small> : null}
    </article>
  )
}

import { Link } from 'react-router-dom'

export default function StatCard({ to, code, label, value, loading }) {
  return (
    <Link className="statCard modern" to={to}>
      <div className="statIcon">{code}</div>

      <div>
        <div className="statLabel muted">{label}</div>

        <div className="statValue">
          {loading ? <span className="skeleton small" /> : value}
        </div>
      </div>
    </Link>
  )
}
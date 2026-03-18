import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { metricsApi } from '../services/metrics.js'

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let canceled = false
    setLoading(true)
    setError('')
    metricsApi
      .get()
      .then((data) => {
        if (canceled) return
        setMetrics(data)
      })
      .catch((e) => {
        if (canceled) return
        setError(e.message || 'Failed to load dashboard metrics')
      })
      .finally(() => {
        if (canceled) return
        setLoading(false)
      })
    return () => {
      canceled = true
    }
  }, [])

  const customersTotal = metrics?.customers?.total ?? 0
  const leadsTotal = metrics?.leads?.total ?? 0
  const leadsByStatus = metrics?.leads?.byStatus || []
  const recentLeads = metrics?.leads?.recent || []
  const recentCustomers = metrics?.customers?.recent || []

  return (
    <div className="stack">
      <div>
        <h1>Dashboard</h1>
        <p className="muted">Basic CRM module (Customers, Leads, Lead Notes).</p>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="statsGrid">
        <Link className="statCard" to="/customers">
          <div className="statLabel muted">Customers</div>
          <div className="statValue">{loading ? '—' : customersTotal}</div>
          <div className="muted statHint">View customers</div>
        </Link>
        <Link className="statCard" to="/leads">
          <div className="statLabel muted">Leads</div>
          <div className="statValue">{loading ? '—' : leadsTotal}</div>
          <div className="muted statHint">View leads</div>
        </Link>
        <Link className="statCard" to="/search">
          <div className="statLabel muted">Search</div>
          <div className="statValue">⌕</div>
          <div className="muted statHint">Search customers & leads</div>
        </Link>
      </div>

      {leadsByStatus.length ? (
        <div className="card stack">
          <div className="row">
            <h2>Lead Status</h2>
            <Link className="btn" to="/leads">
              Open Leads
            </Link>
          </div>
          <div className="badgeRow">
            {leadsByStatus.map((x) => (
              <span key={x.status || 'unknown'} className="badge">
                <span className="badgeKey">{x.status || 'unknown'}</span>
                <span className="badgeVal">{x.count}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {recentLeads.length || recentCustomers.length ? (
        <div className="grid2">
          <div className="card stack">
            <div className="row">
              <h2>Recent Leads</h2>
              <Link className="btn" to="/leads">
                Open
              </Link>
            </div>
            {recentLeads.length ? (
              <div className="stack">
                {recentLeads.map((l) => (
                  <Link key={l.id} className="resultRow" to={`/leads/${l.id}`}>
                    <div>
                      <div className="resultTitle">{l.name}</div>
                      <div className="muted resultSub">
                        {l.status || '-'} • {l.source || '-'}
                      </div>
                    </div>
                    <span className="btn primary">Open</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="muted">No leads yet.</div>
            )}
          </div>

          <div className="card stack">
            <div className="row">
              <h2>Recent Customers</h2>
              <Link className="btn" to="/customers">
                Open
              </Link>
            </div>
            {recentCustomers.length ? (
              <div className="stack">
                {recentCustomers.map((c) => (
                  <Link key={c.id} className="resultRow" to={`/customers/${c.id}`}>
                    <div>
                      <div className="resultTitle">{c.name}</div>
                      <div className="muted resultSub">
                        {c.email || '-'} • {c.phone || '-'}
                      </div>
                    </div>
                    <span className="btn">Edit</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="muted">No customers yet.</div>
            )}
          </div>
        </div>
      ) : null}

      <div className="grid3">
        <Link className="moduleCard" to="/customers">
          <div>
            <h2>Customers</h2>
            <p className="muted">Manage customer profiles.</p>
          </div>
          <span className="btn primary">Open</span>
        </Link>
        <Link className="moduleCard" to="/leads">
          <div>
            <h2>Leads</h2>
            <p className="muted">Track leads, status, and notes.</p>
          </div>
          <span className="btn primary">Open</span>
        </Link>
        <Link className="moduleCard" to="/lead-notes">
          <div>
            <h2>Lead Notes</h2>
            <p className="muted">Review and add notes for leads.</p>
          </div>
          <span className="btn primary">Open</span>
        </Link>
      </div>
    </div>
  )
}


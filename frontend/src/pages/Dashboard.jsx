import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { metricsApi } from "../services/metrics.js"

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let canceled = false

    metricsApi
      .get()
      .then((data) => {
        if (!canceled) setMetrics(data)
      })
      .catch((e) => {
        if (!canceled) setError(e.message || "Failed to load dashboard")
      })
      .finally(() => {
        if (!canceled) setLoading(false)
      })

    return () => (canceled = true)
  }, [])

  const customersTotal = metrics?.customers?.total ?? 0
  const leadsTotal = metrics?.leads?.total ?? 0
  const leadsByStatus = metrics?.leads?.byStatus || []
  const recentLeads = metrics?.leads?.recent || []
  const recentCustomers = metrics?.customers?.recent || []

  return (
    <div className="dashboard stack">

      {/* HEADER */}
      <div className="dashboardHeader">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">
            Overview of customers, leads and CRM activity
          </p>
        </div>

        <div className="dashboardActions">
          <Link className="btn primary" to="/customers/new">
            + Add Customer
          </Link>
          <Link className="btn" to="/leads/new">
            + Add Lead
          </Link>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {/* STATS */}
      <div className="statsGrid">

        <Link className="statCard modern" to="/customers">
          <div className="statIcon">👥</div>
          <div>
            <div className="statLabel muted">Customers</div>
            <div className="statValue">{loading ? "—" : customersTotal}</div>
          </div>
        </Link>

        <Link className="statCard modern" to="/leads">
          <div className="statIcon">🎯</div>
          <div>
            <div className="statLabel muted">Leads</div>
            <div className="statValue">{loading ? "—" : leadsTotal}</div>
          </div>
        </Link>

        <Link className="statCard modern" to="/search">
          <div className="statIcon">🔎</div>
          <div>
            <div className="statLabel muted">Search</div>
            <div className="statValue">⌕</div>
          </div>
        </Link>

      </div>

      {/* LEAD STATUS */}
      {leadsByStatus.length > 0 && (
        <div className="card stack">
          <div className="row">
            <h2>Lead Pipeline</h2>
            <Link className="btn" to="/leads">
              View Leads
            </Link>
          </div>

          <div className="badgeRow">
            {leadsByStatus.map((x) => (
              <div key={x.status} className="badge modern">
                <span>{x.status || "unknown"}</span>
                <strong>{x.count}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT ACTIVITY */}
      <div className="grid2">

        {/* LEADS */}
        <div className="card stack">
          <div className="row">
            <h2>Recent Leads</h2>
            <Link className="btn" to="/leads">
              View All
            </Link>
          </div>

          {recentLeads.length ? (
            recentLeads.map((l) => (
              <Link key={l.id} className="resultRow modern" to={`/leads/${l.id}`}>
                <div>
                  <div className="resultTitle">{l.name}</div>
                  <div className="muted resultSub">
                    {l.status || "-"} • {l.source || "-"}
                  </div>
                </div>
                <span className="btn primary">Open</span>
              </Link>
            ))
          ) : (
            <div className="muted">No leads yet</div>
          )}
        </div>

        {/* CUSTOMERS */}
        <div className="card stack">
          <div className="row">
            <h2>Recent Customers</h2>
            <Link className="btn" to="/customers">
              View All
            </Link>
          </div>

          {recentCustomers.length ? (
            recentCustomers.map((c) => (
              <Link key={c.id} className="resultRow modern" to={`/customers/${c.id}`}>
                <div>
                  <div className="resultTitle">{c.name}</div>
                  <div className="muted resultSub">
                    {c.email || "-"} • {c.phone || "-"}
                  </div>
                </div>
                <span className="btn">Edit</span>
              </Link>
            ))
          ) : (
            <div className="muted">No customers yet</div>
          )}
        </div>

      </div>

      {/* MODULE SHORTCUTS */}
      <div className="grid3">

        <Link className="moduleCard modern" to="/customers">
          <h2>Customers</h2>
          <p className="muted">Manage customer profiles</p>
          <span className="btn primary">Open</span>
        </Link>

        <Link className="moduleCard modern" to="/leads">
          <h2>Leads</h2>
          <p className="muted">Track leads and pipeline</p>
          <span className="btn primary">Open</span>
        </Link>

        <Link className="moduleCard modern" to="/lead-notes">
          <h2>Lead Notes</h2>
          <p className="muted">Notes and history</p>
          <span className="btn primary">Open</span>
        </Link>

      </div>

    </div>
  )
}
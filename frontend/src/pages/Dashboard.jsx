import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import StatCard from '../components/StatCard.jsx'
import { metricsApi } from '../services/metrics.js'

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let canceled = false

    metricsApi
      .get()
      .then((data) => {
        if (!canceled) setMetrics(data)
      })
      .catch((e) => {
        if (!canceled) setError(e.message || 'Failed to load dashboard')
      })
      .finally(() => {
        if (!canceled) setLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [])

  const companiesTotal = metrics?.companies?.total ?? 0
  const usersTotal = metrics?.users?.total ?? 0
  const customersTotal = metrics?.customers?.total ?? 0
  const leadsTotal = metrics?.leads?.total ?? 0
  const leadsByStatus = metrics?.leads?.byStatus || []
  const leadsBySource = metrics?.leads?.bySource || []
  const leadsTrend = metrics?.leads?.trend || []
  const customersTrend = metrics?.customers?.trend || []
  const recentLeads = metrics?.leads?.recent || []
  const recentCustomers = metrics?.customers?.recent || []

  const chartPalette = ['#6c5ce7', '#00b894', '#0984e3', '#fdcb6e', '#f27b50', '#2d9cdb', '#9b51e0']

  const leadStatusData = leadsByStatus.map((item, idx) => ({
    name: item.status || 'Unknown',
    value: item.count,
    fill: chartPalette[idx % chartPalette.length],
  }))

  const leadSourceData = leadsBySource.map((item, idx) => ({
    name: item.source || 'Unknown',
    value: item.count,
    fill: chartPalette[idx % chartPalette.length],
  }))

  const trendData = useMemo(() => {
    if (!leadsTrend.length && !customersTrend.length) return []

    return (leadsTrend.length ? leadsTrend : customersTrend).map((item, idx) => ({
      month: item.label,
      leads: leadsTrend[idx]?.value ?? 0,
      customers: customersTrend[idx]?.value ?? 0,
    }))
  }, [leadsTrend, customersTrend])

  const hasTrend = trendData.some((item) => item.leads || item.customers)
  const hasStatus = leadStatusData.some((d) => d.value > 0)
  const hasSources = leadSourceData.some((d) => d.value > 0)

  return (
    <div className="dashboard stack">
      <div className="dashboardHeader">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Overview of companies, users, customers, and lead activity</p>
        </div>

        <div className="dashboardActions">
          <Link className="btn primary" to="/companies/new">
            + Add Company
          </Link>
          <Link className="btn" to="/users/new">
            + Add User
          </Link>
        </div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="statsGrid">
        <StatCard to="/companies" code="CO" label="Companies" value={companiesTotal} loading={loading} />
        <StatCard to="/users" code="US" label="Users" value={usersTotal} loading={loading} />
        <StatCard to="/customers" code="CU" label="Customers" value={customersTotal} loading={loading} />
        <StatCard to="/leads" code="LE" label="Leads" value={leadsTotal} loading={loading} />
      </div>

      {/* {leadsByStatus.length > 0 ? (
        <div className="card stack">
          <div className="row">
            <h2>Lead Pipeline</h2>
            <Link className="btn" to="/leads">
              View Leads
            </Link>
          </div>

          <div className="badgeRow">
            {leadsByStatus.map((item) => (
              <div key={item.status} className="badge modern">
                <span>{item.status || 'unknown'}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      ) : null} */}

      {/* <div className="grid2">
        <div className="card stack">
          <div className="row">
            <h2>Recent Leads</h2>
            <Link className="btn" to="/leads">
              View All
            </Link>
          </div>

          {recentLeads.length ? (
            recentLeads.map((lead) => (
              <Link key={lead.id} className="resultRow modern" to={`/leads/${lead.id}`}>
                <div>
                  <div className="resultTitle">{lead.name}</div>
                  <div className="muted resultSub">
                    {lead.status || '-'} | {lead.source || '-'}
                  </div>
                </div>
                <span className="btn primary">Open</span>
              </Link>
            ))
          ) : (
            <div className="muted">No leads yet</div>
          )}
        </div>

        <div className="card stack">
          <div className="row">
            <h2>Recent Customers</h2>
            <Link className="btn" to="/customers">
              View All
            </Link>
          </div>

          {recentCustomers.length ? (
            recentCustomers.map((customer) => (
              <Link key={customer.id} className="resultRow modern" to={`/customers/${customer.id}`}>
                <div>
                  <div className="resultTitle">{customer.name}</div>
                  <div className="muted resultSub">
                    {customer.email || '-'} | {customer.phone || '-'}
                  </div>
                </div>
                <span className="btn">Edit</span>
              </Link>
            ))
          ) : (
            <div className="muted">No customers yet</div>
          )}
        </div>
      </div> */}

      <div className="chartsGrid">
        <div className="card chartCard">
          <div className="row chartHeader">
            <div>
              <h2>Lead Status Mix</h2>
              <p className="muted small">Distribution of open leads by pipeline status</p>
            </div>
            <span className="chartBadge">Total {leadsTotal}</span>
          </div>

          {loading ? (
            <div className="chartEmpty muted">Loading chart…</div>
          ) : hasStatus ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                <Pie data={leadStatusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110} paddingAngle={2}>
                  {leadStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chartEmpty muted">Not enough data yet</div>
          )}
        </div>

        <div className="card chartCard">
          <div className="row chartHeader">
            <div>
              <h2>New Leads vs Customers</h2>
              <p className="muted small">Last 6 months of new records</p>
            </div>
          </div>

          {loading ? (
            <div className="chartEmpty muted">Loading chart…</div>
          ) : hasTrend ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" name="Leads" fill={chartPalette[0]} radius={[6, 6, 0, 0]} />
                <Bar dataKey="customers" name="Customers" fill={chartPalette[2]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chartEmpty muted">Add some leads and customers to see trends</div>
          )}
        </div>

        <div className="card chartCard">
          <div className="row chartHeader">
            <div>
              <h2>Top Lead Sources</h2>
              <p className="muted small">Which channels generate the most leads</p>
            </div>
          </div>

          {loading ? (
            <div className="chartEmpty muted">Loading chart…</div>
          ) : hasSources ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={leadSourceData} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [`${value} leads`, 'Total']} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {leadSourceData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chartEmpty muted">No source data yet</div>
          )}
        </div>
      </div>

      {/* <div className="grid2">
        <Link className="moduleCard modern" to="/companies">
          <h2>Companies</h2>
          <p className="muted">Manage company accounts and profile details</p>
          <span className="btn primary">Open</span>
        </Link>

        <Link className="moduleCard modern" to="/users">
          <h2>Users</h2>
          <p className="muted">Manage CRM users, roles, and company assignment</p>
          <span className="btn primary">Open</span>
        </Link>

        <Link className="moduleCard modern" to="/customers">
          <h2>Customers</h2>
          <p className="muted">Manage customer profiles and contact details</p>
          <span className="btn primary">Open</span>
        </Link>

        <Link className="moduleCard modern" to="/leads">
          <h2>Leads</h2>
          <p className="muted">Track pipeline progress and follow-up activity</p>
          <span className="btn primary">Open</span>
        </Link>
      </div> */}
    </div>
  )
}

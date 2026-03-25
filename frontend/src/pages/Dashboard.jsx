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
import { useAuth } from '../context/AuthContext.jsx'
import { hasRequiredRole, NAV_ACCESS } from '../utils/accessControl.js'
import { useToastFeedback } from '../utils/useToastFeedback.js'

export default function Dashboard() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useToastFeedback({ error })

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

  const chartPalette = ['#64748b', '#14b8a6', '#3b82f6', '#f59e0b', '#f97316', '#38bdf8', '#8b5cf6']

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
  const canManageUsers = hasRequiredRole(user?.role, NAV_ACCESS.users)

  return (
    <div className="dashboard stack">
      <div className="dashboardShell">
        <div className="dashboardHeader">
          <div>
            <h1>Dashboard</h1>
            <p className="muted">Overview of users, customers, leads, and deal activity</p>
          </div>

          <div className="dashboardActions">
            <Link className="btn primary" to="/leads/new">
              + Add Lead
            </Link>
            {canManageUsers ? (
              <Link className="btn dashboardSecondaryAction" to="/users/new">
                + Add User
              </Link>
            ) : null}
          </div>
        </div>

        {error ? <div className="alert error">{error}</div> : null}

        <div className="statsGrid">
          {canManageUsers ? <StatCard to="/users" code="US" label="Users" value={usersTotal} loading={loading} /> : null}
          <StatCard to="/customers" code="CU" label="Customers" value={customersTotal} loading={loading} />
          <StatCard to="/leads" code="LE" label="Leads" value={leadsTotal} loading={loading} />
          <StatCard to="/deals" code="DE" label="Deals" value={metrics?.deals?.total || 0} loading={loading} />
        </div>

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
              <div className="chartEmpty muted">Loading chart...</div>
            ) : hasStatus ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                  <Pie data={leadStatusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110} paddingAngle={2}>
                    {leadStatusData.map((entry) => (
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
              <div className="chartEmpty muted">Loading chart...</div>
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
              <div className="chartEmpty muted">Loading chart...</div>
            ) : hasSources ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={leadSourceData} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [`${value} leads`, 'Total']} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {leadSourceData.map((entry) => (
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
      </div>
    </div>
  )
}

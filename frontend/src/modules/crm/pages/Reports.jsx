import { useEffect, useMemo, useState } from 'react'
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
  Line,
  LineChart
} from 'recharts'
import { metricsApi } from '../../../services/metrics.js'
import PageHeader from '../../../components/PageHeader.jsx'

export default function Reports() {
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
        if (!canceled) setError(e.message || 'Failed to load reports')
      })
      .finally(() => {
        if (!canceled) setLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [])

  const leadsTotal = metrics?.leads?.total ?? 0
  const customersTotal = metrics?.customers?.total ?? 0
  const leadsByStatus = metrics?.leads?.byStatus || []
  const leadsBySource = metrics?.leads?.bySource || []
  const leadsTrend = metrics?.leads?.trend || []
  const customersTrend = metrics?.customers?.trend || []

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
    <div className="reports-page stack">
      <PageHeader
        title="CRM Reports"
        description="Comprehensive analysis of leads, customers and performance metrics"
        backTo="/"
        actions={<button className="btn" onClick={() => window.print()}>Export PDF</button>}
      />

      {error ? <div className="alert error">{error}</div> : null}

      <div className="grid2">
        <div className="card stack">
          <div className="row">
            <h3>Leads by Status</h3>
            <span className="badge primary">{leadsTotal} Total</span>
          </div>
          {loading ? (
            <div className="padding30 center muted">Loading...</div>
          ) : hasStatus ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                <Pie
                  data={leadStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {leadStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="padding30 center muted">No status data available</div>
          )}
        </div>

        <div className="card stack">
          <div className="row">
            <h3>Top Lead Sources</h3>
          </div>
          {loading ? (
            <div className="padding30 center muted">Loading...</div>
          ) : hasSources ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadSourceData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0984e3" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="padding30 center muted">No source data available</div>
          )}
        </div>
      </div>

      <div className="card stack">
        <div className="row">
          <h3>Growth Tracking (Last 6 Months)</h3>
          <div className="row small-gap">
            <div className="row tiny-gap">
              <span className="dot" style={{ background: '#6c5ce7' }}></span>
              <span className="text-small">Leads</span>
            </div>
            <div className="row tiny-gap">
              <span className="dot" style={{ background: '#0984e3' }}></span>
              <span className="text-small">Customers</span>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="padding30 center muted">Loading...</div>
        ) : hasTrend ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke="#6c5ce7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="customers" stroke="#0984e3" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="padding30 center muted">No trend data available</div>
        )}
      </div>

      <div className="card noPadding">
        <table className="table">
          <thead>
            <tr>
              <th>Report Metric</th>
              <th className="right">Current Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Active Leads</td>
              <td className="right"><strong>{leadsTotal}</strong></td>
            </tr>
            <tr>
              <td>Total Converted Customers</td>
              <td className="right"><strong>{customersTotal}</strong></td>
            </tr>
            <tr>
              <td>Conversion Rate</td>
              <td className="right"><strong>{leadsTotal > 0 ? ((customersTotal / leadsTotal) * 100).toFixed(1) : 0}%</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

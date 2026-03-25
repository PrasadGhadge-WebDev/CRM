import { useEffect, useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../../../layouts/icons.jsx'
import Pagination from '../../../components/Pagination.jsx'
import FilterBar from '../../../components/FilterBar.jsx'
import PageHeader from '../../../components/PageHeader.jsx'
import { supportApi } from '../../../services/workflow.js'
import { useDebouncedValue } from '../../../utils/useDebouncedValue.js'

export default function SupportList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    sortField: searchParams.get('sortField') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20)),
  })

  const debouncedQ = useDebouncedValue(filters.q, 300)

  useEffect(() => {
    const next = new URLSearchParams()
    if (debouncedQ.trim()) next.set('q', debouncedQ.trim())
    if (filters.status) next.set('status', filters.status)
    if (filters.priority) next.set('priority', filters.priority)
    if (filters.sortField !== 'created_at') next.set('sortField', filters.sortField)
    if (filters.sortOrder !== 'desc') next.set('sortOrder', filters.sortOrder)
    if (filters.page > 1) next.set('page', String(filters.page))
    if (filters.limit !== 20) next.set('limit', String(filters.limit))
    setSearchParams(next, { replace: true })
  }, [debouncedQ, filters, setSearchParams])

  const loadTickets = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await supportApi.list({ ...filters, q: debouncedQ })
      setItems(Array.isArray(res) ? res : res.items || [])
      setTotal(res.total || (Array.isArray(res) ? res.length : 0))
    } catch (err) {
      setError('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, filters])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  return (
    <div className="stack">
      <PageHeader title="Support Tickets" backTo="/" />

      <div className="card noPadding stack">
        <div className="padding">
          <input
            className="input"
            placeholder="Search subject/description/category..."
            value={filters.q}
            onChange={(e) => handleFilterChange({ q: e.target.value })}
          />
        </div>

        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          resetSort={{ field: 'created_at', order: 'desc' }}
          sortFields={[
            { key: 'created_at', label: 'Date' },
            { key: 'priority', label: 'Priority' }
          ]}
          currentSort={{ field: filters.sortField, order: filters.sortOrder }}
          options={{
            status: [
              { value: 'open', label: 'Open' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' }
            ],
            priority: [
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' }
            ]
          }}
        />
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="muted padding30 center">Loading tickets...</div>
      ) : (
        <>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Customer</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="stack small-gap">
                        <div className="strong">{t.subject}</div>
                        <div className="muted small ellipsis" style={{ maxWidth: 300 }}>{t.description}</div>
                      </div>
                    </td>
                    <td>{t.customer_id?.name || 'Unknown'}</td>
                    <td><span className={`badge priority-${t.priority}`}>{t.priority}</span></td>
                    <td><span className={`badge ${t.status === 'open' ? 'danger' : 'success'}`}>{t.status}</span></td>
                    <td>{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!items.length && (
                  <tr><td colSpan="5" className="center muted padding30">No tickets found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination 
            page={filters.page} 
            limit={filters.limit} 
            total={total} 
            onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))} 
            onLimitChange={(l) => setFilters(prev => ({ ...prev, limit: l, page: 1 }))}
          />
        </>
      )}
    </div>
  )
}

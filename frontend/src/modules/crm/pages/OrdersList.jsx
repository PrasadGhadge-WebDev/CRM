import { useEffect, useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../../../layouts/icons.jsx'
import Pagination from '../../../components/Pagination.jsx'
import FilterBar from '../../../components/FilterBar.jsx'
import PageHeader from '../../../components/PageHeader.jsx'
import { ordersApi } from '../../../services/workflow.js'
import { useDebouncedValue } from '../../../utils/useDebouncedValue.js'

export default function OrdersList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    status: searchParams.get('status') || '',
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
    if (filters.sortField !== 'created_at') next.set('sortField', filters.sortField)
    if (filters.sortOrder !== 'desc') next.set('sortOrder', filters.sortOrder)
    if (filters.page > 1) next.set('page', String(filters.page))
    if (filters.limit !== 20) next.set('limit', String(filters.limit))
    setSearchParams(next, { replace: true })
  }, [debouncedQ, filters, setSearchParams])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await ordersApi.list({ ...filters, q: debouncedQ })
      setItems(Array.isArray(res) ? res : res.items || [])
      setTotal(res.total || (Array.isArray(res) ? res.length : 0))
    } catch (err) {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, filters])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  return (
    <div className="stack">
      <PageHeader title="Orders" backTo="/" />

      <div className="card noPadding stack">
        <div className="padding">
          <input
            className="input"
            placeholder="Search order notes..."
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
            { key: 'total_amount', label: 'Amount' }
          ]}
          currentSort={{ field: filters.sortField, order: filters.sortOrder }}
          options={{
            status: [
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'cancelled', label: 'Cancelled' }
            ]
          }}
        />
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="muted padding30 center">Loading orders...</div>
      ) : (
        <>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id}>
                    <td>{new Date(o.order_date).toLocaleDateString()}</td>
                    <td>{o.customer_id?.name || 'Unknown'}</td>
                    <td>{o.items?.length || 0} items</td>
                    <td>{o.currency} {o.total_amount}</td>
                    <td><span className={`badge ${o.status === 'paid' ? 'success' : 'warning'}`}>{o.status}</span></td>
                  </tr>
                ))}
                {!items.length && (
                  <tr><td colSpan="5" className="center muted padding30">No orders found.</td></tr>
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

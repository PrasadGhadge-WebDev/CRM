import { useEffect, useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../../../layouts/icons.jsx'
import Pagination from '../../../components/Pagination.jsx'
import FilterBar from '../../../components/FilterBar.jsx'
import PageHeader from '../../../components/PageHeader.jsx'
import { dealsApi } from '../../../services/deals'
import { useDebouncedValue } from '../../../utils/useDebouncedValue.js'

export default function DealsList() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter & Sort State
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

  const loadDeals = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await dealsApi.list({
        ...filters,
        q: debouncedQ
      })
      // If res is array (backward compatible check just in case), handle it
      if (Array.isArray(res)) {
        setItems(res)
        setTotal(res.length)
      } else {
        setItems(res.items || [])
        setTotal(res.total || 0)
      }
    } catch (err) {
      setError('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, filters])

  useEffect(() => {
    loadDeals()
  }, [loadDeals])

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  async function onDelete(id) {
    if (!confirm('Delete deal?')) return
    try {
      await dealsApi.remove(id)
      loadDeals()
    } catch (err) {
      setError('Delete failed')
    }
  }

  return (
    <div className="stack">
      <PageHeader
        title="Deals"
        backTo="/"
        actions={<Link className="btn primary" to="/deals/new">+ New Deal</Link>}
      />

      <div className="card noPadding stack">
        <div className="padding">
           <input 
             className="input" 
             placeholder="Search deal name..." 
             value={filters.q}
             onChange={(e) => handleFilterChange({ q: e.target.value })}
           />
        </div>

        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          sortFields={[
            { key: 'name', label: 'Name' },
            { key: 'created_at', label: 'Date Added' }
          ]}
          currentSort={{ field: filters.sortField, order: filters.sortOrder }}
          options={{
            status: [
              { value: 'Negotiation', label: 'Negotiation' },
              { value: 'Closed Won', label: 'Closed Won' },
              { value: 'Closed Lost', label: 'Closed Lost' }
            ]
          }}
        />
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th>Deal Name</th>
              <th>Customer</th>
              <th>Value</th>
              <th>Status</th>
              <th className="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><Link to={`/deals/${item.id}`} className="tableLink">{item.name}</Link></td>
                <td><div className="small">{item.customer_id?.name || '-'}</div></td>
                <td><strong className="small">{item.currency} {item.value?.toLocaleString()}</strong></td>
                <td><span className={`badge ${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                <td className="right">
                  <div className="tableActions">
                    <Link className="iconBtn" to={`/deals/${item.id}/edit`} title="Edit">
                      <Icon name="edit" />
                    </Link>
                    <button className="iconBtn text-danger" onClick={() => onDelete(item.id)} title="Delete">
                      <Icon name="trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && !loading && (
              <tr><td colSpan="5" className="center muted padding30">No deals found.</td></tr>
            )}
            {loading && (
              <tr><td colSpan="5" className="center muted padding30">Loading deals...</td></tr>
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
    </div>
  )
}

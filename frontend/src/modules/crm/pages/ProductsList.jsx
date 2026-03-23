import { useEffect, useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../../../layouts/icons.jsx'
import Pagination from '../../../components/Pagination.jsx'
import FilterBar from '../../../components/FilterBar.jsx'
import PageHeader from '../../../components/PageHeader.jsx'
import { productsApi } from '../../../services/products.js'
import { useDebouncedValue } from '../../../utils/useDebouncedValue.js'

export default function ProductsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    sortField: searchParams.get('sortField') || 'name',
    sortOrder: searchParams.get('sortOrder') || 'asc',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20)),
  })

  const debouncedQ = useDebouncedValue(filters.q, 300)

  useEffect(() => {
    const next = new URLSearchParams()
    if (debouncedQ.trim()) next.set('q', debouncedQ.trim())
    if (filters.category) next.set('category', filters.category)
    if (filters.status) next.set('status', filters.status)
    if (filters.sortField !== 'name') next.set('sortField', filters.sortField)
    if (filters.sortOrder !== 'asc') next.set('sortOrder', filters.sortOrder)
    if (filters.page > 1) next.set('page', String(filters.page))
    if (filters.limit !== 20) next.set('limit', String(filters.limit))
    setSearchParams(next, { replace: true })
  }, [debouncedQ, filters, setSearchParams])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await productsApi.list({ ...filters, q: debouncedQ })
      setItems(res.items || [])
      setTotal(res.total || 0)
    } catch (err) {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, filters])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  async function onDelete(id) {
    if (!confirm('Delete product?')) return
    try {
      await productsApi.remove(id)
      loadProducts()
    } catch (err) {
      setError('Delete failed')
    }
  }

  return (
    <div className="stack">
      <PageHeader
        title="Products"
        backTo="/"
        actions={<Link className="btn primary" to="/products/new">+ New Product</Link>}
      />

      <div className="card noPadding stack">
        <div className="padding">
           <input 
             className="input" 
             placeholder="Search name/SKU..." 
             value={filters.q}
             onChange={(e) => handleFilterChange({ q: e.target.value })}
           />
        </div>

        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          sortFields={[
            { key: 'name', label: 'Name' },
            { key: 'price', label: 'Price' },
            { key: 'stock_quantity', label: 'Stock' }
          ]}
          currentSort={{ field: filters.sortField, order: filters.sortOrder }}
          options={{
            status: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          }}
        />
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="muted padding30 center">Loading products...</div>
      ) : (
        <>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name / SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="stack small-gap">
                        <div className="strong">{p.name}</div>
                        <div className="muted small">{p.sku || 'No SKU'}</div>
                      </div>
                    </td>
                    <td>{p.category || '-'}</td>
                    <td>${p.price?.toFixed(2)}</td>
                    <td>{p.stock_quantity}</td>
                    <td><span className={`badge ${p.status === 'active' ? 'success' : 'warning'}`}>{p.status}</span></td>
                    <td className="right">
                      <div className="tableActions">
                        <Link className="iconBtn" to={`/products/${p.id}/edit`} title="Edit">
                          <Icon name="edit" />
                        </Link>
                        <button className="iconBtn text-danger" onClick={() => onDelete(p.id)} title="Delete">
                          <Icon name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr><td colSpan="6" className="center muted padding30">No products found.</td></tr>
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

import { useEffect, useCallback, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Icon } from '../../../layouts/icons.jsx'
import Pagination from '../../../components/Pagination.jsx'
import FilterBar from '../../../components/FilterBar.jsx'
import PageHeader from '../../../components/PageHeader.jsx'
import { customersApi } from '../../../services/customers.js'
import { useDebouncedValue } from '../../../utils/useDebouncedValue.js'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'

export default function CustomersList() {
  const fileInputRef = useRef(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  useToastFeedback({ error, success: notice })

  // Filter & Sort State
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    companyId: searchParams.get('companyId') || '',
    customer_type: searchParams.get('customer_type') || '',
    sortField: searchParams.get('sortField') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20)),
  })

  const debouncedQ = useDebouncedValue(filters.q, 300)

  useEffect(() => {
    const next = new URLSearchParams()
    if (debouncedQ.trim()) next.set('q', debouncedQ.trim())
    if (filters.companyId) next.set('companyId', filters.companyId)
    if (filters.customer_type) next.set('customer_type', filters.customer_type)
    if (filters.sortField !== 'created_at') next.set('sortField', filters.sortField)
    if (filters.sortOrder !== 'desc') next.set('sortOrder', filters.sortOrder)
    if (filters.page > 1) next.set('page', String(filters.page))
    if (filters.limit !== 20) next.set('limit', String(filters.limit))
    
    setSearchParams(next, { replace: true })
  }, [debouncedQ, filters, setSearchParams])

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await customersApi.list({
        ...filters,
        q: debouncedQ
      })
      setItems(res.items || [])
      setTotal(res.total || 0)
    } catch (err) {
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, filters])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  async function onDelete(id) {
    if (!confirm('Are you sure you want to move this customer to trash?')) return
    try {
      await customersApi.remove(id)
      toast.success('Customer moved to trash')
      loadCustomers()
    } catch (err) {
      setError('Delete failed')
    }
  }

  // CSV stuff...
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function onExport(template = false) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const blob = await customersApi.exportCsv({
        q: debouncedQ,
        companyId: filters.companyId,
        ...(template ? { template: true } : null),
      })
      const filename = template ? `customers-template.csv` : `customers-export.csv`
      downloadBlob(blob, filename)
      setNotice(template ? 'Template downloaded.' : 'Export completed.')
    } catch (e) {
      setError('Export failed')
    } finally {
      setBusy(false)
    }
  }

  async function onImportFileSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const csv = await file.text()
      const res = await customersApi.importCsv({ csv, companyId: filters.companyId })
      setNotice(`Imported ${res.created} customers.`)
      loadCustomers()
    } catch (err) {
      setError('Import failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      <PageHeader
        title="Customers"
        backTo="/"
        actions={
          <div className="row small-gap">
          <button className="btn small" onClick={() => onExport(true)} disabled={busy}>Template</button>
          <button className="btn small" onClick={() => onExport(false)} disabled={busy}>Export</button>
          <button className="btn small" onClick={() => fileInputRef.current?.click()} disabled={busy}>Import</button>
          <Link className="btn primary small" to="/customers/new">+ New</Link>
          </div>
        }
      />

      <div className="card noPadding stack">
        <div className="padding">
           <input 
             className="input" 
             placeholder="Search name/email/phone..." 
             value={filters.q}
             onChange={(e) => handleFilterChange({ q: e.target.value })}
           />
        </div>

        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          resetSort={{ field: 'created_at', order: 'desc' }}
          sortFields={[
            { key: 'name', label: 'Name' },
            { key: 'created_at', label: 'Date Added' },
            { key: 'city', label: 'City' }
          ]}
          currentSort={{ field: filters.sortField, order: filters.sortOrder }}
          options={{
            customer_type: [
              { value: 'Corporate', label: 'Corporate' },
              { value: 'Individual', label: 'Individual' },
              { value: 'Retail', label: 'Retail' }
            ]
          }}
        />
      </div>

      {error && <div className="alert error">{error}</div>}
      {notice && <div className="alert">{notice}</div>}

      <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={onImportFileSelected} />

      {loading ? (
        <div className="muted padding30 center">Loading customers...</div>
      ) : (
        <>

      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Info</th>
              <th>Type</th>
              <th>Location</th>
              <th className="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link to={`/customers/${c.id}`} className="tableLink">{c.name}</Link>
                </td>
                <td>
                   <div className="stack small-gap">
                     <div className="small">{c.email}</div>
                     <div className="muted small">{c.phone}</div>
                   </div>
                </td>
                <td><span className="badge secondary">{c.customer_type}</span></td>
                <td><div className="small">{c.city}{c.city && c.country ? ', ' : ''}{c.country}</div></td>
                <td className="right">
                  <div className="tableActions">
                    <Link className="iconBtn" to={`/customers/${c.id}`} title="Edit">
                      <Icon name="edit" />
                    </Link>
                    <button className="iconBtn text-danger" onClick={() => onDelete(c.id)} title="Delete">
                      <Icon name="trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr><td colSpan="5" className="center muted padding30">No customers found.</td></tr>
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

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Icon } from '../../../layouts/icons.jsx'
import Pagination from '../../../components/Pagination.jsx'
import FilterBar from '../../../components/FilterBar.jsx'
import PageHeader from '../../../components/PageHeader.jsx'
import { companiesApi } from '../../../services/companies.js'
import { useDebouncedValue } from '../../../utils/useDebouncedValue.js'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'

export default function CompaniesList() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useToastFeedback({ error })

  // Filter & Sort State
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    status: searchParams.get('status') || '',
    sortField: searchParams.get('sortField') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20)),
  })

  const debouncedQ = useDebouncedValue(filters.q, 250)

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

  const loadCompanies = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await companiesApi.list({
        ...filters,
        q: debouncedQ
      })
      setItems(res.items || [])
      setTotal(res.total || 0)
    } catch (err) {
      setError('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, filters])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  async function onDelete(id) {
    if (!confirm('Are you sure you want to move this company to trash?')) return
    try {
      await companiesApi.remove(id)
      toast.success('Company moved to trash')
      loadCompanies()
    } catch (err) {
      setError('Delete failed')
    }
  }

  return (
    <div className="stack companiesPage">
      <div className="companiesShell">
        <PageHeader
          title="Companies"
          backTo="/"
          actions={<Link className="btn primary" to="/companies/new">+ New Company</Link>}
        />

        <div className="card noPadding stack">
          <div className="padding">
             <input 
               className="input" 
               placeholder="Search company/email/phone/tax..." 
               value={filters.q}
               onChange={(e) => handleFilterChange({ q: e.target.value })}
             />
          </div>

          <FilterBar 
            filters={filters}
            onFilterChange={handleFilterChange}
            resetSort={{ field: 'created_at', order: 'desc' }}
            sortFields={[
              { key: 'company_name', label: 'Name' },
              { key: 'created_at', label: 'Date Added' }
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

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Email</th>
                <th>Currency</th>
                <th>Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((company) => (
                <tr key={company.id}>
                  <td>{company.company_name}</td>
                  <td>{company.email || '-'}</td>
                  <td>{company.settings?.currency || 'USD'}</td>
                  <td>
                    <span className={`badge ${company.status === 'active' ? 'success' : 'warning'}`}>
                      {company.status || 'active'}
                    </span>
                  </td>
                  <td className="right">
                    <div className="tableActions">
                      <Link className="iconBtn" to={`/companies/${company.id}`} title="Edit">
                        <Icon name="edit" />
                      </Link>
                      <button className="iconBtn text-danger" onClick={() => onDelete(company.id)} title="Delete">
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && !loading && (
                <tr>
                  <td colSpan="5" className="center muted padding30">No companies found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

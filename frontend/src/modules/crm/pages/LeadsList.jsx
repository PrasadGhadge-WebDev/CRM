import { useEffect, useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../../../layouts/icons.jsx'
import Pagination from '../../../components/Pagination.jsx'
import FilterBar from '../../../components/FilterBar.jsx'
import PageHeader from '../../../components/PageHeader.jsx'
import { leadsApi } from '../../../services/leads.js'
import { workflowApi } from '../../../services/workflow.js'
import { useDebouncedValue } from '../../../utils/useDebouncedValue.js'
import { useAuth } from '../../../context/AuthContext'

export default function LeadsList() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter & Sort State
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    status: searchParams.get('status') || '',
    source: searchParams.get('source') || '',
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
    if (filters.source) next.set('source', filters.source)
    if (filters.sortField !== 'created_at') next.set('sortField', filters.sortField)
    if (filters.sortOrder !== 'desc') next.set('sortOrder', filters.sortOrder)
    if (filters.page > 1) next.set('page', String(filters.page))
    if (filters.limit !== 20) next.set('limit', String(filters.limit))
    
    setSearchParams(next, { replace: true })
  }, [debouncedQ, filters, setSearchParams])

  const loadLeads = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await leadsApi.list({
        ...filters,
        q: debouncedQ
      })
      setItems(res.items || [])
      setTotal(res.total || 0)
    } catch (err) {
      setError('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, filters])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  const { user } = useAuth()

  async function handleAssign(id) {
    try {
      await workflowApi.assignLead(id, user.id)
      loadLeads()
    } catch (err) {
      setError('Assignment failed')
    }
  }

  async function handleConvert(lead, type) {
    try {
      if (type === 'deal') {
        await workflowApi.convertToDeal(lead.id, {
          name: `Deal for ${lead.name}`,
          value: 0
        })
      } else {
        await workflowApi.convertToCustomer(lead.id, 'lead', {
          name: lead.name,
          email: lead.email,
          phone: lead.phone
        })
      }
      loadLeads()
    } catch (err) {
      setError('Conversion failed')
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  async function onDelete(id) {
    if (!confirm('Delete lead?')) return
    try {
      await leadsApi.remove(id)
      loadLeads()
    } catch (err) {
      setError('Delete failed')
    }
  }

  return (
    <div className="stack">
      <PageHeader
        title="Leads"
        backTo="/"
        actions={<Link className="btn primary" to="/leads/new">+ New Lead</Link>}
      />

      <div className="card noPadding stack">
        <div className="padding">
           <input 
             className="input" 
             placeholder="Quick search name/email/phone..." 
             value={filters.q}
             onChange={(e) => handleFilterChange({ q: e.target.value })}
           />
        </div>

        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          sortFields={[
            { key: 'name', label: 'Name' },
            { key: 'city', label: 'City' },
            { key: 'created_at', label: 'Date Added' }
          ]}
          currentSort={{ field: filters.sortField, order: filters.sortOrder }}
          options={{
            status: [
              { value: 'New', label: 'New' },
              { value: 'Contacted', label: 'Contacted' },
              { value: 'Quality Lead', label: 'Quality Lead' },
              { value: 'Converted', label: 'Converted' },
              { value: 'Dead', label: 'Dead' }
            ],
            source: [
              { value: 'Website', label: 'Website' },
              { value: 'Referral', label: 'Referral' },
              { value: 'Social Media', label: 'Social Media' }
            ]
          }}
        />
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Source</th>
              <th>Contact</th>
              <th className="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr key={l.id}>
                <td>
                  <Link to={`/leads/${l.id}`} className="tableLink">
                    {l.name}
                  </Link>
                </td>
                <td><span className={`badge ${l.status.toLowerCase().replace(' ', '-')}`}>{l.status}</span></td>
                <td>{l.source}</td>
                <td>
                  <div className="stack small-gap">
                    <div className="small">{l.email}</div>
                    <div className="muted small">{l.phone}</div>
                  </div>
                </td>
                <td className="right">
                  <div className="tableActions">
                    {!l.assigned_to && (
                      <button className="iconBtn highlight" onClick={() => handleAssign(l.id)} title="Assign to me">
                        <Icon name="user" />
                      </button>
                    )}
                    {l.status !== 'Converted' && (
                      <button className="iconBtn success" onClick={() => handleConvert(l, 'deal')} title="Convert to Deal">
                        <Icon name="deals" />
                      </button>
                    )}
                    <Link className="iconBtn" to={`/leads/${l.id}/edit`} title="Edit">
                      <Icon name="edit" />
                    </Link>
                    <button className="iconBtn text-danger" onClick={() => onDelete(l.id)} title="Delete">
                      <Icon name="trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan="5" className="center muted padding30">No leads found matching your criteria.</td>
              </tr>
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

import { useEffect, useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Icon } from '../../../layouts/icons.jsx'
import Pagination from '../../../components/Pagination.jsx'
import FilterBar from '../../../components/FilterBar.jsx'
import PageHeader from '../../../components/PageHeader.jsx'
import { leadsApi } from '../../../services/leads.js'
import { workflowApi } from '../../../services/workflow.js'
import { useDebouncedValue } from '../../../utils/useDebouncedValue.js'
import { useAuth } from '../../../context/AuthContext'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'

const FETCH_LIMIT = 1000

function normalizeText(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim().toLowerCase()
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString()
}

function getLeadSearchText(lead) {
  return [
    lead.name,
    lead.email,
    lead.phone,
    lead.status,
    lead.source,
    lead.city,
    lead.country,
    lead.assigned_to,
    lead.company_id,
    formatDate(lead.created_at),
    formatDate(lead.follow_up_date),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function getSortValue(lead, field) {
  if (field === 'created_at' || field === 'follow_up_date') {
    const timestamp = lead[field] ? new Date(lead[field]).getTime() : 0
    return Number.isNaN(timestamp) ? 0 : timestamp
  }

  return normalizeText(lead[field])
}

function compareLeads(a, b, field, order) {
  const direction = order === 'asc' ? 1 : -1
  const aValue = getSortValue(a, field)
  const bValue = getSortValue(b, field)

  if (aValue < bValue) return -1 * direction
  if (aValue > bValue) return 1 * direction
  return 0
}

function getStatusClass(status) {
  const value = normalizeText(status).replace(/\s+/g, '-')

  switch (value) {
    case 'converted':
      return 'success'
    case 'contacted':
      return 'info'
    case 'quality-lead':
      return 'warning'
    case 'dead':
      return 'danger'
    default:
      return 'secondary'
  }
}

export default function LeadsList() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useToastFeedback({ error })

  // Filter & Sort State
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    status: searchParams.get('status') || '',
    source: searchParams.get('source') || '',
    sortField: searchParams.get('sortField') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20)),
    view: searchParams.get('view') === 'all' ? 'all' : 'page',
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
    if (filters.view === 'all') next.set('view', 'all')
    
    setSearchParams(next, { replace: true })
  }, [debouncedQ, filters, setSearchParams])

  const loadLeads = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await leadsApi.list({
        status: filters.status || undefined,
        source: filters.source || undefined,
        page: 1,
        limit: FETCH_LIMIT,
      })
      setItems(res.items || [])
    } catch (err) {
      setError('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [filters.source, filters.status])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  const { user } = useAuth()

  const filteredItems = useMemo(() => {
    const query = debouncedQ.trim().toLowerCase()
    const nextItems = query
      ? items.filter((lead) => getLeadSearchText(lead).includes(query))
      : items

    return [...nextItems].sort((a, b) => compareLeads(a, b, filters.sortField, filters.sortOrder))
  }, [debouncedQ, filters.sortField, filters.sortOrder, items])

  const total = filteredItems.length
  const visibleItems = useMemo(() => {
    if (filters.view === 'all') return filteredItems

    const start = (filters.page - 1) * filters.limit
    return filteredItems.slice(start, start + filters.limit)
  }, [filteredItems, filters.limit, filters.page, filters.view])

  async function handleAssign(id) {
    try {
      await workflowApi.assignLead(id, user.id)
      toast.success('Lead assigned successfully')
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
      toast.success(`Lead converted to ${type === 'deal' ? 'deal' : 'customer'} successfully`)
      loadLeads()
    } catch (err) {
      setError('Conversion failed')
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1,
    }))
  }

  async function onDelete(id) {
    if (!confirm('Are you sure you want to move this lead to trash?')) return
    try {
      await leadsApi.remove(id)
      toast.success('Lead moved to trash')
      loadLeads()
    } catch (err) {
      setError('Delete failed')
    }
  }

  const toggleViewMode = () => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      view: prev.view === 'all' ? 'page' : 'all',
    }))
  }

  return (
    <div className="stack">
      <PageHeader
        title="Leads"
        backTo="/"
        actions={
          <div className="leadsHeaderActions">
            <button className="btn secondary small" onClick={toggleViewMode}>
              {filters.view === 'all' ? 'Paged View' : 'View All Leads'}
            </button>
            <Link className="btn primary" to="/leads/new">+ New Lead</Link>
          </div>
        }
      />

      <div className="card noPadding stack">
        <div className="padding">
           <input 
             className="input" 
             placeholder="Search all columns: name, email, phone, city, source, status..." 
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
            { key: 'city', label: 'City' },
            { key: 'status', label: 'Status' },
            { key: 'follow_up_date', label: 'Follow-up Date' },
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

      {loading ? (
        <div className="muted padding30 center">Loading leads...</div>
      ) : (
      <div className="tableWrap">
        <table className="table leadsTable">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Status</th>
              <th>Source</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Date Added</th>
              <th>Follow-up</th>
              <th>Assigned</th>
              <th className="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((l) => (
              <tr key={l.id}>
                <td>
                  <div className="stack small-gap">
                    <Link to={`/leads/${l.id}`} className="tableLink">
                      {l.name}
                    </Link>
                    <div className="muted small">ID: {l.id}</div>
                  </div>
                </td>
                <td><span className={`badge ${getStatusClass(l.status)}`}>{l.status || '-'}</span></td>
                <td>{l.source || '-'}</td>
                <td>
                  <div className="stack small-gap">
                    <div className="small">{l.email || '-'}</div>
                    <div className="muted small">{l.phone || '-'}</div>
                  </div>
                </td>
                <td>
                  <div className="stack small-gap">
                    <div className="small">{l.city || '-'}</div>
                    <div className="muted small">{l.country || '-'}</div>
                  </div>
                </td>
                <td>{formatDate(l.created_at)}</td>
                <td>{formatDate(l.follow_up_date)}</td>
                <td>{l.assigned_to || 'Unassigned'}</td>
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
            {!visibleItems.length && (
              <tr>
                <td colSpan="9" className="center muted padding30">No leads found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      <div className="leadsListFooter">
        <div className="muted small">
          Showing {visibleItems.length} of {total} matching leads
        </div>
        {filters.view !== 'all' && (
          <Pagination 
            page={filters.page} 
            limit={filters.limit} 
            total={total} 
            onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))} 
            onLimitChange={(l) => setFilters(prev => ({ ...prev, limit: l, page: 1 }))}
          />
        )}
      </div>

      <style>{`
        .leadsHeaderActions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }
        .leadsListFooter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        @media (max-width: 760px) {
          .leadsHeaderActions,
          .leadsListFooter {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  )
}

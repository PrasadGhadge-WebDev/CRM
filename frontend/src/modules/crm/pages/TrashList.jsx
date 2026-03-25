import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import PageHeader from '../../../components/PageHeader.jsx'
import Pagination from '../../../components/Pagination.jsx'
import { Icon } from '../../../layouts/icons.jsx'
import { trashApi } from '../../../services/trash.js'
import { useDebouncedValue } from '../../../utils/useDebouncedValue.js'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'

const ENTITY_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'company', label: 'Companies' },
  { value: 'customer', label: 'Customers' },
  { value: 'lead', label: 'Leads' },
  { value: 'deal', label: 'Deals' },
  { value: 'product', label: 'Products' },
  { value: 'user', label: 'Users' },
  { value: 'activity', label: 'Tasks' },
  { value: 'lead-status', label: 'Lead Status' },
  { value: 'lead-source', label: 'Lead Source' },
  { value: 'customer-type', label: 'Customer Type' },
  { value: 'industry-type', label: 'Industry Type' },
]

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

export default function TrashList() {
  const [q, setQ] = useState('')
  const [entityType, setEntityType] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useToastFeedback({ error })

  const debouncedQ = useDebouncedValue(q, 250)
  const summaryLabel = useMemo(() => `${items.length} of ${total} deleted items`, [items.length, total])

  useEffect(() => {
    let canceled = false
    setLoading(true)
    setError('')

    trashApi
      .list({
        ...(debouncedQ.trim() ? { q: debouncedQ.trim() } : null),
        ...(entityType ? { entityType } : null),
        page,
        limit,
      })
      .then((res) => {
        if (canceled) return
        setItems(res.items || [])
        setTotal(Number(res.total) || 0)
      })
      .catch((e) => {
        if (canceled) return
        setError(e.message || 'Failed to load trash')
      })
      .finally(() => {
        if (canceled) return
        setLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [debouncedQ, entityType, page, limit])

  async function onRestore(itemId) {
    if (!confirm('Are you sure you want to restore this entry?')) return
    await trashApi.restore(itemId)
    toast.success('Item restored successfully')
    setItems((prev) => prev.filter((item) => item.id !== itemId))
    setTotal((current) => Math.max(0, current - 1))
  }

  async function onPermanentDelete(itemId) {
    if (!confirm('This will permanently delete this entry and cannot be undone. Continue?')) return
    await trashApi.remove(itemId)
    toast.success('Item permanently deleted')
    setItems((prev) => prev.filter((item) => item.id !== itemId))
    setTotal((current) => Math.max(0, current - 1))
  }

  return (
    <div className="stack">
      <PageHeader title="Trash" backTo="/" />

      <div className="muted">{summaryLabel}</div>

      <div className="filters">
        <input
          className="input"
          value={q}
          onChange={(event) => {
            setQ(event.target.value)
            setPage(1)
          }}
          placeholder="Search deleted items..."
        />
        <select
          className="input"
          value={entityType}
          onChange={(event) => {
            setEntityType(event.target.value)
            setPage(1)
          }}
        >
          {ENTITY_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      {loading ? (
        <div className="muted">Loading...</div>
      ) : (
        <>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Entry</th>
                  <th>Type</th>
                  <th>Deleted By</th>
                  <th>Deleted At</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title || '-'}</td>
                      <td>{item.entity_type || '-'}</td>
                      <td>{item.deleted_by?.name || item.deleted_by?.email || '-'}</td>
                      <td>{formatDateTime(item.deleted_at)}</td>
                      <td className="right">
                        <div className="tableActions">
                          <button
                            className="iconBtn"
                            type="button"
                            title="Restore item"
                            aria-label="Restore item"
                            onClick={() => onRestore(item.id)}
                          >
                            <Icon name="undo" />
                          </button>
                          <button
                            className="iconBtn text-danger"
                            type="button"
                            title="Delete permanently"
                            aria-label="Delete permanently"
                            onClick={() => onPermanentDelete(item.id)}
                          >
                            <Icon name="trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">
                      <div className="emptyState">
                        <div className="emptyStateTitle">Trash is empty</div>
                        <div className="emptyStateText">
                          Deleted entries will appear here and can be restored or permanently deleted later.
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={(nextPage) => setPage(Math.max(1, nextPage))}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit)
              setPage(1)
            }}
          />
        </>
      )}
    </div>
  )
}

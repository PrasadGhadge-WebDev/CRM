import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Pagination from '../../../components/Pagination.jsx'
import { leadsApi } from '../../../services/leads.js'
import { useDebouncedValue } from '../../../utils/useDebouncedValue.js'

export default function LeadsList() {
  const [searchParams, setSearchParams] = useSearchParams()

  const qParam = searchParams.get('q') || ''
  const statusParam = searchParams.get('status') || ''
  const sourceParam = searchParams.get('source') || ''
  const pageParam = Math.max(1, Number(searchParams.get('page') || 1) || 1)
  const limitParam = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20) || 20))

  const [items, setItems] = useState([])
  const [q, setQ] = useState(qParam)
  const [status, setStatus] = useState(statusParam)
  const [source, setSource] = useState(sourceParam)
  const [page, setPage] = useState(pageParam)
  const [limit, setLimit] = useState(limitParam)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const debouncedQ = useDebouncedValue(q, 250)

  useEffect(() => setQ(qParam), [qParam])
  useEffect(() => setStatus(statusParam), [statusParam])
  useEffect(() => setSource(sourceParam), [sourceParam])
  useEffect(() => setPage(pageParam), [pageParam])
  useEffect(() => setLimit(limitParam), [limitParam])

  const desiredParams = useMemo(() => {
    const next = new URLSearchParams()
    const trimmedQ = debouncedQ.trim()
    if (trimmedQ) next.set('q', trimmedQ)
    if (status.trim()) next.set('status', status.trim())
    if (source.trim()) next.set('source', source.trim())
    if (page > 1) next.set('page', String(page))
    if (limit !== 20) next.set('limit', String(limit))
    return next
  }, [debouncedQ, status, source, page, limit])

  useEffect(() => {
    if (desiredParams.toString() === searchParams.toString()) return
    setSearchParams(desiredParams, { replace: true })
  }, [desiredParams, searchParams, setSearchParams])

  useEffect(() => {
    let canceled = false
    setLoading(true)
    setError('')
    leadsApi
      .list({
        ...(debouncedQ.trim() ? { q: debouncedQ.trim() } : null),
        ...(status.trim() ? { status: status.trim() } : null),
        ...(source.trim() ? { source: source.trim() } : null),
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
        setError(e.message || 'Failed to load leads')
      })
      .finally(() => {
        if (canceled) return
        setLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [debouncedQ, status, source, page, limit])

  async function onDelete(id) {
    if (!confirm('Delete this lead?')) return
    await leadsApi.remove(id)
    setItems((prev) => prev.filter((x) => x.id !== id))
    setTotal((t) => Math.max(0, (Number(t) || 0) - 1))
  }

  return (
    <div className="stack">
      <div className="row">
        <h1>Leads</h1>
        <Link className="btn primary" to="/leads/new">
          + New
        </Link>
      </div>

      <div className="filters">
        <input
          className="input"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(1)
          }}
          placeholder="Search name/email/phone..."
        />
        <input
          className="input"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          placeholder="status (optional)"
        />
        <input
          className="input"
          value={source}
          onChange={(e) => {
            setSource(e.target.value)
            setPage(1)
          }}
          placeholder="source (optional)"
        />
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <Link to={`/leads/${l.id}`} style={{ color: 'inherit' }}>
                          {l.name || '-'}
                        </Link>
                      </td>
                      <td>{l.email || '-'}</td>
                      <td>{l.phone || '-'}</td>
                      <td>{l.status || '-'}</td>
                      <td>{l.source || '-'}</td>
                      <td className="right">
                        <Link className="btn" to={`/leads/${l.id}`}>
                          View
                        </Link>{' '}
                        <Link className="btn" to={`/leads/${l.id}/edit`}>
                          Edit
                        </Link>{' '}
                        <button className="btn danger" onClick={() => onDelete(l.id)} type="button">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="muted">
                      No leads found.
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
            onPageChange={(p) => setPage(Math.max(1, p))}
            onLimitChange={(l) => {
              setLimit(l)
              setPage(1)
            }}
          />
        </>
      )}
    </div>
  )
}


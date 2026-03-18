import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Pagination from '../../../components/Pagination.jsx'
import { customersApi } from '../../../services/customers.js'
import { useDebouncedValue } from '../../../utils/useDebouncedValue.js'

export default function CustomersList() {
  const fileInputRef = useRef(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const qParam = searchParams.get('q') || ''
  const companyIdParam = searchParams.get('companyId') || ''
  const pageParam = Math.max(1, Number(searchParams.get('page') || 1) || 1)
  const limitParam = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20) || 20))

  const [items, setItems] = useState([])
  const [q, setQ] = useState(qParam)
  const [companyId, setCompanyId] = useState(companyIdParam)
  const [page, setPage] = useState(pageParam)
  const [limit, setLimit] = useState(limitParam)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const debouncedQ = useDebouncedValue(q, 250)

  useEffect(() => setQ(qParam), [qParam])
  useEffect(() => setCompanyId(companyIdParam), [companyIdParam])
  useEffect(() => setPage(pageParam), [pageParam])
  useEffect(() => setLimit(limitParam), [limitParam])

  const desiredParams = useMemo(() => {
    const next = new URLSearchParams()
    const trimmed = debouncedQ.trim()
    if (trimmed) next.set('q', trimmed)
    if (companyId.trim()) next.set('companyId', companyId.trim())
    if (page > 1) next.set('page', String(page))
    if (limit !== 20) next.set('limit', String(limit))
    return next
  }, [debouncedQ, companyId, page, limit])

  useEffect(() => {
    if (desiredParams.toString() === searchParams.toString()) return
    setSearchParams(desiredParams, { replace: true })
  }, [desiredParams, searchParams, setSearchParams])

  useEffect(() => {
    let canceled = false
    setLoading(true)
    setError('')
    customersApi
      .list({
        ...(debouncedQ.trim() ? { q: debouncedQ.trim() } : null),
        ...(companyId.trim() ? { companyId: companyId.trim() } : null),
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
        setError(e.message || 'Failed to load customers')
      })
      .finally(() => {
        if (canceled) return
        setLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [debouncedQ, companyId, page, limit])

  async function onDelete(id) {
    if (!confirm('Delete this customer?')) return
    await customersApi.remove(id)
    setItems((prev) => prev.filter((x) => x.id !== id))
    setTotal((t) => Math.max(0, (Number(t) || 0) - 1))
  }

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
        ...(debouncedQ.trim() ? { q: debouncedQ.trim() } : null),
        ...(companyId.trim() ? { companyId: companyId.trim() } : null),
        ...(template ? { template: true } : null),
      })
      const date = new Date().toISOString().slice(0, 10)
      const filename = template ? `customers-template-${date}.csv` : `customers-${date}.csv`
      downloadBlob(blob, filename)
      setNotice(template ? 'Template downloaded.' : 'Export downloaded.')
    } catch (e) {
      setError(e.message || 'Failed to export CSV')
    } finally {
      setBusy(false)
    }
  }

  async function onPickImportFile() {
    setError('')
    setNotice('')
    fileInputRef.current?.click()
  }

  async function onImportFileSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setBusy(true)
    setError('')
    setNotice('')

    try {
      const csv = await file.text()
      const res = await customersApi.importCsv({ csv, companyId: companyId.trim() || undefined })
      const errorsCount = Array.isArray(res.errors) ? res.errors.length : 0
      setNotice(
        `Imported ${res.created || 0} customers. Skipped ${res.skipped || 0} rows.` +
          (errorsCount ? ` ${errorsCount} rows failed.` : ''),
      )
    } catch (err) {
      setError(err.message || 'Failed to import CSV')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      <div className="row">
        <h1>Customers</h1>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" type="button" onClick={() => onExport(true)} disabled={busy}>
            Template CSV
          </button>
          <button className="btn" type="button" onClick={() => onExport(false)} disabled={busy}>
            Export CSV
          </button>
          <button className="btn" type="button" onClick={onPickImportFile} disabled={busy}>
            Import CSV
          </button>
          <Link className="btn primary" to="/customers/new">
            + New
          </Link>
        </div>
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
          value={companyId}
          onChange={(e) => {
            setCompanyId(e.target.value)
            setPage(1)
          }}
          placeholder="companyId (optional)"
        />
        <div />
      </div>

      {error ? <div className="alert error">{error}</div> : null}
      {notice ? <div className="alert">{notice}</div> : null}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={onImportFileSelected}
      />

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
                  <th>Type</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.email || '-'}</td>
                      <td>{c.phone || '-'}</td>
                      <td>{c.customer_type || '-'}</td>
                      <td className="right">
                        <Link className="btn" to={`/customers/${c.id}`}>
                          Edit
                        </Link>{' '}
                        <button className="btn danger" onClick={() => onDelete(c.id)} type="button">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="muted">
                      No customers found.
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

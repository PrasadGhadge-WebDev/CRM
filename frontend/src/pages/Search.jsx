import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { customersApi } from '../services/customers.js'
import { leadsApi } from '../services/leads.js'
import { useDebouncedValue } from '../utils/useDebouncedValue.js'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const qParam = searchParams.get('q') || ''

  const [q, setQ] = useState(qParam)
  const debouncedQ = useDebouncedValue(q, 250)

  const [customers, setCustomers] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => setQ(qParam), [qParam])

  const desiredParams = useMemo(() => {
    const next = new URLSearchParams()
    const trimmed = debouncedQ.trim()
    if (trimmed) next.set('q', trimmed)
    return next
  }, [debouncedQ])

  useEffect(() => {
    if (desiredParams.toString() === searchParams.toString()) return
    setSearchParams(desiredParams, { replace: true })
  }, [desiredParams, searchParams, setSearchParams])

  const query = useMemo(() => {
    const trimmed = (qParam || '').trim()
    return trimmed ? { q: trimmed, limit: 10 } : null
  }, [qParam])

  useEffect(() => {
    let canceled = false
    setError('')
    setCustomers([])
    setLeads([])
    if (!query) return

    setLoading(true)
    Promise.all([customersApi.list(query), leadsApi.list(query)])
      .then(([c, l]) => {
        if (canceled) return
        setCustomers(c.items || [])
        setLeads(l.items || [])
      })
      .catch((e) => {
        if (canceled) return
        setError(e.message || 'Search failed')
      })
      .finally(() => {
        if (canceled) return
        setLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [query])

  return (
    <div className="stack">
      <div className="row">
        <h1>Search</h1>
        <div className="muted">Customers + Leads</div>
      </div>

      <div className="filters">
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type to search name/email/phone/source..."
        />
        <div />
        <div />
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      {!qParam.trim() ? <div className="muted">Enter a search term.</div> : null}
      {loading ? <div className="muted">Searching...</div> : null}

      {qParam.trim() && !loading ? (
        <div className="grid2">
          <div className="card stack">
            <div className="row">
              <h2>Customers</h2>
              <Link className="btn" to={`/customers?q=${encodeURIComponent(qParam.trim())}`}>
                Open list
              </Link>
            </div>
            {customers.length ? (
              <div className="stack">
                {customers.map((c) => (
                  <Link key={c.id} className="resultRow" to={`/customers/${c.id}`}>
                    <div>
                      <div className="resultTitle">{c.name}</div>
                      <div className="muted resultSub">
                        {c.email || '-'} • {c.phone || '-'}
                      </div>
                    </div>
                    <span className="btn">Edit</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="muted">No matching customers.</div>
            )}
          </div>

          <div className="card stack">
            <div className="row">
              <h2>Leads</h2>
              <Link className="btn" to={`/leads?q=${encodeURIComponent(qParam.trim())}`}>
                Open list
              </Link>
            </div>
            {leads.length ? (
              <div className="stack">
                {leads.map((l) => (
                  <Link key={l.id} className="resultRow" to={`/leads/${l.id}`}>
                    <div>
                      <div className="resultTitle">{l.name}</div>
                      <div className="muted resultSub">
                        {l.status || '-'} • {l.source || '-'} • {l.phone || '-'}
                      </div>
                    </div>
                    <span className="btn primary">Open</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="muted">No matching leads.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

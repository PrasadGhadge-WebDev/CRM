import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Pagination from '../../../components/Pagination.jsx'
import PageHeader from '../../../components/PageHeader.jsx'
import { companiesApi } from '../../../services/companies.js'
import { usersApi } from '../../../services/users.js'
import { useDebouncedValue } from '../../../utils/useDebouncedValue.js'

export default function UsersList() {
  const [searchParams, setSearchParams] = useSearchParams()

  const qParam = searchParams.get('q') || ''
  const statusParam = searchParams.get('status') || ''
  const companyIdParam = searchParams.get('companyId') || ''
  const pageParam = Math.max(1, Number(searchParams.get('page') || 1) || 1)
  const limitParam = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20) || 20))

  const [items, setItems] = useState([])
  const [companies, setCompanies] = useState([])
  const [q, setQ] = useState(qParam)
  const [status, setStatus] = useState(statusParam)
  const [companyId, setCompanyId] = useState(companyIdParam)
  const [page, setPage] = useState(pageParam)
  const [limit, setLimit] = useState(limitParam)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const debouncedQ = useDebouncedValue(q, 250)

  useEffect(() => {
    companiesApi
      .list({ limit: 100 })
      .then((res) => setCompanies(res.items || []))
      .catch(() => {})
  }, [])

  useEffect(() => setQ(qParam), [qParam])
  useEffect(() => setStatus(statusParam), [statusParam])
  useEffect(() => setCompanyId(companyIdParam), [companyIdParam])
  useEffect(() => setPage(pageParam), [pageParam])
  useEffect(() => setLimit(limitParam), [limitParam])

  const desiredParams = useMemo(() => {
    const next = new URLSearchParams()
    const trimmedQ = debouncedQ.trim()
    if (trimmedQ) next.set('q', trimmedQ)
    if (status.trim()) next.set('status', status.trim())
    if (companyId.trim()) next.set('companyId', companyId.trim())
    if (page > 1) next.set('page', String(page))
    if (limit !== 20) next.set('limit', String(limit))
    return next
  }, [debouncedQ, status, companyId, page, limit])

  useEffect(() => {
    if (desiredParams.toString() === searchParams.toString()) return
    setSearchParams(desiredParams, { replace: true })
  }, [desiredParams, searchParams, setSearchParams])

  useEffect(() => {
    let canceled = false
    setLoading(true)
    setError('')

    usersApi
      .list({
        ...(debouncedQ.trim() ? { q: debouncedQ.trim() } : null),
        ...(status.trim() ? { status: status.trim() } : null),
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
        setError(e.message || 'Failed to load users')
      })
      .finally(() => {
        if (canceled) return
        setLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [debouncedQ, status, companyId, page, limit])

  async function onDelete(id) {
    if (!confirm('Delete this user?')) return
    await usersApi.remove(id)
    setItems((prev) => prev.filter((x) => x.id !== id))
    setTotal((t) => Math.max(0, (Number(t) || 0) - 1))
  }

  return (
    <div className="stack">
      <PageHeader
        title="Users"
        backTo="/"
        actions={
          <Link className="btn primary" to="/users/new">
            + New
          </Link>
        }
      />

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
        <select
          className="input"
          value={companyId}
          onChange={(e) => {
            setCompanyId(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All companies</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.company_name}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name || user.username || '-'}</td>
                      <td>{user.email || '-'}</td>
                      <td>{user.role || 'Admin'}</td>
                      <td>{user.company_id?.company_name || '-'}</td>
                      <td>
                        <span className={`badge ${user.status === 'active' ? 'success' : 'warning'}`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="right">
                        <div className="tableActions">
                          <Link className="btn" to={`/users/${user.id}`}>
                            Edit
                          </Link>
                          <button className="btn danger" type="button" onClick={() => onDelete(user.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="emptyState">
                        <div className="emptyStateTitle">No users found</div>
                        <div className="emptyStateText">
                          Add CRM users and link them to companies so account ownership is easier to manage.
                        </div>
                        <Link className="btn primary" to="/users/new">
                          + New User
                        </Link>
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

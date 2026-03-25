import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Pagination from '../../../components/Pagination.jsx'
import PageHeader from '../../../components/PageHeader.jsx'
import { Icon } from '../../../layouts/icons.jsx'
import { usersApi } from '../../../services/users.js'
import { useDebouncedValue } from '../../../utils/useDebouncedValue.js'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'

const ROLE_OPTIONS = ['Admin', 'Manager', 'Accountant', 'Employee']

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

function stopRowNavigation(event) {
  event.stopPropagation()
}

export default function UsersList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const qParam = searchParams.get('q') || ''
  const statusParam = searchParams.get('status') || ''
  const roleParam = searchParams.get('role') || ''
  const pageParam = Math.max(1, Number(searchParams.get('page') || 1) || 1)
  const rawLimitParam = (searchParams.get('limit') || '20').trim().toLowerCase()
  const limitParam =
    rawLimitParam === 'all' ? 'all' : Math.min(100, Math.max(1, Number(rawLimitParam) || 20))

  const [items, setItems] = useState([])
  const [q, setQ] = useState(qParam)
  const [status, setStatus] = useState(statusParam)
  const [role, setRole] = useState(roleParam)
  const [page, setPage] = useState(pageParam)
  const [limit, setLimit] = useState(limitParam)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useToastFeedback({ error })

  const debouncedQ = useDebouncedValue(q, 250)

  useEffect(() => setQ(qParam), [qParam])
  useEffect(() => setStatus(statusParam), [statusParam])
  useEffect(() => setRole(roleParam), [roleParam])
  useEffect(() => setPage(pageParam), [pageParam])
  useEffect(() => setLimit(limitParam), [limitParam])

  const desiredParams = useMemo(() => {
    const next = new URLSearchParams()
    const trimmedQ = debouncedQ.trim()
    if (trimmedQ) next.set('q', trimmedQ)
    if (status.trim()) next.set('status', status.trim())
    if (role.trim()) next.set('role', role.trim())
    if (page > 1) next.set('page', String(page))
    if (String(limit) !== '20') next.set('limit', String(limit))
    return next
  }, [debouncedQ, status, role, page, limit])

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
        ...(role.trim() ? { role: role.trim() } : null),
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
  }, [debouncedQ, status, role, page, limit])

  async function onDelete(id) {
    if (!confirm('Are you sure you want to move this user to trash?')) return
    await usersApi.remove(id)
    toast.success('User moved to trash')
    setItems((prev) => prev.filter((x) => x.id !== id))
    setTotal((t) => Math.max(0, (Number(t) || 0) - 1))
  }

  return (
    <div className="stack">
      <PageHeader
        title="Users"
        backTo="/"
        actions={
          <div className="tableActions">
            <button
              className="iconBtn"
              type="button"
              title="View all users"
              aria-label="View all users"
              onClick={() => {
                setLimit('all')
                setPage(1)
              }}
            >
              <Icon name="users" />
            </button>
            <Link className="iconBtn" to="/users/new" title="Add user" aria-label="Add user">
              <Icon name="plus" />
            </Link>
          </div>
        }
      />

      <div className="muted">
        Showing {items.length} of {total} users
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
        <select
          className="input"
          value={role}
          onChange={(e) => {
            setRole(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All Roles</option>
          {ROLE_OPTIONS.map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {roleOption}
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
          <option value="">All Status</option>
          <option value="pending">Pending</option>
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
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((user) => (
                    <tr
                      key={user.id}
                      className="tableRowLink"
                      onClick={() => {
                        navigate(`/users/${user.id}`)
                      }}
                    >
                      <td>
                        <div className="userIdentity">
                          {user.profile_photo ? (
                            <img
                              className="tableAvatarImage"
                              src={user.profile_photo}
                              alt={user.name || user.username || 'User'}
                            />
                          ) : (
                            <div className="avatar tableAvatarFallback">
                              {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <Link
                              className="tableLink"
                              to={`/users/${user.id}`}
                              onClick={stopRowNavigation}
                            >
                              {user.name || user.username || '-'}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td>{user.email || '-'}</td>
                      <td>{user.role || 'Admin'}</td>
                      <td>
                        <span className={`badge ${user.status === 'active' ? 'success' : user.status === 'pending' ? 'info' : 'warning'}`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td>{formatDateTime(user.created_at)}</td>
                      <td>{formatDateTime(user.updated_at)}</td>
                      <td className="right">
                        <div className="tableActions">
                          <Link
                            className="iconBtn"
                            to={`/users/${user.id}/edit`}
                            title="Edit user"
                            aria-label="Edit user"
                            onClick={stopRowNavigation}
                          >
                            <Icon name="edit" />
                          </Link>
                          <button
                            className="iconBtn text-danger"
                            type="button"
                            onClick={(event) => {
                              stopRowNavigation(event)
                              onDelete(user.id)
                            }}
                            title="Delete user"
                            aria-label="Delete user"
                          >
                            <Icon name="trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
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

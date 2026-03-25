import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import PageHeader from '../../../components/PageHeader.jsx'
import { usersApi } from '../../../services/users.js'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/

export default function UserDetail() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resetForm, setResetForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [resettingPassword, setResettingPassword] = useState(false)
  useToastFeedback({ error })

  useEffect(() => {
    let canceled = false
    setLoading(true)
    setError('')

    usersApi
      .get(id)
      .then((data) => {
        if (canceled) return
        setUser(data)
      })
      .catch((e) => {
        if (canceled) return
        setError(e.message || 'Failed to load user')
      })
      .finally(() => {
        if (canceled) return
        setLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [id])

  async function handleResetPassword(e) {
    e.preventDefault()
    setError('')

    if (!resetForm.newPassword || !resetForm.confirmPassword) {
      setError('Fill in both password fields')
      return
    }

    if (!PASSWORD_RULE.test(resetForm.newPassword)) {
      setError('New password must be at least 6 characters and include letters and numbers')
      return
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setResettingPassword(true)

    try {
      const res = await usersApi.resetPassword(id, { newPassword: resetForm.newPassword })
      setResetForm({ newPassword: '', confirmPassword: '' })
      toast.success(res.message || 'User password reset successfully')
    } catch (e) {
      setError(e.message || 'Failed to reset password')
    } finally {
      setResettingPassword(false)
    }
  }

  if (loading) return <div className="muted">Loading...</div>
  if (error) return <div className="alert error">{error}</div>
  if (!user) return <div className="muted">User not found.</div>

  return (
    <div className="stack">
      <PageHeader
        title={user.name || user.username || 'User'}
        backTo="/users"
        actions={
          <div className="tableActions">
            <Link className="btn" to="/users">
              View User List
            </Link>
            <Link className="btn" to={`/users/${user.id}/edit`}>
              Edit
            </Link>
          </div>
        }
      />

      <div className="card">
        <div className="grid2">
          <div>
            <div className="kv">
              <div className="k">Name</div>
              <div className="v">{user.name || '-'}</div>
            </div>
            <div className="kv">
              <div className="k">Email</div>
              <div className="v">{user.email || '-'}</div>
            </div>
            <div className="kv">
              <div className="k">Phone</div>
              <div className="v">{user.phone || '-'}</div>
            </div>
          </div>
          <div>
            <div className="kv">
              <div className="k">Role</div>
              <div className="v">{user.role || 'Admin'}</div>
            </div>
            <div className="kv">
              <div className="k">Status</div>
              <div className="v">{user.status || 'active'}</div>
            </div>
          </div>
        </div>
      </div>

      <form className="card stack" onSubmit={handleResetPassword}>
        <h3>Reset Password</h3>
        <div className="muted">
          Admin can set a new password for this user.
        </div>
        <div className="grid2">
          <div className="field">
            <label>New Password</label>
            <input
              className="input"
              type="password"
              value={resetForm.newPassword}
              onChange={(e) => setResetForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input
              className="input"
              type="password"
              value={resetForm.confirmPassword}
              onChange={(e) => setResetForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </div>
        </div>
        <div className="row">
          <button className="btn primary" type="submit" disabled={resettingPassword}>
            {resettingPassword ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </div>
  )
}

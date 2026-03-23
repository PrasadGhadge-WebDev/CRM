import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../../components/PageHeader.jsx'
import { companiesApi } from '../../../services/companies.js'
import { usersApi } from '../../../services/users.js'

const emptyUser = {
  company_id: '',
  role_id: '',
  role: 'Admin',
  name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  profile_photo: '',
  status: 'active',
}

export default function UserForm({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [model, setModel] = useState(emptyUser)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const title = useMemo(() => (isEdit ? 'Edit User' : 'New User'), [isEdit])

  useEffect(() => {
    companiesApi
      .list({ limit: 100 })
      .then((res) => setCompanies(res.items || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    let canceled = false
    setLoading(true)

    usersApi
      .get(id)
      .then((data) => {
        if (canceled) return
        setModel({
          ...emptyUser,
          ...data,
          company_id: data.company_id?.id || data.company_id || '',
          password: '',
        })
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
  }, [id, isEdit])

  function onChange(field) {
    return (e) => {
      const value = e.target.value
      setModel((prev) => ({
        ...prev,
        [field]: value,
        ...(field === 'name' && !prev.username ? { username: value } : null),
      }))
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = { ...model }
      if (!payload.company_id) delete payload.company_id
      if (!payload.password) delete payload.password
      if (!payload.username) payload.username = payload.name

      const saved = isEdit ? await usersApi.update(id, payload) : await usersApi.create(payload)
      navigate(`/users/${saved.id}`)
    } catch (err) {
      setError(err.message || 'Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="stack">
      <PageHeader title={title} backTo="/users" />

      {error ? <div className="alert error">{error}</div> : null}
      {loading ? (
        <div className="muted">Loading...</div>
      ) : (
        <form className="form stack" onSubmit={onSubmit}>
          <div className="grid2">
            <div className="field">
              <label>Name *</label>
              <input className="input" required value={model.name} onChange={onChange('name')} />
            </div>
            <div className="field">
              <label>Email *</label>
              <input className="input" required type="email" value={model.email} onChange={onChange('email')} />
            </div>

            <div className="field">
              <label>Username</label>
              <input className="input" value={model.username} onChange={onChange('username')} />
            </div>
            <div className="field">
              <label>Password {isEdit ? '(leave blank to keep current)' : '*'}</label>
              <input
                className="input"
                required={!isEdit}
                minLength={6}
                type="password"
                value={model.password}
                onChange={onChange('password')}
              />
            </div>

            <div className="field">
              <label>Company</label>
              <select className="input" value={model.company_id} onChange={onChange('company_id')}>
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Phone</label>
              <input className="input" value={model.phone} onChange={onChange('phone')} />
            </div>

            <div className="field">
              <label>Role *</label>
              <select className="input" required value={model.role} onChange={onChange('role')}>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div className="field">
              <label>Status</label>
              <select className="input" value={model.status} onChange={onChange('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="field">
              <label>Profile Photo URL</label>
              <input className="input" value={model.profile_photo} onChange={onChange('profile_photo')} />
            </div>
          </div>

          <div className="row">
            <button className="btn primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

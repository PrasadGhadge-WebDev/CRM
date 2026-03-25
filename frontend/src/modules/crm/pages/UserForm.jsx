import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import PageHeader from '../../../components/PageHeader.jsx'
import { usersApi } from '../../../services/users.js'
import {
  normalizeDigits,
  normalizeName,
  validateEmail,
  validateName,
  validatePhone,
  validateRequired,
} from '../../../utils/formValidation.js'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'

const emptyUser = {
  role: 'Admin',
  name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  status: 'active',
}

export default function UserForm({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [model, setModel] = useState(emptyUser)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  useToastFeedback({ error })

  const title = useMemo(() => (isEdit ? 'Edit User' : 'New User'), [isEdit])

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
      const rawValue = e.target.value
      const value =
        field === 'phone' ? normalizeDigits(rawValue) : field === 'name' ? normalizeName(rawValue) : rawValue

      let nextFieldError = ''
      if (field === 'name') {
        nextFieldError = validateRequired('Name', value) || validateName('Name', value)
      }
      if (field === 'email') {
        nextFieldError = validateRequired('Email', value) || validateEmail('Email', value)
      }

      setModel((prev) => ({
        ...prev,
        [field]: value,
        ...(field === 'name' && !prev.username ? { username: value } : null),
      }))
      setFieldErrors((prev) => ({
        ...prev,
        [field]: nextFieldError,
      }))
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    const validationError =
      validateRequired('Name', model.name) ||
      validateName('Name', model.name) ||
      validateEmail('Email', model.email) ||
      validateRequired('Email', model.email) ||
      validatePhone('Phone', model.phone) ||
      (!isEdit ? validateRequired('Password', model.password) : '') ||
      (model.password ? (model.password.length < 6 ? 'Password must be at least 6 characters' : '') : '')
    if (validationError) {
      setFieldErrors({
        name: validateRequired('Name', model.name) || validateName('Name', model.name),
        email: validateRequired('Email', model.email) || validateEmail('Email', model.email),
      })
      setError(validationError)
      return
    }
    setSaving(true)
    setError('')

    try {
      const payload = { ...model }
      if (!payload.password) delete payload.password
      if (!payload.username) payload.username = payload.name

      const saved = isEdit ? await usersApi.update(id, payload) : await usersApi.create(payload)
      toast.success(`User ${isEdit ? 'updated' : 'created'} successfully`)
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
              {fieldErrors.name ? <div className="text-danger small">{fieldErrors.name}</div> : null}
            </div>
            <div className="field">
              <label>Email *</label>
              <input className="input" required type="email" value={model.email} onChange={onChange('email')} />
              {fieldErrors.email ? <div className="text-danger small">{fieldErrors.email}</div> : null}
            </div>
            <div className="field">
              <label>Phone</label>
              <input className="input" value={model.phone} onChange={onChange('phone')} inputMode="numeric" maxLength={10} />
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
              <label>Role *</label>
              <select className="input" required value={model.role} onChange={onChange('role')}>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Accountant">Accountant</option>
                <option value="Employee">Employee</option>
              </select>
            </div>

            <div className="field">
              <label>Status</label>
              <select className="input" value={model.status} onChange={onChange('status')}>
                <option value="pending">Pending Approval</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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

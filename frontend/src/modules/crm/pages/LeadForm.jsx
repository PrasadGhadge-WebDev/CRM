import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import PageHeader from '../../../components/PageHeader.jsx'
import { leadsApi } from '../../../services/leads.js'
import { masterDataApi } from '../../../services/masterData.js'
import { usersApi } from '../../../services/users.js'
import { normalizeDigits, validateEmail, validatePhone, validateRequired } from '../../../utils/formValidation.js'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'

const emptyLead = {
  company_id: '',
  name: '',
  email: '',
  phone: '',
  source: '',
  status: 'new',
  assigned_to: '',
  follow_up_date: '',
  notes: '',
}

const fallbackStatuses = [
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
]

const fallbackSources = [
  { value: 'website', label: 'Website' },
  { value: 'call', label: 'Call' },
  { value: 'reference', label: 'Reference' },
]

function formatDateForInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export default function LeadForm({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [model, setModel] = useState(emptyLead)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [statuses, setStatuses] = useState([])
  const [sources, setSources] = useState([])
  const [employees, setEmployees] = useState([])
  useToastFeedback({ error })

  const title = useMemo(() => (isEdit ? 'Edit Lead' : 'New Lead'), [isEdit])

  useEffect(() => {
    Promise.all([
      masterDataApi.list('lead-status'),
      masterDataApi.list('lead-source'),
      usersApi.list({ limit: 100 }),
    ])
      .then(([statusRes, sourceRes, userRes]) => {
        setStatuses(statusRes.items || [])
        setSources(sourceRes.items || [])
        setEmployees((userRes.items || []).filter((user) => user.role === 'Employee' && user.status === 'active'))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    let canceled = false
    setLoading(true)
    leadsApi
      .get(id)
      .then((data) => {
        if (canceled) return
        setModel({
          ...emptyLead,
          ...data,
          company_id: data.company_id || '',
          assigned_to: data.assigned_to || '',
          follow_up_date: formatDateForInput(data.follow_up_date),
          status: data.status || 'new',
        })
      })
      .catch((e) => {
        if (canceled) return
        setError(e.message || 'Failed to load lead')
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
      const value = field === 'phone' ? normalizeDigits(e.target.value) : e.target.value
      setModel((prev) => ({ ...prev, [field]: value }))
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    const validationError =
      validateRequired('Name', model.name) ||
      validatePhone('Phone', model.phone, { required: true }) ||
      validateEmail('Email', model.email)
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = { ...model }
      if (!payload.company_id) delete payload.company_id
      if (!payload.assigned_to) delete payload.assigned_to
      if (!payload.follow_up_date) delete payload.follow_up_date
      const saved = isEdit ? await leadsApi.update(id, payload) : await leadsApi.create(payload)
      toast.success(`Lead ${isEdit ? 'updated' : 'created'} successfully`)
      navigate(`/leads/${saved.id}`)
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const statusOptions = statuses.length ? statuses : fallbackStatuses
  const sourceOptions = sources.length ? sources : fallbackSources

  return (
    <div className="stack">
      <PageHeader title={title} backTo="/leads" />

      {error ? <div className="alert error">{error}</div> : null}
      {loading ? (
        <div className="muted">Loading...</div>
      ) : (
        <form className="form stack" onSubmit={onSubmit}>
          <div className="grid2">
            <div className="field">
              <label>Name *</label>
              <input className="input" required value={model.name} onChange={onChange('name')} placeholder="Customer name" />
            </div>

            <div className="field">
              <label>Phone *</label>
              <input
                className="input"
                required
                type="tel"
                inputMode="numeric"
                value={model.phone}
                onChange={onChange('phone')}
                placeholder="Mobile number"
                maxLength={10}
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                className="input"
                type="email"
                value={model.email}
                onChange={onChange('email')}
                placeholder="Email address"
              />
            </div>

            <div className="field">
              <label>Source</label>
              <select className="input" value={model.source} onChange={onChange('source')}>
                <option value="">Select source</option>
                {sourceOptions.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Status</label>
              <select className="input" value={model.status} onChange={onChange('status')}>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Assigned To</label>
              <select className="input" value={model.assigned_to} onChange={onChange('assigned_to')}>
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Follow-up Date</label>
              <input className="input" type="date" value={model.follow_up_date} onChange={onChange('follow_up_date')} />
            </div>

            <div className="field">
              <label>Notes / Description</label>
              <textarea
                className="input"
                rows="4"
                value={model.notes}
                onChange={onChange('notes')}
                placeholder="Extra information"
              />
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

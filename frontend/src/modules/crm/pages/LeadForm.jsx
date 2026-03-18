import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { leadsApi } from '../../../services/leads.js'

const emptyLead = {
  company_id: '',
  name: '',
  email: '',
  phone: '',
  source: '',
  status: 'new',
  assigned_to: '',
  notes: '',
}

export default function LeadForm({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [model, setModel] = useState(emptyLead)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const title = useMemo(() => (isEdit ? 'Edit Lead' : 'New Lead'), [isEdit])

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
    return (e) => setModel((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...model }
      if (!payload.company_id) delete payload.company_id
      if (!payload.assigned_to) delete payload.assigned_to
      const saved = isEdit ? await leadsApi.update(id, payload) : await leadsApi.create(payload)
      navigate(`/leads/${saved.id}`)
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="stack">
      <div className="row">
        <h1>{title}</h1>
        <Link className="btn" to="/leads">
          Back
        </Link>
      </div>

      {error ? <div className="alert error">{error}</div> : null}
      {loading ? (
        <div className="muted">Loading...</div>
      ) : (
        <form className="form stack" onSubmit={onSubmit}>
          <div className="grid2">
            <div className="field">
              <label>Company ID (optional)</label>
              <input className="input" value={model.company_id} onChange={onChange('company_id')} />
            </div>
            <div className="field">
              <label>Assigned To (user id, optional)</label>
              <input className="input" value={model.assigned_to} onChange={onChange('assigned_to')} />
            </div>

            <div className="field">
              <label>Name *</label>
              <input className="input" required value={model.name} onChange={onChange('name')} />
            </div>
            <div className="field">
              <label>Status</label>
              <input className="input" value={model.status} onChange={onChange('status')} />
            </div>

            <div className="field">
              <label>Email</label>
              <input className="input" value={model.email} onChange={onChange('email')} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input className="input" value={model.phone} onChange={onChange('phone')} />
            </div>

            <div className="field">
              <label>Source</label>
              <input className="input" value={model.source} onChange={onChange('source')} />
            </div>
            <div className="field">
              <label>Notes</label>
              <input className="input" value={model.notes} onChange={onChange('notes')} />
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

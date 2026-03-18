import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { customersApi } from '../../../services/customers.js'

const emptyCustomer = {
  company_id: '',
  name: '',
  email: '',
  phone: '',
  alternate_phone: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  customer_type: '',
  notes: '',
}

export default function CustomerForm({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [model, setModel] = useState(emptyCustomer)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const title = useMemo(() => (isEdit ? 'Edit Customer' : 'New Customer'), [isEdit])

  useEffect(() => {
    if (!isEdit) return
    let canceled = false
    setLoading(true)
    customersApi
      .get(id)
      .then((data) => {
        if (canceled) return
        setModel({ ...emptyCustomer, ...data, company_id: data.company_id || '' })
      })
      .catch((e) => {
        if (canceled) return
        setError(e.message || 'Failed to load customer')
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
      const saved = isEdit ? await customersApi.update(id, payload) : await customersApi.create(payload)
      navigate(`/customers/${saved.id}`)
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
        <Link className="btn" to="/customers">
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
              <label>Customer Type</label>
              <input className="input" value={model.customer_type} onChange={onChange('customer_type')} />
            </div>

            <div className="field">
              <label>Name *</label>
              <input className="input" required value={model.name} onChange={onChange('name')} />
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
              <label>Alternate Phone</label>
              <input className="input" value={model.alternate_phone} onChange={onChange('alternate_phone')} />
            </div>

            <div className="field">
              <label>Address</label>
              <input className="input" value={model.address} onChange={onChange('address')} />
            </div>
            <div className="field">
              <label>City</label>
              <input className="input" value={model.city} onChange={onChange('city')} />
            </div>

            <div className="field">
              <label>State</label>
              <input className="input" value={model.state} onChange={onChange('state')} />
            </div>
            <div className="field">
              <label>Country</label>
              <input className="input" value={model.country} onChange={onChange('country')} />
            </div>

            <div className="field">
              <label>Postal Code</label>
              <input className="input" value={model.postal_code} onChange={onChange('postal_code')} />
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

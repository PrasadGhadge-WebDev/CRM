import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import PageHeader from '../../../components/PageHeader.jsx'
import { customersApi } from '../../../services/customers.js'
import { masterDataApi } from '../../../services/masterData.js'
import { normalizeDigits, validateEmail, validatePhone, validateRequired } from '../../../utils/formValidation.js'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'

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
  const [types, setTypes] = useState([])
  useToastFeedback({ error })

  const title = useMemo(() => (isEdit ? 'Edit Customer' : 'New Customer'), [isEdit])

  useEffect(() => {
    masterDataApi.list('customer-type').then(res => setTypes(res.items || []))
  }, [])

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
    return (e) => {
      const value =
        field === 'phone' || field === 'alternate_phone' ? normalizeDigits(e.target.value) : e.target.value
      setModel((prev) => ({ ...prev, [field]: value }))
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    const validationError =
      validateRequired('Name', model.name) ||
      validateEmail('Email', model.email) ||
      validatePhone('Phone', model.phone) ||
      validatePhone('Alternate phone', model.alternate_phone)
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = { ...model }
      if (!payload.company_id) delete payload.company_id
      const saved = isEdit ? await customersApi.update(id, payload) : await customersApi.create(payload)
      toast.success(`Customer ${isEdit ? 'updated' : 'created'} successfully`)
      navigate(`/customers/${saved.id}`)
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="stack">
      <PageHeader title={title} backTo="/customers" />

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
              <select className="input" value={model.customer_type} onChange={onChange('customer_type')}>
                <option value="">Select type...</option>
                {types.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Name *</label>
              <input className="input" required value={model.name} onChange={onChange('name')} />
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" value={model.email} onChange={onChange('email')} />
            </div>

            <div className="field">
              <label>Phone</label>
              <input className="input" value={model.phone} onChange={onChange('phone')} inputMode="numeric" maxLength={10} />
            </div>
            <div className="field">
              <label>Alternate Phone</label>
              <input className="input" value={model.alternate_phone} onChange={onChange('alternate_phone')} inputMode="numeric" maxLength={10} />
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

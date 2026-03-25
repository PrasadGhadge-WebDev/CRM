import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import PageHeader from '../../../components/PageHeader.jsx'
import { companiesApi } from '../../../services/companies.js'
import { normalizeDigits, validateEmail, validatePhone, validateRequired, isValidUrl } from '../../../utils/formValidation.js'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'

const emptyCompany = {
  company_name: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  tax_number: '',
  logo: '',
  status: 'active',
  settings: {
    currency: 'USD',
    timezone: 'UTC',
    fiscal_year_start: 'January',
  },
}

export default function CompanyForm({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [model, setModel] = useState(emptyCompany)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [logoHint, setLogoHint] = useState('')
  useToastFeedback({ error: loading ? '' : error })

  const title = useMemo(() => (isEdit ? 'Edit Company' : 'New Company'), [isEdit])

  useEffect(() => {
    if (!isEdit) return
    let canceled = false
    setLoading(true)

    companiesApi
      .get(id)
      .then((data) => {
        if (canceled) return
        setModel({ ...emptyCompany, ...data })
      })
      .catch((e) => {
        if (canceled) return
        setError(e.message || 'Failed to load company')
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

  function onLogoFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1024 * 1024) {
      setError('Logo file must be under 1MB')
      e.target.value = ''
      return
    }

    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      setModel((prev) => ({ ...prev, logo: reader.result }))
      setLogoHint(file.name)
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  function clearLogo() {
    setModel((prev) => ({ ...prev, logo: '' }))
    setLogoHint('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    const validationError =
      validateRequired('Company name', model.company_name) ||
      validateEmail('Email', model.email) ||
      validatePhone('Phone', model.phone) ||
      (!isValidUrl(model.website) ? 'Enter a valid website URL' : '')
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    setError('')

    try {
      const saved = isEdit ? await companiesApi.update(id, model) : await companiesApi.create(model)
      toast.success(`Company ${isEdit ? 'updated' : 'created'} successfully!`)
      navigate(`/companies/${saved.id}`)
    } catch (err) {
      const msg = err.message || 'Failed to save company'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="stack">
      <PageHeader title={title} backTo="/companies" />

      {error ? <div className="alert error">{error}</div> : null}
      {loading ? (
        <div className="muted">Loading...</div>
      ) : (
        <form className="form stack" onSubmit={onSubmit}>
          <div className="grid2">
            <div className="field">
              <label>Company Name *</label>
              <input className="input" required value={model.company_name} onChange={onChange('company_name')} />
            </div>
            <div className="field">
              <label>Status</label>
              <select className="input" value={model.status} onChange={onChange('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
              <label>Website</label>
              <input className="input" value={model.website} onChange={onChange('website')} />
            </div>
            <div className="field">
              <label>Tax Number</label>
              <input className="input" value={model.tax_number} onChange={onChange('tax_number')} />
            </div>

            <div className="field">
              <label>Logo</label>
              <input className="input" type="file" accept="image/png,image/jpeg,image/jpg" onChange={onLogoFile} />
              <div className="muted" style={{ fontSize: 12 }}>
                Upload PNG/JPG up to 1MB. Stored as a data URL.
              </div>
              {model.logo ? (
                <div
                  style={{
                    marginTop: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <img
                    src={model.logo}
                    alt="Company logo preview"
                    style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 12, border: '1px solid var(--border)' }}
                  />
                  <div style={{ display: 'grid', gap: 6 }}>
                    <div className="muted" style={{ fontSize: 13 }}>
                      {logoHint || 'Current logo'}
                    </div>
                    <button type="button" className="btn" onClick={clearLogo}>
                      Remove Logo
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="field">
              <label>Address</label>
              <input className="input" value={model.address} onChange={onChange('address')} />
            </div>
          </div>

          <div className="card stack">
            <h3>Company Settings</h3>
            <div className="grid2">
              <div className="field">
                <label>Currency</label>
                <select
                  className="input"
                  value={model.settings?.currency}
                  onChange={(e) =>
                    setModel((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, currency: e.target.value },
                    }))
                  }
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              <div className="field">
                <label>Timezone</label>
                <select
                  className="input"
                  value={model.settings?.timezone}
                  onChange={(e) =>
                    setModel((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, timezone: e.target.value },
                    }))
                  }
                >
                  <option value="UTC">UTC</option>
                  <option value="GMT">GMT</option>
                  <option value="EST">EST</option>
                  <option value="IST">IST</option>
                </select>
              </div>
              <div className="field">
                <label>Fiscal Year Start</label>
                <select
                  className="input"
                  value={model.settings?.fiscal_year_start}
                  onChange={(e) =>
                    setModel((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, fiscal_year_start: e.target.value },
                    }))
                  }
                >
                  <option value="January">January</option>
                  <option value="April">April</option>
                  <option value="July">July</option>
                  <option value="October">October</option>
                </select>
              </div>
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

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../../components/PageHeader.jsx'
import { dealsApi } from '../../../services/deals'
import { customersApi } from '../../../services/customers'

const emptyDeal = {
  name: '',
  customer_id: '',
  value: 0,
  currency: 'USD',
  status: 'open',
  expected_close_date: '',
  description: '',
}

export default function DealForm({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [model, setModel] = useState(emptyDeal)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    customersApi.list({ limit: 100 }).then((res) => setCustomers(res.items || []))

    if (isEdit) {
      dealsApi.get(id).then((data) => {
        setModel({
          ...data,
          customer_id: data.customer_id?.id || data.customer_id || '',
          expected_close_date: data.expected_close_date ? data.expected_close_date.split('T')[0] : '',
        })
        setLoading(false)
      })
    }
  }, [id, isEdit])

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const saved = isEdit ? await dealsApi.update(id, model) : await dealsApi.create(model)
      navigate(`/deals/${saved.id}`)
    } catch (err) {
      setError('Failed to save deal')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="muted">Loading...</div>

  return (
    <div className="stack">
      <PageHeader title={isEdit ? 'Edit Deal' : 'New Deal'} backTo="/deals" />

      <form className="card stack" onSubmit={onSubmit}>
        {error && <div className="alert error">{error}</div>}
        <div className="grid2">
          <div className="field">
            <label>Deal Name *</label>
            <input
              className="input"
              required
              value={model.name}
              onChange={(e) => setModel({ ...model, name: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Customer *</label>
            <select
              className="input"
              required
              value={model.customer_id}
              onChange={(e) => setModel({ ...model, customer_id: e.target.value })}
            >
              <option value="">Select Customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Value</label>
            <div style={{ display: 'flex', gap: 8 }}>
               <select className="input" style={{ width: 80 }} value={model.currency} onChange={e => setModel({ ...model, currency: e.target.value })}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
               </select>
               <input
                className="input"
                type="number"
                value={model.value}
                onChange={(e) => setModel({ ...model, value: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="field">
            <label>Status</label>
            <select
              className="input"
              value={model.status}
              onChange={(e) => setModel({ ...model, status: e.target.value })}
            >
              <option value="open">Open</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="field">
            <label>Expected Close Date</label>
            <input
              className="input"
              type="date"
              value={model.expected_close_date}
              onChange={(e) => setModel({ ...model, expected_close_date: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea
            className="input"
            rows={4}
            value={model.description}
            onChange={(e) => setModel({ ...model, description: e.target.value })}
          />
        </div>
        <button className="btn primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Deal'}
        </button>
      </form>
    </div>
  )
}

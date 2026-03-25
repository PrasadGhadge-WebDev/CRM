import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { masterDataApi } from '../../../services/masterData'
import Pagination from '../../../components/Pagination.jsx'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../../components/PageHeader.jsx'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'

const CATEGORIES = [
  { id: 'lead-status', label: 'Lead Statuses' },
  { id: 'lead-source', label: 'Lead Sources' },
  { id: 'customer-type', label: 'Customer Types' },
  { id: 'industry-type', label: 'Industry Types' },
]

export default function MasterData() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Math.max(1, Number(searchParams.get('page')) || 1)

  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id)
  const [items, setItems] = useState([])
  const [page, setPage] = useState(pageParam)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(Number(searchParams.get('limit')) || 10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState({ label: '', value: '', color: '#5b5ef7', order: 0 })
  useToastFeedback({ error })

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (page > 1) next.set('page', String(page))
    else next.delete('page')
    if (limit !== 10) next.set('limit', String(limit))
    else next.delete('limit')
    setSearchParams(next, { replace: true })
  }, [page, limit, setSearchParams])

  useEffect(() => {
    setPage(1)
  }, [activeCategory])

  useEffect(() => {
    loadItems()
  }, [activeCategory, page, limit])

  async function loadItems() {
    setLoading(true)
    setError('')
    try {
      const data = await masterDataApi.list(activeCategory, { page, limit })
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message || 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (editingItem) {
        await masterDataApi.update(activeCategory, editingItem.id, form)
      } else {
        await masterDataApi.create(activeCategory, form)
      }
      setForm({ label: '', value: '', color: '#5b5ef7', order: 0 })
      setEditingItem(null)
      toast.success(`Item ${editingItem ? 'updated' : 'created'} successfully`)
      loadItems()
    } catch (err) {
      setError(err.message || 'Failed to save item')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to move this item to trash?')) return
    try {
      await masterDataApi.remove(activeCategory, id)
      toast.success('Item moved to trash')
      loadItems()
    } catch (err) {
      setError(err.message || 'Failed to delete item')
    }
  }

  function startEdit(item) {
    setEditingItem(item)
    setForm({ label: item.label, value: item.value, color: item.color || '#5b5ef7', order: item.order || 0 })
  }

  return (
    <div className="stack">
      <PageHeader title="Master Data Management" backTo="/" />

      <div className="tabRow" style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`btn ${activeCategory === cat.id ? 'primary' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="grid2" style={{ alignItems: 'start' }}>
        <form className="card stack" onSubmit={handleSubmit}>
          <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
          <div className="field">
            <label>Label</label>
            <input
              className="input"
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. New Lead"
            />
          </div>
          <div className="field">
            <label>Value (API Key)</label>
            <input
              className="input"
              required
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              placeholder="e.g. new_lead"
              disabled={!!editingItem}
            />
          </div>
          <div className="field">
            <label>Color</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                style={{ width: 44, height: 44, padding: 0, border: 'none', background: 'none' }}
              />
              <input
                className="input"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label>Display Order</label>
            <input
              className="input"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            />
          </div>
          <div className="row">
            <button className="btn primary" type="submit">
              {editingItem ? 'Update' : 'Add Item'}
            </button>
            {editingItem && (
                <button className="btn" type="button" onClick={() => { setEditingItem(null); setForm({ label: '', value: '', color: '#5b5ef7', order: 0 }); }}>
                    Cancel
                </button>
            )}
          </div>
        </form>

        <div className="card noPadding">
          {loading ? (
            <div className="padding muted">Loading items...</div>
          ) : items.length ? (
            <div className="stack">
              <table className="table">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Value</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color }} />
                          {item.label}
                        </div>
                      </td>
                      <td>{item.value}</td>
                      <td className="right">
                        <div className="tableActions">
                          <button className="btn" onClick={() => startEdit(item)}>Edit</button>
                          <button className="btn danger" onClick={() => handleDelete(item.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="padding">
                <Pagination 
                  page={page} 
                  limit={limit} 
                  total={total} 
                  onPageChange={(p) => setPage(p)} 
                  onLimitChange={(l) => { setLimit(l); setPage(1); }}
                />
              </div>
            </div>
          ) : (
            <div className="padding muted">No items defined for this category.</div>
          )}
        </div>
      </div>
    </div>
  )
}

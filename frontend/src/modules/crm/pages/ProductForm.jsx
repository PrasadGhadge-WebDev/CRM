import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import PageHeader from '../../../components/PageHeader.jsx'
import { productsApi } from '../../../services/products.js'
import { validateNonNegativeNumber, validateRequired } from '../../../utils/formValidation.js'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'

export default function ProductForm({ mode = 'create' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(mode === 'edit')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useToastFeedback({ error })

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    sku: '',
    stock_quantity: 0,
    status: 'active'
  })

  useEffect(() => {
    if (mode === 'edit' && id) {
      productsApi.get(id)
        .then(p => {
          setForm({
            name: p.name || '',
            description: p.description || '',
            price: p.price || 0,
            category: p.category || '',
            sku: p.sku || '',
            stock_quantity: p.stock_quantity || 0,
            status: p.status || 'active'
          })
          setLoading(false)
        })
        .catch(() => {
          setError('Failed to load product')
          setLoading(false)
        })
    }
  }, [mode, id])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationError =
      validateRequired('Product name', form.name) ||
      validateNonNegativeNumber('Price', form.price) ||
      validateNonNegativeNumber('Stock quantity', form.stock_quantity)
    if (validationError) {
      setError(validationError)
      return
    }
    setBusy(true)
    setError('')
    try {
      if (mode === 'edit') {
        await productsApi.update(id, form)
      } else {
        await productsApi.create(form)
      }
      toast.success(`Product ${mode === 'edit' ? 'updated' : 'created'} successfully`)
      navigate('/products')
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
      setBusy(false)
    }
  }

  if (loading) return <div className="muted">Loading...</div>

  return (
    <div className="stack">
      <PageHeader title={mode === 'edit' ? 'Edit Product' : 'New Product'} backTo="/products" />

      <div className="card">
        <form className="stack" onSubmit={handleSubmit}>
          {error && <div className="alert error">{error}</div>}

          <div className="grid2">
            <div className="field">
              <label>Product Name <span className="text-danger">*</span></label>
              <input 
                className="input" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="field">
              <label>SKU (Stock Keeping Unit)</label>
              <input 
                className="input" 
                name="sku" 
                value={form.sku} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea 
              className="input" 
              name="description" 
              rows="3" 
              value={form.description} 
              onChange={handleChange} 
            />
          </div>

          <div className="grid2">
            <div className="field">
              <label>Price ($) <span className="text-danger">*</span></label>
              <input 
                className="input" 
                type="number" 
                step="0.01" 
                min="0"
                name="price" 
                value={form.price} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="field">
              <label>Stock Quantity</label>
              <input 
                className="input" 
                type="number" 
                min="0"
                name="stock_quantity" 
                value={form.stock_quantity} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="grid2">
            <div className="field">
              <label>Category</label>
              <input 
                className="input" 
                name="category" 
                value={form.category} 
                onChange={handleChange} 
              />
            </div>
            <div className="field">
              <label>Status</label>
              <select className="input" name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="row reverse">
            <button className="btn primary" type="submit" disabled={busy}>
              {busy ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

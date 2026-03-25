import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { customersApi } from '../../../services/customers.js'
import { workflowApi } from '../../../services/workflow.js'
import Timeline from '../../../components/Timeline.jsx'
import AttachmentManager from '../../../components/AttachmentManager.jsx'
import PageHeader from '../../../components/PageHeader.jsx'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'

export default function CustomerDetail() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useToastFeedback({ error })

  useEffect(() => {
    let canceled = false
    setLoading(true)
    setError('')
    customersApi.get(id)
      .then((c) => {
        if (canceled) return
        setCustomer(c)
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
  }, [id])

  async function handleCreateOrder() {
    try {
      await workflowApi.createOrder({
        customerId: id,
        orderItems: [{ name: 'Implementation Service', quantity: 1, price: 500 }],
        totalAmount: 500
      })
      toast.success('Order created successfully')
    } catch (e) {
      setError('Order creation failed')
    }
  }

  async function handleCreateTicket() {
    const subject = prompt('Enter ticket subject:')
    if (!subject) return
    try {
      await workflowApi.createSupportTicket({
        customerId: id,
        subject,
        description: 'New ticket from customer detail page',
        priority: 'medium'
      })
      toast.success('Support ticket created successfully')
    } catch (e) {
      setError('Ticket creation failed')
    }
  }

  if (loading) return <div className="muted">Loading...</div>
  if (error) return <div className="alert error">{error}</div>
  if (!customer) return <div className="muted">Customer not found.</div>

  return (
    <div className="stack">
      <PageHeader
        title={customer.name}
        backTo="/customers"
        actions={
          <div className="row small-gap">
          <button className="btn success" onClick={handleCreateOrder}>Create Order</button>
          <button className="btn highlight" onClick={handleCreateTicket}>New Ticket</button>
          <Link className="btn" to={`/customers/${customer.id}/edit`}>
            Edit
          </Link>
          </div>
        }
      />

      <div className="card">
        <div className="grid2">
          <div>
            <div className="kv">
              <div className="k">Type</div>
              <div className="v">{customer.customer_type || '-'}</div>
            </div>
            <div className="kv">
              <div className="k">Email</div>
              <div className="v">{customer.email || '-'}</div>
            </div>
            <div className="kv">
              <div className="k">Phone</div>
              <div className="v">{customer.phone || '-'}</div>
            </div>
          </div>
          <div>
            <div className="kv">
              <div className="k">Address</div>
              <div className="v">{customer.address || '-'}</div>
            </div>
            <div className="kv">
              <div className="k">City</div>
              <div className="v">{customer.city || '-'}</div>
            </div>
            <div className="kv">
              <div className="k">Country</div>
              <div className="v">{customer.country || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      <Timeline relatedId={id} relatedType="Customer" />
      <AttachmentManager relatedId={id} relatedType="Customer" />
    </div>
  )
}

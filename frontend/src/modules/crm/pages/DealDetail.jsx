import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { dealsApi } from '../../../services/deals'
import Timeline from '../../../components/Timeline.jsx'
import AttachmentManager from '../../../components/AttachmentManager.jsx'
import PageHeader from '../../../components/PageHeader.jsx'

export default function DealDetail() {
  const { id } = useParams()
  const [deal, setDeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dealsApi.get(id)
      .then(setDeal)
      .catch((err) => setError('Failed to load deal'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="muted">Loading...</div>
  if (error) return <div className="alert error">{error}</div>
  if (!deal) return <div className="muted">Deal not found.</div>

  return (
    <div className="stack">
      <PageHeader
        title={deal.name}
        backTo="/deals"
        actions={
          <div className="row">
          <Link className="btn" to={`/deals/${deal.id}/edit`}>
            Edit
          </Link>
          </div>
        }
      />

      <div className="card">
        <div className="grid2">
          <div>
            <div className="kv">
              <div className="k">Value</div>
              <div className="v">{deal.currency} {deal.value?.toLocaleString()}</div>
            </div>
            <div className="kv">
              <div className="k">Status</div>
              <div className="v"><span className={`badge ${deal.status}`}>{deal.status}</span></div>
            </div>
            <div className="kv">
              <div className="k">Customer</div>
              <div className="v">
                {deal.customer_id?.name ? (
                   <Link to={`/customers/${deal.customer_id.id}`} className="link">{deal.customer_id.name}</Link>
                ) : '-'}
              </div>
            </div>
          </div>
          <div>
            <div className="kv">
              <div className="k">Expected Close</div>
              <div className="v">{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '-'}</div>
            </div>
            <div className="kv">
              <div className="k">Assigned To</div>
              <div className="v">{deal.assigned_to?.name || '-'}</div>
            </div>
          </div>
        </div>
        {deal.description && (
          <div className="kv" style={{ marginTop: 12 }}>
            <div className="k">Description</div>
            <div className="v" style={{ whiteSpace: 'pre-wrap' }}>{deal.description}</div>
          </div>
        )}
      </div>

      <Timeline relatedId={id} relatedType="Deal" />
      <AttachmentManager relatedId={id} relatedType="Deal" />
    </div>
  )
}

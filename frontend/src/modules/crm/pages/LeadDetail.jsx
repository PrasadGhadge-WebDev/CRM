import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { leadsApi } from '../../../services/leads.js'
import { workflowApi } from '../../../services/workflow.js'
import { useAuth } from '../../../context/AuthContext'
import Timeline from '../../../components/Timeline.jsx'
import AttachmentManager from '../../../components/AttachmentManager.jsx'
import PageHeader from '../../../components/PageHeader.jsx'

export default function LeadDetail() {
  const { id } = useParams()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let canceled = false
    setLoading(true)
    setError('')
    leadsApi.get(id)
      .then((l) => {
        if (canceled) return
        setLead(l)
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
  }, [id])

  const { user } = useAuth()

  async function handleAssign() {
    try {
      const updated = await workflowApi.assignLead(id, user.id)
      setLead(updated)
    } catch (e) {
      setError('Assignment failed')
    }
  }

  async function handleConvert() {
    try {
      await workflowApi.convertToDeal(id, { name: `Deal for ${lead.name}`, value: 0 })
      // Refresh lead
      const updated = await leadsApi.get(id)
      setLead(updated)
    } catch (e) {
      setError('Conversion failed')
    }
  }

  if (loading) return <div className="muted">Loading...</div>
  if (error) return <div className="alert error">{error}</div>
  if (!lead) return <div className="muted">Lead not found.</div>

  return (
    <div className="stack">
      <PageHeader
        title={lead.name}
        backTo="/leads"
        actions={
          <div className="row small-gap">
          {!lead.assigned_to && (
            <button className="btn highlight" onClick={handleAssign}>Assign to Me</button>
          )}
          {lead.status !== 'converted' && (
            <button className="btn success" onClick={handleConvert}>Convert to Deal</button>
          )}
          <Link className="btn" to={`/leads/${lead.id}/edit`}>
            Edit
          </Link>
          </div>
        }
      />

      <div className="card">
        <div className="grid2">
          <div>
            <div className="kv">
              <div className="k">Status</div>
              <div className="v">{lead.status || '-'}</div>
            </div>
            <div className="kv">
              <div className="k">Source</div>
              <div className="v">{lead.source || '-'}</div>
            </div>
            <div className="kv">
              <div className="k">Email</div>
              <div className="v">{lead.email || '-'}</div>
            </div>
          </div>
          <div>
            <div className="kv">
              <div className="k">Phone</div>
              <div className="v">{lead.phone || '-'}</div>
            </div>
            <div className="kv">
              <div className="k">Company ID</div>
              <div className="v">{lead.company_id || '-'}</div>
            </div>
            <div className="kv">
              <div className="k">Assigned To</div>
              <div className="v">{lead.assigned_to || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      <Timeline relatedId={id} relatedType="Lead" />
      <AttachmentManager relatedId={id} relatedType="Lead" />
    </div>
  )
}

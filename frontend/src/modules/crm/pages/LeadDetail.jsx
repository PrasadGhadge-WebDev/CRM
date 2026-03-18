import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { leadsApi } from '../../../services/leads.js'

export default function LeadDetail() {
  const { id } = useParams()
  const [lead, setLead] = useState(null)
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let canceled = false
    setLoading(true)
    setError('')
    Promise.all([leadsApi.get(id), leadsApi.listNotes(id)])
      .then(([l, n]) => {
        if (canceled) return
        setLead(l)
        setNotes(n.items || [])
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

  async function addNote(e) {
    e.preventDefault()
    const note = noteText.trim()
    if (!note) return
    const created = await leadsApi.addNote(id, { note })
    setNotes((prev) => [created, ...prev])
    setNoteText('')
  }

  async function deleteNote(noteId) {
    if (!confirm('Delete this note?')) return
    await leadsApi.removeNote(id, noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  if (loading) return <div className="muted">Loading...</div>
  if (error) return <div className="alert error">{error}</div>
  if (!lead) return <div className="muted">Lead not found.</div>

  return (
    <div className="stack">
      <div className="row">
        <h1>{lead.name}</h1>
        <div className="row">
          <Link className="btn" to="/leads">
            Back
          </Link>
          <Link className="btn" to={`/leads/${lead.id}/edit`}>
            Edit
          </Link>
        </div>
      </div>

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
        {lead.notes ? (
          <div className="kv">
            <div className="k">Notes</div>
            <div className="v">{lead.notes}</div>
          </div>
        ) : null}
      </div>

      <div className="stack">
        <h2>Lead Notes</h2>
        <form className="row" onSubmit={addNote}>
          <input
            className="input"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..."
          />
          <button className="btn primary">Add</button>
        </form>

        {notes.length ? (
          <div className="stack">
            {notes.map((n) => (
              <div className="note" key={n.id}>
                <div className="noteText">{n.note}</div>
                <div className="noteMeta">
                  <span className="muted">
                    {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                  </span>
                  <button className="btn danger" onClick={() => deleteNote(n.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="muted">No notes yet.</div>
        )}
      </div>
    </div>
  )
}

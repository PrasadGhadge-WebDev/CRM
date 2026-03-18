import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { leadsApi } from '../../../services/leads.js'

export default function LeadNotes() {
  const [leads, setLeads] = useState([])
  const [leadId, setLeadId] = useState('')
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [error, setError] = useState('')

  const selectedLead = useMemo(() => leads.find((l) => l.id === leadId) || null, [leads, leadId])

  useEffect(() => {
    let canceled = false
    setLoadingLeads(true)
    setError('')
    leadsApi
      .list({ limit: 50 })
      .then((res) => {
        if (canceled) return
        const items = res.items || []
        setLeads(items)
        setLeadId((prev) => prev || (items[0]?.id ?? ''))
      })
      .catch((e) => {
        if (canceled) return
        setError(e.message || 'Failed to load leads')
      })
      .finally(() => {
        if (canceled) return
        setLoadingLeads(false)
      })
    return () => {
      canceled = true
    }
  }, [])

  useEffect(() => {
    if (!leadId) return
    let canceled = false
    setLoadingNotes(true)
    setError('')
    leadsApi
      .listNotes(leadId)
      .then((res) => {
        if (canceled) return
        setNotes(res.items || [])
      })
      .catch((e) => {
        if (canceled) return
        setError(e.message || 'Failed to load notes')
      })
      .finally(() => {
        if (canceled) return
        setLoadingNotes(false)
      })
    return () => {
      canceled = true
    }
  }, [leadId])

  async function addNote(e) {
    e.preventDefault()
    const note = noteText.trim()
    if (!note || !leadId) return
    setError('')
    try {
      const created = await leadsApi.addNote(leadId, { note })
      setNotes((prev) => [created, ...prev])
      setNoteText('')
    } catch (e) {
      setError(e.message || 'Failed to add note')
    }
  }

  async function deleteNote(noteId) {
    if (!leadId) return
    if (!confirm('Delete this note?')) return
    setError('')
    try {
      await leadsApi.removeNote(leadId, noteId)
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
    } catch (e) {
      setError(e.message || 'Failed to delete note')
    }
  }

  return (
    <div className="stack">
      <div className="row">
        <h1>Lead Notes</h1>
        {leadId ? (
          <Link className="btn" to={`/leads/${leadId}`}>
            Open Lead
          </Link>
        ) : null}
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="filters">
        <select
          className="input"
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          disabled={loadingLeads}
        >
          {loadingLeads ? <option value="">Loading leads...</option> : null}
          {!loadingLeads && !leads.length ? <option value="">No leads found</option> : null}
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name || l.email || l.phone || l.id}
            </option>
          ))}
        </select>
        <input className="input" value={selectedLead?.status || ''} readOnly placeholder="status" />
        <input className="input" value={selectedLead?.source || ''} readOnly placeholder="source" />
      </div>

      <form className="row" onSubmit={addNote}>
        <input
          className="input"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a note..."
          disabled={!leadId}
        />
        <button className="btn primary" disabled={!leadId}>
          Add
        </button>
      </form>

      {loadingNotes ? (
        <div className="muted">Loading...</div>
      ) : notes.length ? (
        <div className="stack">
          {notes.map((n) => (
            <div className="note" key={n.id}>
              <div className="noteText">{n.note}</div>
              <div className="noteMeta">
                <span className="muted">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</span>
                <button className="btn danger" onClick={() => deleteNote(n.id)} type="button">
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
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Pagination from '../../../components/Pagination.jsx'
import PageHeader from '../../../components/PageHeader.jsx'
import { leadsApi } from '../../../services/leads.js'
import { useToastFeedback } from '../../../utils/useToastFeedback.js'
export default function LeadNotes() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Math.max(1, Number(searchParams.get('page')) || 1)

  const [leads, setLeads] = useState([])
  const [leadId, setLeadId] = useState('')
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [page, setPage] = useState(pageParam)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(Number(searchParams.get('limit')) || 20)
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [error, setError] = useState('')
  useToastFeedback({ error })

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
      .listNotes(leadId, { page, limit })
      .then((res) => {
        if (canceled) return
        setNotes(res.items || [])
        setTotal(res.total || 0)
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
  }, [leadId, page, limit])

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (page > 1) next.set('page', String(page))
    else next.delete('page')
    if (limit !== 20) next.set('limit', String(limit))
    else next.delete('limit')
    setSearchParams(next, { replace: true })
  }, [page, limit, setSearchParams])

  async function addNote(e) {
    e.preventDefault()
    const note = noteText.trim()
    if (!note || !leadId) return
    setError('')
    try {
      const created = await leadsApi.addNote(leadId, { note })
      setNotes((prev) => [created, ...prev])
      setNoteText('')
      toast.success('Note added successfully')
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
      toast.success('Note deleted successfully')
    } catch (e) {
      setError(e.message || 'Failed to delete note')
    }
  }

  return (
    <div className="stack leadNotesPage">
      <div className="leadNotesShell">
        <PageHeader
          title="Lead Notes"
          description="Track follow-ups in a calmer workspace with clear status and source context."
          backTo="/leads"
          actions={
            leadId ? (
              <Link className="btn leadNotesAction" to={`/leads/${leadId}`}>
                Open Lead
              </Link>
            ) : null
          }
        />

        {error ? <div className="alert error">{error}</div> : null}

        <div className="filters leadNotesFilters">
          <select
            className="input leadNotesInput"
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
          <input className="input leadNotesInput" value={selectedLead?.status || ''} readOnly placeholder="Status" />
          <input className="input leadNotesInput" value={selectedLead?.source || ''} readOnly placeholder="Source" />
        </div>

        <form className="leadNotesComposer" onSubmit={addNote}>
          <input
            className="input leadNotesComposerInput"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..."
            disabled={!leadId}
          />
          <button className="btn primary leadNotesAddBtn" disabled={!leadId}>
            Add
          </button>
        </form>

        {loadingNotes ? (
          <div className="leadNotesState muted">Loading...</div>
        ) : notes.length ? (
          <div className="stack leadNotesList">
            {notes.map((n) => (
              <div className="note leadNotesCard" key={n.id}>
                <div className="noteText">{n.note}</div>
                <div className="noteMeta leadNotesMeta">
                  <span className="muted">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</span>
                  <button className="btn danger leadNotesDeleteBtn" onClick={() => deleteNote(n.id)} type="button">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <Pagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l)
                setPage(1)
              }}
            />
          </div>
        ) : (
          <div className="leadNotesState muted">No notes yet.</div>
        )}
      </div>
    </div>
  )
}

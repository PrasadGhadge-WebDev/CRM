import { useEffect, useState } from 'react'
import { notesApi } from '../services/notes'
import { activitiesApi } from '../services/activities'
import { toast } from 'react-toastify'

export default function Timeline({ relatedId, relatedType }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noteText, setNoteText] = useState('')
  const [activityType, setActivityType] = useState('call')
  const [activityDesc, setActivityDesc] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [showActivityForm, setShowActivityForm] = useState(false)

  useEffect(() => {
    loadTimeline()
  }, [relatedId, relatedType])

  async function loadTimeline() {
    setLoading(true)
    try {
      const [notesRes, activitiesRes] = await Promise.all([
        notesApi.list({ related_to: relatedId, related_type: relatedType }),
        activitiesApi.list({ related_to: relatedId, related_type: relatedType }),
      ])

      const notes = notesRes.items || []
      const activities = activitiesRes.items || []

      const combined = [
        ...notes.map((n) => ({ ...n, type: 'note', date: new Date(n.created_at) })),
        ...activities.map((a) => ({ ...a, type: 'activity', date: new Date(a.activity_date) })),
      ].sort((a, b) => b.date - a.date)

      setItems(combined)
    } catch (err) {
      setError('Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddNote(e) {
    e.preventDefault()
    if (!noteText.trim()) return
    try {
      await notesApi.create({
        note: noteText,
        related_to: relatedId,
        related_type: relatedType,
      })
      toast.success('Note added')
      setNoteText('')
      loadTimeline()
    } catch (err) {
      toast.error('Failed to add note')
    }
  }

  async function handleAddActivity(e) {
    e.preventDefault()
    if (!activityDesc.trim()) return
    try {
      await activitiesApi.create({
        activity_type: activityType,
        description: activityDesc,
        due_date: dueDate || undefined,
        status: dueDate ? 'planned' : 'completed',
        related_to: relatedId,
        related_type: relatedType,
      })
      toast.success(`${activityType.charAt(0).toUpperCase() + activityType.slice(1)} logged`)
      setActivityDesc('')
      setDueDate('')
      setShowActivityForm(false)
      loadTimeline()
    } catch (err) {
      toast.error('Failed to add activity')
    }
  }

  return (
    <div className="stack">
      <div className="row">
        <h3>Timeline</h3>
        <button className="btn" onClick={() => setShowActivityForm(!showActivityForm)}>
          {showActivityForm ? 'Cancel Activity' : 'Log Activity'}
        </button>
      </div>

      {showActivityForm && (
        <form className="card stack" onSubmit={handleAddActivity}>
          <div className="grid2">
            <div className="field">
              <label>Type</label>
              <select className="input" value={activityType} onChange={(e) => setActivityType(e.target.value)}>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="email">Email</option>
                <option value="task">Task</option>
              </select>
            </div>
            <div className="field">
              <label>Description</label>
              <input
                className="input"
                value={activityDesc}
                onChange={(e) => setActivityDesc(e.target.value)}
                placeholder="e.g. Discussed pricing"
              />
            </div>
            <div className="field">
              <label>Due Date (Optional Reminder)</label>
              <input
                className="input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <button className="btn primary small">Log {activityType}</button>
        </form>
      )}

      <form className="row" onSubmit={handleAddNote}>
        <input
          className="input"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a note..."
        />
        <button className="btn primary">Note</button>
      </form>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="muted">Loading timeline...</div>
      ) : (
        <div className="timeline">
          {items.map((item) => (
            <div key={item.id} className={`timelineItem ${item.type}`}>
               <div className="timelineMarker" />
               <div className="timelineContent">
                 <div className="row">
                   <strong className="timelineType">
                     {item.type === 'note' ? '📝 Note' : `📅 ${item.activity_type.toUpperCase()}`}
                   </strong>
                   <span className="muted small">{item.date.toLocaleString()}</span>
                 </div>
                  <div className="timelineText">
                   {item.type === 'note' ? item.note : item.description}
                  </div>
                  {item.due_date && (
                    <div className="muted small" style={{ marginTop: 4 }}>
                      Due: {new Date(item.due_date).toLocaleDateString()}
                    </div>
                  )}
               </div>
            </div>
          ))}
          {!items.length && <div className="muted">No history found.</div>}
        </div>
      )}

      <style>{`
        .timeline {
          position: relative;
          padding-left: 20px;
          margin-top: 20px;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--border);
        }
        .timelineItem {
          position: relative;
          margin-bottom: 24px;
        }
        .timelineMarker {
          position: absolute;
          left: -26px;
          top: 4px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--primary);
          border: 2px solid var(--bg);
        }
        .timelineItem.activity .timelineMarker {
          background: #f7b955;
        }
        .timelineContent {
          background: var(--card-bg);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .timelineType {
           font-size: 0.85rem;
           text-transform: capitalize;
        }
        .timelineText {
          margin-top: 8px;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  )
}

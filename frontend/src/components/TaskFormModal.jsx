import { useState, useEffect } from 'react'
import { activitiesApi } from '../services/activities'
import { toast } from 'react-toastify'

export default function TaskFormModal({ isOpen, onClose, onSave, task = null }) {
  const [model, setModel] = useState({
    activity_type: 'task',
    description: '',
    due_date: '',
    status: 'planned',
    related_to: null,
    related_type: null,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (task) {
      setModel({
        activity_type: task.activity_type || 'task',
        description: task.description || '',
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        status: task.status || 'planned',
        related_to: task.related_to || null,
        related_type: task.related_type || null,
      })
    } else {
      setModel({
        activity_type: 'task',
        description: '',
        due_date: new Date().toISOString().split('T')[0],
        status: 'planned',
        related_to: null,
        related_type: null,
      })
    }
  }, [task, isOpen])

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!model.description.trim()) {
      toast.error('Description is required')
      return
    }

    setSaving(true)
    try {
      if (task?.id) {
        await activitiesApi.update(task.id, model)
        toast.success('Task updated')
      } else {
        await activitiesApi.create(model)
        toast.success('Task created')
      }
      onSave()
      onClose()
    } catch (err) {
      toast.error('Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent card" onClick={(e) => e.stopPropagation()}>
        <div className="row">
          <h3>{task ? 'Edit Task' : 'New Task'}</h3>
          <button className="btn small" onClick={onClose}>&times;</button>
        </div>

        <form className="stack" onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <div className="grid2">
            <div className="field">
              <label>Type</label>
              <select 
                className="input" 
                value={model.activity_type} 
                onChange={(e) => setModel({ ...model, activity_type: e.target.value })}
              >
                <option value="task">Task</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select 
                className="input" 
                value={model.status} 
                onChange={(e) => setModel({ ...model, status: e.target.value })}
              >
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Description</label>
            <input
              className="input"
              value={model.description}
              onChange={(e) => setModel({ ...model, description: e.target.value })}
              placeholder="e.g. Discussed pricing with lead"
              autoFocus
            />
          </div>

          <div className="field">
            <label>Due Date</label>
            <input
              className="input"
              type="date"
              value={model.due_date}
              onChange={(e) => setModel({ ...model, due_date: e.target.value })}
            />
          </div>

          <div className="row" style={{ marginTop: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modalOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modalContent {
          width: 100%;
          max-width: 500px;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

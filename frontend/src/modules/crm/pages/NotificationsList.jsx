import { useEffect, useState } from 'react'
import { notificationsApi } from '../../../services/notifications'
import { Icon } from '../../../layouts/icons.jsx'
import Pagination from '../../../components/Pagination.jsx'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../../components/PageHeader.jsx'

export default function NotificationsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Math.max(1, Number(searchParams.get('page')) || 1)

  const [notifications, setNotifications] = useState([])
  const [page, setPage] = useState(pageParam)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(Number(searchParams.get('limit')) || 10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (page > 1) next.set('page', String(page))
    else next.delete('page')
    if (limit !== 10) next.set('limit', String(limit))
    else next.delete('limit')
    setSearchParams(next, { replace: true })
  }, [page, limit, setSearchParams])

  useEffect(() => {
    loadNotifications()
  }, [page, limit])

  async function loadNotifications() {
    setLoading(true)
    try {
      const data = await notificationsApi.list({ page, limit })
      setNotifications(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(id) {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      setError('Failed to update notification')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this notification?')) return
    try {
      await notificationsApi.remove(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      setError('Failed to delete notification')
    }
  }

  async function handleMarkAllRead() {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (err) {
      setError('Failed to mark all as read')
    }
  }

  return (
    <div className="stack">
      <PageHeader
        title="Notifications"
        backTo="/"
        actions={
          notifications.some(n => !n.is_read) ? (
            <button className="btn" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          ) : null
        }
      />

      {error && <div className="alert error">{error}</div>}

      <div className="card noPadding">
        {loading ? (
          <div className="padding muted">Loading notifications...</div>
        ) : notifications.length ? (
          <div className="stack">
            {notifications.map((n) => (
              <div key={n.id} className={`notificationRow ${n.is_read ? 'read' : 'unread'}`}>
                <div className="notificationIcon large">
                  <Icon name={n.type === 'warning' ? 'alert' : 'info'} />
                </div>
                <div className="notificationContent">
                  <div className="notificationHeader">
                    <strong className="notificationTitle">{n.title}</strong>
                    <span className="muted small">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className="notificationMessage">{n.message}</p>
                </div>
                <div className="notificationActions">
                   {!n.is_read && (
                     <button className="btn small" onClick={() => handleMarkRead(n.id)}>Mark Read</button>
                   )}
                   <button className="btn danger small" onClick={() => handleDelete(n.id)}>Delete</button>
                </div>
              </div>
            ))}
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
          <div className="padding muted center">You have no notifications.</div>
        )}
      </div>

      <style>{`
        .notificationRow {
           display: flex;
           gap: 20px;
           padding: 20px;
           border-bottom: 1px solid var(--border);
           align-items: flex-start;
        }
        .notificationRow.unread {
           background: rgba(55, 125, 255, 0.05);
           border-left: 4px solid var(--primary);
        }
        .notificationIcon.large {
           width: 48px;
           height: 48px;
           background: var(--border);
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           flex-shrink: 0;
        }
        .unread .notificationIcon.large {
           background: var(--primary);
           color: white;
        }
        .notificationContent {
           flex: 1;
        }
        .notificationHeader {
           display: flex;
           justify-content: space-between;
           margin-bottom: 4px;
        }
        .notificationTitle {
           font-size: 1.1rem;
        }
        .notificationMessage {
           margin: 0;
           color: var(--text-dim);
        }
        .notificationActions {
           display: flex;
           gap: 8px;
        }
      `}</style>
    </div>
  )
}

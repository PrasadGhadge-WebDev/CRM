import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './icons.jsx'

function crmIsActive(pathname) {
  return pathname.startsWith('/customers') || pathname.startsWith('/leads') || pathname.startsWith('/lead-notes')
}

export default function Sidebar({ open, onClose }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const crmActive = useMemo(() => crmIsActive(pathname), [pathname])
  const [crmOpen, setCrmOpen] = useState(crmActive)

  useEffect(() => {
    if (crmActive) setCrmOpen(true)
  }, [crmActive])

  function go(to) {
    navigate(to)
    onClose?.()
  }

  return (
    <aside className={`crmSidebar ${open ? 'open' : ''}`} aria-label="Sidebar">
      <div className="sidebarTop">
        <div
          className="brandRow"
          role="button"
          tabIndex={0}
          onClick={() => go('/')}
          onKeyDown={(e) => e.key === 'Enter' && go('/')}
        >
          <div className="brandMark">CRM</div>
          <div>
            <div className="brandName">CRM SYSTEM</div>
            <div className="brandSub muted">CRM Module</div>
          </div>
        </div>

        <button className="sidebarCloseBtn iconBtn" type="button" onClick={onClose} aria-label="Close menu">
          <Icon name="close" />
        </button>
      </div>

      <div className="sidebarNav">
        <NavLink className="navItem" to="/" end onClick={onClose}>
          <span className="navIcon">
            <Icon name="dashboard" />
          </span>
          Dashboard
        </NavLink>

        <div className="navGroup">
          <button
            className={`navItem navGroupTrigger ${crmActive ? 'active' : ''}`}
            type="button"
            aria-expanded={crmOpen}
            onClick={() => setCrmOpen((v) => !v)}
          >
            <span className="navIcon">
              <Icon name="users" />
            </span>
            CRM
            <span className={`navChevron ${crmOpen ? 'open' : ''}`} aria-hidden="true">
              {'\u25B8'}
            </span>
          </button>

          {crmOpen ? (
            <div className="navSubList">
              <NavLink className="navSubItem" to="/customers" onClick={onClose}>
                Customers
              </NavLink>
              <NavLink className="navSubItem" to="/leads" onClick={onClose}>
                Leads
              </NavLink>
              <NavLink className="navSubItem" to="/lead-notes" onClick={onClose}>
                Lead Notes
              </NavLink>
            </div>
          ) : null}
        </div>
      </div>

      <div className="sidebarBottom">
        <div className="userCard">
          <div className="avatar">A</div>
          <div>
            <div className="userName">Admin</div>
            <div className="userRole muted">Super Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}


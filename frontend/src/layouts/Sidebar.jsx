import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from './icons.jsx'
import { useAuth } from '../context/AuthContext'
import { hasRequiredRole, NAV_ACCESS } from '../utils/accessControl'

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  function go(to) {
    navigate(to)
  }

  function handleNavClick() {
    // No-op since sidebar is always visible
  }

  return (
    <aside className={`crmSidebar ${!isOpen ? 'collapsed' : ''}`} aria-label="Sidebar">
      <div className="sidebarTop">
        <div
          className="brandRow"
          role="button"
          tabIndex={0}
          onClick={() => go('/')}
          onKeyDown={(e) => e.key === 'Enter' && go('/')}
          title="Dashboard"
        >
          <div className="brandMark">CRM</div>
          <div className="brandText">
            <div className="brandName">CRM SYSTEM</div>
            <div className="brandSub muted">CRM Module</div>
          </div>
        </div>
      </div>

      <div className="sidebarNav">
        <NavLink className="navItem" to="/" end onClick={handleNavClick} title="Dashboard">
          <span className="navIcon">
            <Icon name="dashboard" />
          </span>
          <span className="navText">Dashboard</span>
        </NavLink>

        {hasRequiredRole(user?.role, NAV_ACCESS.users) && (
          <NavLink className="navItem" to="/users" onClick={handleNavClick} title="Users">
            <span className="navIcon">
              <Icon name="user" />
            </span>
            <span className="navText">Users</span>
          </NavLink>
        )}

        {hasRequiredRole(user?.role, NAV_ACCESS.leads) && (
          <NavLink className="navItem" to="/leads" onClick={handleNavClick} title="Leads">
            <span className="navIcon">
              <Icon name="users" />
            </span>
            <span className="navText">Leads</span>
          </NavLink>
        )}

        {hasRequiredRole(user?.role, NAV_ACCESS.customers) && (
          <NavLink className="navItem" to="/customers" onClick={handleNavClick} title="Customers">
            <span className="navIcon">
              <Icon name="contacts" />
            </span>
            <span className="navText">Customers</span>
          </NavLink>
        )}

        {hasRequiredRole(user?.role, NAV_ACCESS.deals) && (
          <NavLink className="navItem" to="/deals" onClick={handleNavClick} title="Deals">
            <span className="navIcon">
              <Icon name="deals" />
            </span>
            <span className="navText">Deals</span>
          </NavLink>
        )}

        {hasRequiredRole(user?.role, NAV_ACCESS.reports) && (
          <NavLink className="navItem" to="/reports" onClick={handleNavClick} title="Reports">
            <span className="navIcon">
              <Icon name="reports" />
            </span>
            <span className="navText">Reports</span>
          </NavLink>
        )}

        {hasRequiredRole(user?.role, NAV_ACCESS.tasks) && (
          <NavLink className="navItem" to="/tasks" onClick={handleNavClick} title="Tasks">
            <span className="navIcon">
              <Icon name="tasks" />
            </span>
            <span className="navText">Tasks</span>
          </NavLink>
        )}

        {hasRequiredRole(user?.role, NAV_ACCESS.followups) && (
          <NavLink className="navItem" to="/followups" onClick={handleNavClick} title="Followups">
            <span className="navIcon">
              <Icon name="notes" />
            </span>
            <span className="navText">Followups</span>
          </NavLink>
        )}

        {hasRequiredRole(user?.role, NAV_ACCESS.billing) && (
          <NavLink className="navItem" to="/billing" onClick={handleNavClick} title="Billing">
            <span className="navIcon">
              <Icon name="billing" />
            </span>
            <span className="navText">Billing</span>
          </NavLink>
        )}

        {hasRequiredRole(user?.role, NAV_ACCESS.trash) && (
          <NavLink className="navItem" to="/trash" onClick={handleNavClick} title="Trash">
            <span className="navIcon">
              <Icon name="archive" />
            </span>
            <span className="navText">Trash</span>
          </NavLink>
        )}
      </div>

      <div className="sidebarBottom">
        <div className="userCard">
          <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div className="userMeta">
            <div className="userName">{user?.name || 'User'}</div>
            <div className="userRole muted">{user?.role || 'Guest'}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

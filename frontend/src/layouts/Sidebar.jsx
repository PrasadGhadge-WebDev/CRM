import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from './icons.jsx'
import { useAuth } from '../context/AuthContext'

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

        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <NavLink className="navItem" to="/companies" onClick={handleNavClick} title="Companies">
            <span className="navIcon">
              <Icon name="users" />
            </span>
            <span className="navText">Companies</span>
          </NavLink>
        )}

        {['Admin', 'Manager', 'Sales'].includes(user?.role) && (
          <>
            <NavLink className="navItem" to="/customers" onClick={handleNavClick} title="Contacts">
              <span className="navIcon">
                <Icon name="contacts" />
              </span>
              <span className="navText">Contacts</span>
            </NavLink>

            <NavLink className="navItem" to="/leads" onClick={handleNavClick} title="Leads">
              <span className="navIcon">
                <Icon name="users" />
              </span>
              <span className="navText">Leads</span>
            </NavLink>

            <NavLink className="navItem" to="/deals" onClick={handleNavClick} title="Deals">
              <span className="navIcon">
                <Icon name="deals" />
              </span>
              <span className="navText">Deals</span>
            </NavLink>

            <NavLink className="navItem" to="/tasks" onClick={handleNavClick} title="Tasks">
              <span className="navIcon">
                <Icon name="tasks" />
              </span>
              <span className="navText">Tasks</span>
            </NavLink>

            <NavLink className="navItem" to="/orders" onClick={handleNavClick} title="Orders">
              <span className="navIcon">
                <Icon name="shoppingCart" />
              </span>
              <span className="navText">Orders</span>
            </NavLink>

            <NavLink className="navItem" to="/support" onClick={handleNavClick} title="Support">
              <span className="navIcon">
                <Icon name="help" />
              </span>
              <span className="navText">Support</span>
            </NavLink>

            <NavLink className="navItem" to="/products" onClick={handleNavClick} title="Products">
              <span className="navIcon">
                <Icon name="package" />
              </span>
              <span className="navText">Products</span>
            </NavLink>

            <NavLink className="navItem" to="/lead-notes" onClick={handleNavClick} title="Lead Notes">
              <span className="navIcon">
                <Icon name="notes" />
              </span>
              <span className="navText">Lead Notes</span>
            </NavLink>
          </>
        )}

        {user?.role === 'Admin' && (
          <>
            <NavLink className="navItem" to="/users" onClick={handleNavClick} title="Users">
              <span className="navIcon">
                <Icon name="user" />
              </span>
              <span className="navText">Users</span>
            </NavLink>
            <NavLink className="navItem" to="/reports" onClick={handleNavClick} title="Reports">
              <span className="navIcon">
                <Icon name="reports" />
              </span>
              <span className="navText">Reports</span>
            </NavLink>
          </>
        )}

        <NavLink className="navItem" to="/settings" onClick={handleNavClick} title="Settings">
          <span className="navIcon">
            <Icon name="settings" />
          </span>
          <span className="navText">Settings</span>
        </NavLink>
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



import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { useAuth } from '../context/AuthContext'
import { hasRequiredRole, NAV_ACCESS } from '../utils/accessControl'

function pageTitle(pathname) {
  if (pathname.startsWith('/customers')) return 'CUSTOMERS'
  if (pathname.startsWith('/leads')) return 'LEADS'
  if (pathname.startsWith('/deals')) return 'DEALS'
  if (pathname.startsWith('/users')) return 'USERS'
  if (pathname.startsWith('/reports')) return 'REPORTS'
  if (pathname.startsWith('/tasks')) return 'TASKS'
  if (pathname.startsWith('/followups')) return 'FOLLOWUPS'
  if (pathname.startsWith('/billing')) return 'BILLING'
  if (pathname.startsWith('/trash')) return 'TRASH'
  return 'DASHBOARD'
}

export default function AppLayout() {
  const { user } = useAuth()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()

  const [searchText, setSearchText] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (pathname !== '/search') return
    const q = new URLSearchParams(search).get('q') || ''
    setSearchText(q)
  }, [pathname, search])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  function submitSearch() {
    const q = searchText.trim()
    if (!q) {
      navigate('/search')
      return
    }

    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  const title = pageTitle(pathname)

  return (
    <div className={`crmShell ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isOpen={sidebarOpen} />

      <div className="crmContent">
        <Topbar
          title={title}
          searchText={searchText}
          onSearchTextChange={setSearchText}
          onSubmitSearch={submitSearch}
          theme={theme}
          onToggleTheme={toggleTheme}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="crmMain">
          <div className="crmPanel">
            <Outlet />
          </div>
        </main>

        <footer className="crmFooter">
          <div className="crmFooterInner">
            <div className="crmFooterLinks">
          <Link to="/">Dashboard</Link>
          <span className="bullet">&bull;</span>
          {hasRequiredRole(user?.role, NAV_ACCESS.customers) && (
            <>
              <Link to="/customers">Customers</Link>
              <span className="bullet">&bull;</span>
            </>
          )}
          {hasRequiredRole(user?.role, NAV_ACCESS.leads) && (
            <>
              <Link to="/leads">Leads</Link>
              <span className="bullet">&bull;</span>
            </>
          )}
          {hasRequiredRole(user?.role, NAV_ACCESS.deals) && (
            <>
              <Link to="/deals">Deals</Link>
              <span className="bullet">&bull;</span>
            </>
          )}
          {hasRequiredRole(user?.role, NAV_ACCESS.users) && (
            <>
              <Link to="/users">Users</Link>
              <span className="bullet">&bull;</span>
            </>
          )}
          {hasRequiredRole(user?.role, NAV_ACCESS.reports) && (
            <>
              <Link to="/reports">Reports</Link>
              <span className="bullet">&bull;</span>
            </>
          )}
          {hasRequiredRole(user?.role, NAV_ACCESS.tasks) && (
            <>
              <Link to="/tasks">Tasks</Link>
              <span className="bullet">&bull;</span>
            </>
          )}
          {hasRequiredRole(user?.role, NAV_ACCESS.followups) && (
            <>
              <Link to="/followups">Followups</Link>
              <span className="bullet">&bull;</span>
            </>
          )}
          {hasRequiredRole(user?.role, NAV_ACCESS.billing) && (
            <>
              <Link to="/billing">Billing</Link>
              <span className="bullet">&bull;</span>
            </>
          )}
          {hasRequiredRole(user?.role, NAV_ACCESS.trash) && (
            <>
              <Link to="/trash">Trash</Link>
            </>
          )}
        </div>

            <div className="crmFooterCopy">
              &copy; {new Date().getFullYear()} CRM System. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

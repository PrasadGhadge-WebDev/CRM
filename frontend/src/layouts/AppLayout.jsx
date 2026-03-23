import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { useAuth } from '../context/AuthContext'

function pageTitle(pathname) {
  if (pathname.startsWith('/companies')) return 'COMPANIES'
  if (pathname.startsWith('/customers')) return 'CUSTOMERS'
  if (pathname.startsWith('/tasks')) return 'TASKS'
  if (pathname.startsWith('/orders')) return 'ORDERS'
  if (pathname.startsWith('/support')) return 'SUPPORT'
  if (pathname.startsWith('/products')) return 'PRODUCTS'
  if (pathname.startsWith('/search')) return 'SEARCH'
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
          {(user?.role === 'Admin' || user?.role === 'Manager') && (
            <>
              <Link to="/companies">Companies</Link>
              <span className="bullet">&bull;</span>
            </>
          )}
          {['Admin', 'Manager', 'Sales'].includes(user?.role) && (
            <>
              <Link to="/customers">Customers</Link>
              <span className="bullet">&bull;</span>
              <Link to="/leads">Leads</Link>
              <span className="bullet">&bull;</span>
              <Link to="/lead-notes">Notes</Link>
            </>
          )}
          {user?.role === 'Admin' && (
            <>
              <span className="bullet">&bull;</span>
              <Link to="/users">Users</Link>
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


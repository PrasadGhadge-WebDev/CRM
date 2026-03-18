import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

function pageTitle(pathname) {
  if (pathname.startsWith('/customers')) return 'CUSTOMERS'
  if (pathname.startsWith('/leads')) return 'LEADS'
  if (pathname.startsWith('/lead-notes')) return 'LEAD NOTES'
  if (pathname.startsWith('/search')) return 'SEARCH'
  return 'DASHBOARD'
}

export default function AppLayout() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    if (pathname !== '/search') return
    const q = new URLSearchParams(search).get('q') || ''
    setSearchText(q)
  }, [pathname, search])

  useEffect(() => {
    if (!sidebarOpen) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sidebarOpen])

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
    <div className="crmShell">
      <div
        className={`crmOverlay ${sidebarOpen ? 'open' : ''}`}
        role="presentation"
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="crmContent">
        <Topbar
          title={title}
          searchText={searchText}
          onSearchTextChange={setSearchText}
          onSubmitSearch={submitSearch}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="crmMain">
          <div className="crmPanel">
            <Outlet />
          </div>
        </main>

        <footer className="crmFooter muted">
          <div>{`CRM \u2022 Customers \u2022 Leads \u2022 Lead Notes`}</div>
          <div>{`\u00A9 ${new Date().getFullYear()}`}</div>
        </footer>
      </div>
    </div>
  )
}


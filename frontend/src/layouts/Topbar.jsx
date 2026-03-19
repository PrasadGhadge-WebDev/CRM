import { useState } from "react"
import { Icon } from "./icons.jsx"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Topbar({
  title,
  searchText,
  onSearchTextChange,
  onSubmitSearch,
  theme,
  onToggleTheme,
  sidebarOpen,
  onToggleSidebar,
}) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const firstLetter =
    user?.username?.charAt(0).toUpperCase() || "A"

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="crmTopbar">

      {/* LEFT */}
      <div className="topbarLeft">
        <button
          className={`iconBtn topbarMenuBtn ${sidebarOpen ? "active" : ""}`}
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={sidebarOpen}
        >
          <span className="topbarMenuIcon" aria-hidden="true">
            <Icon name={sidebarOpen ? "close" : "menu"} />
          </span>
        </button>

        <h2 className="topbarTitle">{title}</h2>
      </div>

      {/* SEARCH */}
      <div className="topbarSearch">
        <Icon name="search" />
        <input
          placeholder="Search customers, leads..."
          value={searchText}
          onChange={(e) => onSearchTextChange?.(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmitSearch?.()}
        />
      </div>

      {/* RIGHT */}
      <div className="topbarRight">

        <button className="iconBtn">
          <Icon name="bell" />
        </button>

        <button className="iconBtn" onClick={onToggleTheme}>
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>

        {/* USER */}
        <div className="profileMenu">

          <div
            className="profileTrigger"
            onClick={() => setOpen(!open)}
          >
            <div className="avatar">
              {firstLetter}
            </div>

            <div className="profileText">
              <div className="profileName">
                {user?.username || "Admin"}
              </div>
              <div className="profileRole">
                {user?.role || "Admin"}
              </div>
            </div>

            <Icon name="chevronDown" />
          </div>

          {open && (
            <div className="profileDropdown">

              <div
                className="dropdownItem"
                onClick={() => navigate("/profile")}
              >
                <Icon name="user" />
                Profile
              </div>

              <div
                className="dropdownItem"
                onClick={() => navigate("/settings")}
              >
                <Icon name="settings" />
                Settings
              </div>

              <div className="dropdownDivider"></div>

              <div
                className="dropdownItem logout"
                onClick={handleLogout}
              >
                <Icon name="logOut" />
                Logout
              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  )
}

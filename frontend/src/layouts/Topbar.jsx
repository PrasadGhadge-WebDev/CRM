import { Icon } from './icons.jsx'

export default function Topbar({
  title,
  searchText,
  onSearchTextChange,
  onSubmitSearch,
  theme,
  onToggleTheme,
  onOpenSidebar,
}) {
  return (
    <header className="crmTopbar">
      <div className="topbarLeft">
        <button className="iconBtn topbarMenuBtn" type="button" onClick={onOpenSidebar} aria-label="Open menu">
          <Icon name="menu" />
        </button>
        <div className="topbarTitle">{title}</div>
      </div>

      <div className="topbarSearch">
        <span className="searchIcon" aria-hidden="true">
          <Icon name="search" />
        </span>
        <input
          className="searchInput"
          placeholder="Search customers & leads..."
          value={searchText}
          onChange={(e) => onSearchTextChange?.(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmitSearch?.()}
        />
      </div>

      <div className="topbarRight">
        <button className="iconBtn" type="button" aria-label="Notifications">
          <Icon name="bell" />
        </button>

        <button className="iconBtn" type="button" onClick={onToggleTheme} aria-label="Toggle theme">
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>

        <div className="userPill">
          <div className="pillAvatar">A</div>
          <div className="pillName">Admin</div>
        </div>
      </div>
    </header>
  )
}


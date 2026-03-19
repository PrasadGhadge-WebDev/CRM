export function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' }

  const stroke = {
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common} aria-hidden="true">
          <path
            {...stroke}
            d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3h8v6h-8V3zM3 21h8v-6H3v6z"
          />
        </svg>
      )

    case 'users':
      return (
        <svg {...common} aria-hidden="true">
          <path {...stroke} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <path {...stroke} d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        </svg>
      )

    case 'search':
      return (
        <svg {...common} aria-hidden="true">
          <circle {...stroke} cx="11" cy="11" r="8" />
          <path {...stroke} d="m21 21-4.3-4.3" />
        </svg>
      )

    case 'bell':
      return (
        <svg {...common} aria-hidden="true">
          <path {...stroke} d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path {...stroke} d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )

    case 'menu':
      return (
        <svg {...common} aria-hidden="true">
          <path {...stroke} d="M4 6h16" />
          <path {...stroke} d="M4 12h16" />
          <path {...stroke} d="M4 18h16" />
        </svg>
      )

    case 'close':
      return (
        <svg {...common} aria-hidden="true">
          <path {...stroke} d="M18 6 6 18" />
          <path {...stroke} d="M6 6l12 12" />
        </svg>
      )

    case 'sun':
      return (
        <svg {...common} aria-hidden="true">
          <path {...stroke} d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
          <path {...stroke} d="M12 2v2" />
          <path {...stroke} d="M12 20v2" />
          <path {...stroke} d="M4.93 4.93l1.41 1.41" />
          <path {...stroke} d="M17.66 17.66l1.41 1.41" />
          <path {...stroke} d="M2 12h2" />
          <path {...stroke} d="M20 12h2" />
          <path {...stroke} d="M4.93 19.07l1.41-1.41" />
          <path {...stroke} d="M17.66 6.34l1.41-1.41" />
        </svg>
      )

    case 'moon':
      return (
        <svg {...common} aria-hidden="true">
          <path {...stroke} d="M21 12.8A8.5 8.5 0 0 1 11.2 3a6.5 6.5 0 1 0 9.8 9.8Z" />
        </svg>
      )

    case 'chevronDown':
      return (
        <svg {...common} aria-hidden="true" style={{ width: 14, height: 14 }}>
          <path {...stroke} d="m6 9 6 6 6-6" />
        </svg>
      )

    case 'user':
      return (
        <svg {...common} aria-hidden="true">
          <path {...stroke} d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle {...stroke} cx="12" cy="7" r="4" />
        </svg>
      )

    case 'settings':
      return (
        <svg {...common} aria-hidden="true">
          <path
            {...stroke}
            d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
          />
          <circle {...stroke} cx="12" cy="12" r="3" />
        </svg>
      )

    case 'logOut':
      return (
        <svg {...common} aria-hidden="true">
          <path {...stroke} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline {...stroke} points="16 17 21 12 16 7" />
          <line {...stroke} x1="21" y1="12" x2="9" y2="12" />
        </svg>
      )

    default:
      return null
  }
}


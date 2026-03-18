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

    default:
      return null
  }
}


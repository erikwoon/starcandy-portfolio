import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface NavProps {
  onLogTrade: () => void
}

function initialsFromEmail(email: string | undefined | null): string {
  if (!email) return '?'
  const name = email.split('@')[0]
  const parts = name.split(/[.\-_]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export default function Nav({ onLogTrade }: NavProps) {
  const { user, signOut } = useAuth()

  return (
    <div className="nav" style={{ borderBottom: '1px solid var(--color-divider)', paddingInline: 'var(--space-8)' }}>
      <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l5-5 4 4 8-8" />
          <path d="M15 8h5v5" />
        </svg>
        Options Tracker
      </div>
      <NavLink to="/" end style={({ isActive }) => ({ color: isActive ? 'var(--color-accent)' : 'inherit' })}>
        Dashboard
      </NavLink>
      <NavLink to="/trades" style={({ isActive }) => ({ color: isActive ? 'var(--color-accent)' : 'inherit' })}>
        Trades
      </NavLink>
      <NavLink to="/journal" style={({ isActive }) => ({ color: isActive ? 'var(--color-accent)' : 'inherit' })}>
        Journal
      </NavLink>
      <NavLink to="/chart" style={({ isActive }) => ({ color: isActive ? 'var(--color-accent)' : 'inherit' })}>
        Chart
      </NavLink>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={onLogTrade}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Log trade
        </button>
        <button
          onClick={() => signOut()}
          title={user?.email ?? 'Sign out'}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--color-accent-800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-heading)',
            fontSize: 14,
            color: 'var(--color-accent-100)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {initialsFromEmail(user?.email)}
        </button>
      </div>
    </div>
  )
}

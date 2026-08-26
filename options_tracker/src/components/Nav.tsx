import { useEffect, useRef, useState } from 'react'
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
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setProfileOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

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
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={onLogTrade}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Log trade
        </button>
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen((open) => !open)}
            title={user?.email ?? 'Profile'}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
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
          {profileOpen && (
            <div
              className="profile-menu"
              role="menu"
              aria-label="Profile menu"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                transformOrigin: 'top right',
                minWidth: 220,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-divider)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-lg)',
                padding: 'var(--space-2)',
                zIndex: 30,
              }}
            >
              <div style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--color-divider)', marginBottom: 'var(--space-2)' }}>
                <div style={{ fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', opacity: 0.65 }}>Signed in as</div>
                <div style={{ fontSize: 13, wordBreak: 'break-all' }}>{user?.email ?? 'Unknown user'}</div>
              </div>
              <button
                role="menuitem"
                className="btn btn-secondary btn-block"
                onClick={() => signOut()}
                style={{ justifyContent: 'center' }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signInWithMagicLink, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signInWithMagicLink(email)
    setSubmitting(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div className="card elev-lg" style={{ width: 'min(360px, 100%)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17l5-5 4 4 8-8" />
            <path d="M15 8h5v5" />
          </svg>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>Options Tracker</span>
        </div>

        {sent ? (
          <p>Check your email for a sign-in link.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && (
              <p style={{ color: 'var(--color-neutral-500)', fontSize: 13, marginTop: 'var(--space-2)' }}>{error}</p>
            )}
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              Send magic link
            </button>
          </form>
        )}

        <div className="hr" />

        <button className="btn btn-secondary btn-block" onClick={() => signInWithGoogle()}>
          Continue with Google
        </button>
      </div>
    </div>
  )
}

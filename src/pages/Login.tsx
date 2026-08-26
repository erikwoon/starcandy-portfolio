import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { user, loading, signInWithMagicLink, verifyEmailOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    const { error } = await signInWithMagicLink(email)
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
    setInfo('Code sent. Enter the OTP from your email, or use the magic link.')
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    const code = otpCode.replace(/\s+/g, '')
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your email.')
      return
    }

    setSubmitting(true)
    const { error } = await verifyEmailOtp(email, code)
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    setInfo('Code verified. You are now signed in.')
  }

  async function resendCode() {
    if (!email) return
    setError(null)
    setInfo(null)
    setSubmitting(true)
    const { error } = await signInWithMagicLink(email)
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    setInfo('A new code has been sent.')
  }

  if (loading) return null
  if (user) return <Navigate to="/" replace />

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

        {!sent ? (
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
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              Continue with email
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ fontSize: 14, marginTop: 0, marginBottom: 'var(--space-3)' }}>
              Enter the 6-digit code sent to <strong>{email}</strong>.
            </p>
            <div className="field">
              <label>One-time code</label>
              <input
                className="input"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              Verify code
            </button>
            <button className="btn btn-secondary btn-block" type="button" onClick={resendCode} disabled={submitting}>
              Resend code
            </button>
            <button
              className="btn btn-ghost btn-block"
              type="button"
              onClick={() => {
                setSent(false)
                setOtpCode('')
                setInfo(null)
                setError(null)
              }}
              disabled={submitting}
            >
              Use a different email
            </button>
          </form>
        )}

        {info && (
          <p style={{ color: 'var(--color-accent-300)', fontSize: 13, marginTop: 'var(--space-2)' }}>{info}</p>
        )}
        {error && (
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 13, marginTop: 'var(--space-2)' }}>{error}</p>
        )}

        <div className="hr" />
        <p style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 'var(--space-4)' }}>
          This is a personal project and not affiliated with any broker. Your email is only used for authentication and
          is not shared with anyone.
        </p>
      </div>
    </div>
  )
}

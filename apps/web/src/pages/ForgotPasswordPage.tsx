import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cream)' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 600, color: 'var(--lavender-deep)', lineHeight: 1.1 }}>
            QuteNote
          </h1>
        </div>

        <div style={{
          background: 'var(--white)',
          borderRadius: '28px',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
          padding: '36px 32px',
        }}>
          {sent ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '40px' }}>📬</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: 'var(--ink)', marginBottom: '12px', textAlign: 'center' }}>
                Check your email
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--ink-muted)', lineHeight: 1.6, textAlign: 'center', marginBottom: '24px' }}>
                If that email is in our system, we sent you a link to reset your password. It expires in 1 hour.
              </p>
              <Link
                to="/login"
                style={{
                  display: 'block', textAlign: 'center', fontSize: '14px',
                  color: 'var(--lavender-dark)', fontWeight: 500,
                }}
              >
                Back to login
              </Link>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>
                Forgot your password?
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                Enter your email and we'll send you a link to reset it.
              </p>

              {error && (
                <div style={{ background: 'var(--error-pale)', border: '1px solid rgba(224,78,107,0.3)', color: 'var(--error)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '6px' }}>Email</label>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '11px 16px', fontSize: '14px',
                      borderRadius: '10px', border: '1.5px solid var(--border-default)',
                      background: 'var(--white)', color: 'var(--ink)',
                      outline: 'none', fontFamily: 'var(--font-body)',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--lavender)'; e.target.style.boxShadow = 'var(--shadow-input)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '13px 24px', fontSize: '15px', fontWeight: 500,
                    borderRadius: '50px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading ? 'var(--lavender-light)' : 'var(--lavender)',
                    color: '#fff', boxShadow: loading ? 'none' : 'var(--shadow-button)',
                    fontFamily: 'var(--font-body)', marginTop: '4px',
                    transition: 'background 0.15s',
                  }}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--ink-muted)', marginTop: '24px' }}>
                <Link to="/login" style={{ color: 'var(--lavender-dark)', fontWeight: 500 }}>
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

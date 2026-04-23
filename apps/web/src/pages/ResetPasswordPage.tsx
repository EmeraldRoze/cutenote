import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cream)' }}>
        <div className="w-full max-w-md text-center">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', marginBottom: '12px' }}>
            Invalid reset link
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '24px' }}>
            This link is missing or broken. Try requesting a new one.
          </p>
          <Link to="/forgot-password" style={{ color: 'var(--lavender-dark)', fontWeight: 500, fontSize: '14px' }}>
            Request a new reset link
          </Link>
        </div>
      </div>
    )
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
          {done ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '40px' }}>🎉</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: 'var(--ink)', marginBottom: '12px', textAlign: 'center' }}>
                Password updated!
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--ink-muted)', lineHeight: 1.6, textAlign: 'center', marginBottom: '24px' }}>
                You're all set. Log in with your new password.
              </p>
              <Link
                to="/login"
                style={{
                  display: 'block', width: '100%', padding: '13px 24px', fontSize: '15px', fontWeight: 500,
                  borderRadius: '50px', border: 'none', cursor: 'pointer', textAlign: 'center',
                  background: 'var(--lavender)', color: '#fff', boxShadow: 'var(--shadow-button)',
                  fontFamily: 'var(--font-body)', textDecoration: 'none',
                }}
              >
                Log in
              </Link>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>
                Set a new password
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                Choose something you'll remember (at least 8 characters).
              </p>

              {error && (
                <div style={{ background: 'var(--error-pale)', border: '1px solid rgba(224,78,107,0.3)', color: 'var(--error)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '6px' }}>New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '6px' }}>Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
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
                  {loading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

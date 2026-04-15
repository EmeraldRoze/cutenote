import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const paperTexture = {
  backgroundImage: `repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 27px,
    rgba(232,224,213,0.5) 27px,
    rgba(232,224,213,0.5) 28px
  )`,
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [hasAddress, setHasAddress] = useState<boolean | null>(null)

  useEffect(() => {
    api.get('/address/me').then((res) => setHasAddress(!!res.data.data)).catch(() => setHasAddress(false))
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* Nav */}
      <nav style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--lavender-pale)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: 'var(--lavender-deep)' }}>
          QuteNote
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>@{user?.username}</span>
          <button
            onClick={handleLogout}
            style={{ fontSize: '13px', color: 'var(--ink-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Log out
          </button>
        </div>
      </nav>

      {/* Main */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Welcome */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '4px' }}>Welcome back,</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, color: 'var(--ink)' }}>
            {user?.displayName}
          </h2>
        </div>

        {/* Address nudge */}
        {hasAddress === false && (
          <button
            onClick={() => navigate('/address')}
            style={{
              width: '100%', marginBottom: '16px', padding: '14px 20px',
              borderRadius: '16px', border: '1.5px solid var(--blush)',
              background: 'var(--blush-pale)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'var(--font-body)', textAlign: 'left',
            }}
          >
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>Add your address</p>
              <p style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>So your Quties can send you notes too.</p>
            </div>
            <span style={{ fontSize: '18px', flexShrink: 0, marginLeft: '12px' }}>→</span>
          </button>
        )}

        {/* Subscribe nudge */}
        {user?.subscriptionStatus !== 'ACTIVE' && (
          <button
            onClick={() => navigate('/subscribe')}
            style={{
              width: '100%', marginBottom: '16px', padding: '14px 20px',
              borderRadius: '16px', border: '1.5px solid var(--lavender-light)',
              background: 'var(--lavender-pale)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'var(--font-body)', textAlign: 'left',
            }}
          >
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--lavender-deep)', marginBottom: '2px' }}>Subscribe to send postcards</p>
              <p style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>2 notes/month for $7.95 — cancel anytime</p>
            </div>
            <span style={{ fontSize: '18px', flexShrink: 0, marginLeft: '12px' }}>→</span>
          </button>
        )}

        {/* Send CTA */}
        <button
          onClick={() => navigate('/send')}
          style={{
            width: '100%', padding: '18px 24px', fontSize: '16px', fontWeight: 500,
            borderRadius: '50px', border: 'none', cursor: 'pointer',
            background: 'var(--lavender)', color: '#fff',
            boxShadow: 'var(--shadow-button)', fontFamily: 'var(--font-body)',
            marginBottom: '16px', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--lavender-dark)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--lavender)')}
        >
          Send a Qute Note
        </button>

        {/* Quties button */}
        <button
          onClick={() => navigate('/connections')}
          style={{
            width: '100%', padding: '14px 24px', fontSize: '14px', fontWeight: 500,
            borderRadius: '50px', border: '1.5px solid var(--lavender-light)', cursor: 'pointer',
            background: 'var(--white)', color: 'var(--lavender-dark)',
            fontFamily: 'var(--font-body)', marginBottom: '24px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--lavender-pale)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--white)')}
        >
          Quties
        </button>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            background: 'var(--white)', borderRadius: '20px',
            border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)',
            padding: '20px', textAlign: 'center',
          }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--lavender)' }}>
              {user?.points ?? 0}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>Points</p>
          </div>
          <div style={{
            background: 'var(--white)', borderRadius: '20px',
            border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)',
            padding: '20px', textAlign: 'center',
          }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--lavender)' }}>
              {user?.currentStreak ?? 0}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>Month streak</p>
          </div>
        </div>

        {/* Feed placeholder */}
        <div style={{
          background: 'var(--white)', borderRadius: '20px',
          border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)',
          padding: '24px', ...paperTexture,
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 500, color: 'var(--ink)', marginBottom: '12px' }}>
            Recent Cuteness
          </h3>
          <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '16px 0', fontFamily: 'var(--font-handwriting)', fontSize: '17px' }}>
            Your people are out there. Invite someone you love.
          </p>
        </div>

      </div>
    </div>
  )
}

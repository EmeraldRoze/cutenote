import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

interface FeedItem {
  id: string
  type: string
  occasionType: string
  status: string
  sender: { id: string; username: string; displayName: string; avatarUrl: string | null }
  recipient: { id: string; username: string; displayName: string; avatarUrl: string | null }
  createdAt: string
}

interface ImportantDate {
  id: string
  connectionName: string
  label: string
  month: number
  day: number
  year?: number
}

const paperTexture = {
  backgroundImage: `repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 27px,
    rgba(232,224,213,0.5) 27px,
    rgba(232,224,213,0.5) 28px
  )`,
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [hasAddress, setHasAddress] = useState<boolean | null>(null)
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [dates, setDates] = useState<ImportantDate[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [datesLoading, setDatesLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'feed' | 'dates'>('feed')

  useEffect(() => {
    api.get('/address/me').then((res) => setHasAddress(!!res.data.data)).catch(() => setHasAddress(false))
    api.get('/feed').then((res) => setFeed(res.data.data)).catch(() => {}).finally(() => setFeedLoading(false))
    api.get('/important-dates').then((res) => setDates(res.data.data)).catch(() => {}).finally(() => setDatesLoading(false))
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
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
          <div
            onClick={() => navigate(`/profile/${user?.username}`)}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--lavender-pale)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden',
              color: 'var(--lavender-dark)', fontSize: '12px', fontWeight: 600,
            }}
          >
            {user?.avatarUrl
              ? <img src={user.avatarUrl} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              : getInitials(user?.displayName ?? '')}
          </div>
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
            marginBottom: '10px', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--lavender-dark)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--lavender)')}
        >
          Send a QuteNote
        </button>

        {/* Invite a Qutie */}
        <button
          onClick={() => navigate('/invite')}
          style={{
            width: '100%', padding: '14px 24px', fontSize: '14px', fontWeight: 500,
            borderRadius: '50px', border: '1.5px solid var(--lavender-light)', cursor: 'pointer',
            background: 'var(--white)', color: 'var(--lavender-dark)',
            fontFamily: 'var(--font-body)', transition: 'background 0.15s',
            marginBottom: '24px',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--lavender-pale)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--white)')}
        >
          Invite a Qutie
        </button>

        {/* Notes remaining (subscribers only) */}
        {user?.subscriptionStatus === 'ACTIVE' && (
          <div style={{
            background: 'var(--white)', borderRadius: '20px',
            border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)',
            padding: '16px 20px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>
                Notes this month
              </p>
              <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                {(user.notesAllowance - user.notesUsed + user.giftedCredits) > 0
                  ? `${user.notesAllowance - user.notesUsed + user.giftedCredits} included — extras are $3.49 each`
                  : 'All included notes used — extras are $3.49 each'}
              </p>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, color: 'var(--lavender)' }}>
              {user.notesUsed}/{user.notesAllowance}
            </p>
          </div>
        )}

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

        {/* Admin link */}
        {user?.isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            style={{
              width: '100%', padding: '14px 24px', fontSize: '14px', fontWeight: 500,
              borderRadius: '50px', border: '1.5px solid var(--border-default)', cursor: 'pointer',
              background: 'var(--white)', color: 'var(--ink-muted)',
              fontFamily: 'var(--font-body)', marginBottom: '24px',
            }}
          >
            Admin Dashboard
          </button>
        )}

        {/* Feed with tabs */}
        <div style={{
          background: 'var(--white)', borderRadius: '20px',
          border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)' }}>
            <button
              onClick={() => setActiveTab('feed')}
              style={{
                flex: 1, padding: '14px', fontSize: '13px', fontWeight: 500,
                background: 'none', border: 'none', cursor: 'pointer',
                color: activeTab === 'feed' ? 'var(--lavender-deep)' : 'var(--ink-muted)',
                borderBottom: activeTab === 'feed' ? '2px solid var(--lavender)' : '2px solid transparent',
                fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              }}
            >
              Recent Quteness
            </button>
            <button
              onClick={() => setActiveTab('dates')}
              style={{
                flex: 1, padding: '14px', fontSize: '13px', fontWeight: 500,
                background: 'none', border: 'none', cursor: 'pointer',
                color: activeTab === 'dates' ? 'var(--lavender-deep)' : 'var(--ink-muted)',
                borderBottom: activeTab === 'dates' ? '2px solid var(--lavender)' : '2px solid transparent',
                fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              }}
            >
              Important Dates
            </button>
          </div>

          {/* Tab content */}
          <div style={{ padding: '20px', ...paperTexture, minHeight: '120px' }}>
            {activeTab === 'feed' && (
              <>
                {feedLoading && (
                  <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '16px 0', fontSize: '13px' }}>Loading...</p>
                )}
                {!feedLoading && feed.length === 0 && (
                  <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '16px 0', fontFamily: 'var(--font-handwriting)', fontSize: '17px' }}>
                    Your people are out there. Invite someone you love.
                  </p>
                )}
                {!feedLoading && feed.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {feed.map((item) => (
                      <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--ink)' }}>
                        <span style={{ fontSize: '16px' }}>💌</span>
                        <span>
                          <strong>{item.sender.displayName}</strong> sent a note to <strong>{item.recipient.displayName}</strong>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {activeTab === 'dates' && (
              <>
                {datesLoading && (
                  <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '16px 0', fontSize: '13px' }}>Loading...</p>
                )}
                {!datesLoading && dates.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <p style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)', fontSize: '17px', marginBottom: '12px' }}>
                      No important dates yet.
                    </p>
                    <button
                      onClick={() => navigate('/dates')}
                      style={{
                        fontSize: '13px', fontWeight: 500, padding: '8px 20px',
                        borderRadius: '50px', border: '1.5px solid var(--lavender-light)',
                        background: 'var(--white)', color: 'var(--lavender-dark)',
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}
                    >
                      Add a date
                    </button>
                  </div>
                )}
                {!datesLoading && dates.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {dates.map((d) => (
                      <li key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>{d.connectionName}</p>
                          <p style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{d.label}</p>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--lavender-dark)' }}>
                          {MONTH_NAMES[d.month - 1]} {d.day}
                        </p>
                      </li>
                    ))}
                    <li style={{ textAlign: 'center', paddingTop: '8px' }}>
                      <button
                        onClick={() => navigate('/dates')}
                        style={{
                          fontSize: '12px', fontWeight: 500, color: 'var(--lavender-dark)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        Manage dates →
                      </button>
                    </li>
                  </ul>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

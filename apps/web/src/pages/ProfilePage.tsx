import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

interface Badge {
  badgeType: string
  earnedAt: string
}

interface Profile {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  points: number
  currentStreak: number
  longestStreak: number
  isPrivate: boolean
  badges: Badge[]
  connectionStatus: string | null
  isMe: boolean
  _count: {
    notesSent: number
    notesReceived: number
    followers: number
    following: number
  }
}

interface Qutie {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
}

const BADGE_LABELS: Record<string, { label: string; icon: string }> = {
  FIRST_NOTE: { label: 'First Note', icon: '✉' },
  BIRTHDAY_HERO: { label: 'Birthday Hero', icon: '🎂' },
  ON_A_ROLL: { label: 'On a Roll', icon: '🔥' },
  KINDNESS_MACHINE: { label: 'Kindness Machine', icon: '💛' },
  PASS_IT_FORWARD: { label: 'Pass It Forward', icon: '🎁' },
  CONNECTED: { label: 'Connected', icon: '🤝' },
  THOUGHTFUL_FRIEND: { label: 'Thoughtful Friend', icon: '💭' },
  HOLIDAY_SPIRIT: { label: 'Holiday Spirit', icon: '🎄' },
}

const cardStyle = {
  background: 'var(--white)',
  borderRadius: '20px',
  border: '1px solid var(--border-default)',
  boxShadow: 'var(--shadow-card)',
  padding: '20px',
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: _me } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [quties, setQuties] = useState<Qutie[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (!username) return
    api.get(`/users/${username}`)
      .then((res) => {
        setProfile(res.data.data)
        return api.get(`/connections/user/${res.data.data.id}`)
      })
      .then((res) => setQuties(res.data.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [username])

  async function handleConnect() {
    if (!profile) return
    setConnecting(true)
    try {
      await api.post(`/connections/request/${profile.id}`)
      setProfile((p) => p ? { ...p, connectionStatus: profile.isPrivate ? 'PENDING' : 'ACCEPTED' } : null)
    } catch {
      // already connected
    } finally {
      setConnecting(false)
    }
  }

  async function handleUnfollow() {
    if (!profile) return
    setConnecting(true)
    try {
      await api.delete(`/connections/${profile.id}`)
      setProfile((p) => p ? { ...p, connectionStatus: null } : null)
    } finally {
      setConnecting(false)
    }
  }

  function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ink-muted)', fontSize: '14px' }}>Loading...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <p style={{ color: 'var(--ink-muted)', fontSize: '16px', fontFamily: 'var(--font-handwriting)' }}>User not found</p>
        <button onClick={() => navigate('/home')} style={{ fontSize: '13px', color: 'var(--lavender-dark)', background: 'none', border: 'none', cursor: 'pointer' }}>
          Go home
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Nav */}
      <nav style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--lavender-pale)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={() => navigate(-1)} style={{ fontSize: '13px', fontWeight: 500, color: 'var(--lavender-dark)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Back
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--ink)' }}>
          Profile
        </h1>
        <div style={{ width: '60px' }} />
      </nav>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Avatar + name */}
        <div style={{ ...cardStyle, textAlign: 'center', paddingTop: '32px', paddingBottom: '24px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--lavender-pale)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: '24px', fontWeight: 600, color: 'var(--lavender-dark)',
          }}>
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
              : getInitials(profile.displayName)}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: 'var(--ink)' }}>
            {profile.displayName}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '2px' }}>@{profile.username}</p>
          {profile.bio && (
            <p style={{ fontSize: '14px', color: 'var(--ink)', marginTop: '8px', lineHeight: '1.4' }}>{profile.bio}</p>
          )}

          {/* Connection button (only for other users) */}
          {!profile.isMe && (
            <div style={{ marginTop: '16px' }}>
              {profile.connectionStatus === 'ACCEPTED' ? (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={() => navigate(`/send?to=${profile.id}`)}
                    style={{
                      fontSize: '13px', fontWeight: 500, padding: '8px 20px',
                      borderRadius: '50px', border: 'none', cursor: 'pointer',
                      background: 'var(--lavender)', color: '#fff',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Send Qute
                  </button>
                  <button
                    onClick={handleUnfollow}
                    disabled={connecting}
                    style={{
                      fontSize: '13px', fontWeight: 500, padding: '8px 20px',
                      borderRadius: '50px', border: '1.5px solid var(--border-default)',
                      cursor: 'pointer', background: 'var(--white)', color: 'var(--ink-muted)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Unfollow
                  </button>
                </div>
              ) : profile.connectionStatus === 'PENDING' ? (
                <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>Request pending</span>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  style={{
                    fontSize: '13px', fontWeight: 500, padding: '8px 20px',
                    borderRadius: '50px', border: 'none', cursor: 'pointer',
                    background: 'var(--lavender)', color: '#fff',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {connecting ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
          )}

          {/* Edit profile link for own profile */}
          {profile.isMe && (
            <button
              onClick={() => navigate('/settings')}
              style={{
                marginTop: '16px', fontSize: '13px', fontWeight: 500, padding: '8px 20px',
                borderRadius: '50px', border: '1.5px solid var(--border-default)',
                cursor: 'pointer', background: 'var(--white)', color: 'var(--ink-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            { value: profile._count.notesSent, label: 'Sent' },
            { value: profile._count.notesReceived, label: 'Received' },
            { value: profile._count.following, label: 'Quties' },
          ].map((stat) => (
            <div key={stat.label} style={{
              ...cardStyle, padding: '14px 8px', textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, color: 'var(--lavender)' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CN Score + streak */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, color: 'var(--lavender)' }}>
              {profile.points}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>CN Score</p>
          </div>
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, color: 'var(--lavender)' }}>
              {profile.currentStreak}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>
              Month streak {profile.longestStreak > profile.currentStreak && `(best: ${profile.longestStreak})`}
            </p>
          </div>
        </div>

        {/* Quties list */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>
              Quties ({quties.length})
            </p>
            {profile.isMe && (
              <button
                onClick={() => navigate('/connections')}
                style={{
                  fontSize: '12px', fontWeight: 500, color: 'var(--lavender-dark)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Manage →
              </button>
            )}
          </div>
          {quties.length === 0 && (
            <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '12px 0', fontFamily: 'var(--font-handwriting)', fontSize: '16px' }}>
              {profile.isMe ? 'No Quties yet. Find someone to connect with!' : 'No connections yet.'}
            </p>
          )}
          {quties.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {quties.map((q) => (
                <div
                  key={q.id}
                  onClick={() => navigate(`/profile/${q.username}`)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '4px', cursor: 'pointer', width: '64px',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'var(--lavender-pale)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--lavender-dark)', fontSize: '14px', fontWeight: 600,
                    overflow: 'hidden',
                  }}>
                    {q.avatarUrl
                      ? <img src={q.avatarUrl} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                      : getInitials(q.displayName)}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word' }}>
                    {q.displayName.split(' ')[0]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        {profile.badges.length > 0 && (
          <div style={cardStyle}>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '12px' }}>Badges</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profile.badges.map((b) => {
                const info = BADGE_LABELS[b.badgeType] ?? { label: b.badgeType, icon: '⭐' }
                return (
                  <div key={b.badgeType} style={{
                    padding: '8px 14px', borderRadius: '50px',
                    background: 'var(--lavender-pale)', border: '1px solid var(--lavender-light)',
                    fontSize: '12px', fontWeight: 500, color: 'var(--lavender-dark)',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    <span>{info.icon}</span>
                    <span>{info.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {profile.badges.length === 0 && profile.isMe && (
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)', fontSize: '16px' }}>
              No badges yet. Send your first note to earn one!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import QEmoji from '../components/QEmoji'
import TabBar from '../components/TabBar'

// Profile — App Screens board layout in the Oct 2026 system:
// membership card, stats, privacy, handwriting teaser, stamp book, postcards.

const uv = '#5A32D6'
const label: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--ink-mid)' }
const sectionTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, letterSpacing: '-0.01em', color: 'var(--ink)' }

interface Badge { badgeType: string; earnedAt: string }
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
  _count: { notesSent: number; notesReceived: number; followers: number; following: number }
}
interface NoteThumb {
  id: string
  occasionType: string
  cardDesignId?: string | null
  cardImageUrl?: string | null
  createdAt: string
}

// Badges render as stamps in the stamp book
const STAMPS: Record<string, { label: string; art: string; bg: string }> = {
  FIRST_NOTE: { label: 'First note', art: 'envelope', bg: 'var(--lavender-pale)' },
  BIRTHDAY_HERO: { label: 'Birthday hero', art: 'cake', bg: '#F9E8EF' },
  ON_A_ROLL: { label: 'On a roll', art: 'popper', bg: '#FDF3DC' },
  KINDNESS_MACHINE: { label: 'Kindness machine', art: 'heart', bg: '#FBEAEA' },
  PASS_IT_FORWARD: { label: 'Pass it forward', art: 'gift', bg: '#EAF2FB' },
  CONNECTED: { label: 'Connected', art: 'clover', bg: '#EDF5E4' },
  THOUGHTFUL_FRIEND: { label: 'Thoughtful friend', art: 'flower', bg: 'var(--lavender-pale)' },
  HOLIDAY_SPIRIT: { label: 'Holiday spirit', art: 'star', bg: '#FDF3DC' },
}
const CARD_BG: Record<string, string> = { 'design-1': '#EAF2FB', 'design-2': 'var(--lavender-pale)', 'design-3': '#EDF5E4' }
const CARD_ART: Record<string, string> = { 'design-1': 'flower', 'design-2': 'popper', 'design-3': 'star' }
const OCCASION_ART: Record<string, string> = {
  BIRTHDAY: 'cake', ANNIVERSARY: 'hearteyes', CONGRATULATIONS: 'popper', HOLIDAY: 'star',
  CONSOLATION: 'rainbow', JUST_BECAUSE: 'envelope', INVITATION: 'plane', CUSTOM: 'envelope',
}

export default function ProfilePage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'sent' | 'received'>('sent')
  const [sent, setSent] = useState<NoteThumb[]>([])
  const [received, setReceived] = useState<NoteThumb[]>([])
  const [requested, setRequested] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/users/${username}`)
      .then((res) => setProfile(res.data.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [username])

  const isMe = profile?.isMe ?? (user?.username === username)

  useEffect(() => {
    if (!isMe) return
    api.get('/notes/sent').then((r) => setSent(r.data.data)).catch(() => {})
    api.get('/notes/received').then((r) => setReceived(r.data.data)).catch(() => {})
  }, [isMe])

  async function togglePrivacy() {
    await api.post('/connections/privacy', { isPrivate: !user?.isPrivate })
    refreshUser?.()
    setProfile((p) => (p ? { ...p, isPrivate: !p.isPrivate } : p))
  }

  async function addQT() {
    if (!profile) return
    await api.post(`/connections/request/${profile.id}`)
    setRequested(true)
  }

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>One sec…</p>
        <TabBar />
      </div>
    )
  }
  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>No one by that name here.</p>
        <TabBar />
      </div>
    )
  }

  const notes = tab === 'sent' ? sent : received
  const earned = profile.badges.map((b) => b.badgeType).filter((t) => STAMPS[t])

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '110px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 24px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={sectionTitle}>Profile</div>
          {isMe && (
            <button onClick={() => navigate('/subscribe')} aria-label="Membership" style={{
              height: '32px', padding: '0 12px', borderRadius: '999px', border: '1px solid var(--stone)',
              background: '#fff', color: 'var(--ink-mid)', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em',
            }}>Membership</button>
          )}
        </div>

        {/* Identity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '96px', height: '96px', borderRadius: '48px', background: 'var(--lavender-light)',
            border: '3px solid #fff', boxShadow: '0 4px 14px rgba(43,34,56,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: '28px', color: uv, overflow: 'hidden',
          }}>
            {profile.avatarUrl ? <img src={profile.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(profile.displayName)}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginTop: '10px', letterSpacing: '-0.01em' }}>{profile.displayName}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--ink-mid)' }}>@{profile.username}</div>
          {profile.bio && <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-mid)', marginTop: '6px', textAlign: 'center' }}>{profile.bio}</p>}

          {!isMe && (
            <button
              onClick={addQT}
              disabled={requested || profile.connectionStatus === 'ACCEPTED' || profile.connectionStatus === 'PENDING'}
              style={{
                marginTop: '12px', height: '40px', padding: '0 18px', borderRadius: '999px', cursor: 'pointer',
                border: `1.5px solid ${uv}`,
                background: profile.connectionStatus === 'ACCEPTED' ? 'var(--lavender-pale)' : '#fff',
                color: uv, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.12em',
              }}
            >
              {profile.connectionStatus === 'ACCEPTED' ? 'Your QT' : requested || profile.connectionStatus === 'PENDING' ? 'Requested' : 'Add QT'}
            </button>
          )}

          {/* Membership card (me only) */}
          {isMe && user && (
            <div style={{
              width: '100%', boxSizing: 'border-box', marginTop: '18px', padding: '14px 16px',
              borderRadius: '14px', background: 'var(--lavender-pale)', border: '1px solid var(--lavender-light)',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <span style={{ display: 'flex', gap: '6px' }}>
                {[0, 1].map((i) => {
                  const total = (user.notesAllowance ?? 0) + (user.giftedCredits ?? 0)
                  const left = Math.max(0, total - (user.notesUsed ?? 0))
                  return <span key={i} style={{ width: '22px', height: '28px', borderRadius: '3px', background: i < left ? uv : 'var(--lavender-light)' }} />
                })}
              </span>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700 }}>
                  {user.subscriptionStatus === 'ACTIVE'
                    ? `${Math.max(0, (user.notesAllowance ?? 0) + (user.giftedCredits ?? 0) - (user.notesUsed ?? 0))} of ${(user.notesAllowance ?? 0) + (user.giftedCredits ?? 0)} cards left this month`
                    : 'No membership yet'}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)' }}>
                  {user.subscriptionStatus === 'ACTIVE' ? 'Member · $7.95/mo' : 'Join for $7.95/mo · two postcards a month'}
                </span>
              </span>
              {user.subscriptionStatus !== 'ACTIVE' && (
                <button onClick={() => navigate('/subscribe')} style={{
                  height: '34px', padding: '0 12px', borderRadius: '999px', border: 'none', background: uv, color: '#fff',
                  fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em', cursor: 'pointer',
                }}>Join</button>
              )}
            </div>
          )}

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', width: '100%', marginTop: '16px',
            padding: '14px 0', borderTop: '1px solid var(--stone)', borderBottom: '1px solid var(--stone)', textAlign: 'center',
          }}>
            <div><div style={{ fontFamily: 'var(--font-display)', fontSize: '22px' }}>{profile._count.notesSent}</div><div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)' }}>cards sent</div></div>
            <div><div style={{ fontFamily: 'var(--font-display)', fontSize: '22px' }}>{profile._count.notesReceived}</div><div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)' }}>cards received</div></div>
            <div><div style={{ fontFamily: 'var(--font-display)', fontSize: '22px' }}>{profile._count.following}</div><div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)' }}>QTs</div></div>
          </div>

          {/* Privacy (me only) */}
          {isMe && (
            <div style={{ width: '100%', marginTop: '14px', padding: '14px 16px', boxSizing: 'border-box', borderRadius: '14px', background: '#fff', border: '1px solid var(--stone)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700 }}>Who sees your sends</span>
                <span style={{ display: 'flex', padding: '3px', borderRadius: '10px', background: 'var(--lavender-pale)' }}>
                  <button onClick={() => user?.isPrivate || togglePrivacy()} style={{ height: '32px', padding: '0 12px', border: 'none', borderRadius: '8px', background: user?.isPrivate ? '#fff' : 'transparent', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink)', cursor: 'pointer' }}>Private</button>
                  <button onClick={() => user?.isPrivate && togglePrivacy()} style={{ height: '32px', padding: '0 12px', border: 'none', borderRadius: '8px', background: user?.isPrivate ? 'transparent' : '#fff', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink)', cursor: 'pointer' }}>Public</button>
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', lineHeight: 1.45, color: 'var(--ink-mid)' }}>
                {user?.isPrivate
                  ? 'Private: your sends stay off feeds, and only you can see the cards you sent.'
                  : "Public: your sends show on your QTs' feeds and on your profile. Messages are never shown."}
              </div>
            </div>
          )}

          {/* Handwriting teaser (me only) */}
          {isMe && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px', width: '100%', boxSizing: 'border-box',
              marginTop: '14px', padding: '14px', borderRadius: '14px', background: '#fff',
              border: `1.5px dashed var(--lavender-soft)`,
            }}>
              <span style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '12px', background: 'var(--lavender-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '16px', color: uv }}>Aa</span>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700 }}>Your handwriting</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)' }}>Teach QuteNote to write like you. Coming soon.</span>
              </span>
            </div>
          )}

          {/* Stamp book */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%', margin: '26px 0 4px' }}>
            <div style={sectionTitle}>Stamp book</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)' }}>{earned.length} collected</div>
          </div>
          <div style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)', marginBottom: '14px' }}>
            Stamps arrive as you send, connect, and show up. Just for fun.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px 8px', width: '100%' }}>
            {earned.map((t) => (
              <div key={t} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '58px', height: '69px', boxSizing: 'border-box', padding: '4px', background: '#fff', border: `2px dashed var(--lavender-soft)`, borderRadius: '4px', boxShadow: '0 2px 6px rgba(43,34,56,0.1)' }}>
                  <span style={{ display: 'flex', width: '100%', height: '100%', borderRadius: '2px', background: STAMPS[t].bg, alignItems: 'center', justifyContent: 'center' }}>
                    <QEmoji name={STAMPS[t].art} size={34} />
                  </span>
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', lineHeight: 1.25, textAlign: 'center', color: 'var(--ink-mid)' }}>{STAMPS[t].label}</span>
              </div>
            ))}
            {['Keep sending', 'Coming soon'].map((l) => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '58px', height: '69px', boxSizing: 'border-box', border: '2px dashed var(--lavender-light)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lavender-light)', fontSize: '18px' }}>?</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', lineHeight: 1.25, textAlign: 'center', color: 'var(--ink-muted)' }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Postcards (me only — board shows own archive) */}
          {isMe && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', margin: '26px 0 12px' }}>
                <div style={sectionTitle}>Your postcards</div>
                <span style={{ display: 'flex', padding: '3px', borderRadius: '10px', background: 'var(--lavender-pale)' }}>
                  <button onClick={() => setTab('sent')} style={{ height: '32px', padding: '0 12px', border: 'none', borderRadius: '8px', background: tab === 'sent' ? '#fff' : 'transparent', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink)', cursor: 'pointer' }}>Sent</button>
                  <button onClick={() => setTab('received')} style={{ height: '32px', padding: '0 12px', border: 'none', borderRadius: '8px', background: tab === 'received' ? '#fff' : 'transparent', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink)', cursor: 'pointer' }}>Received</button>
                </span>
              </div>
              {tab === 'sent' && user?.isPrivate && (
                <div style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-mid)', marginBottom: '10px' }}>
                  Only you can see your sent cards.
                </div>
              )}
              {notes.length === 0 ? (
                <p style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-muted)', padding: '10px 0 20px' }}>
                  {tab === 'sent' ? 'Nothing sent yet. Someone came to mind, didn’t they?' : 'No postcards received yet.'}
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%' }}>
                  {notes.map((n) => (
                    <div key={n.id} style={{
                      height: '96px', borderRadius: '8px', border: '4px solid #fff',
                      boxShadow: '0 2px 8px rgba(43,34,56,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: n.cardImageUrl ? `url(${n.cardImageUrl}) center/cover` : CARD_BG[n.cardDesignId ?? ''] ?? 'var(--lavender-pale)',
                    }}>
                      {!n.cardImageUrl && <QEmoji name={CARD_ART[n.cardDesignId ?? ''] ?? OCCASION_ART[n.occasionType] ?? 'envelope'} size={48} />}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <TabBar />
    </div>
  )
}

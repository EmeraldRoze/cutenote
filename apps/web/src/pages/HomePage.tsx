import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import QEmoji from '../components/QEmoji'
import TabBar from '../components/TabBar'
import { StatusComposer, type MyStatus } from '../components/Happenings'

const uv = '#5A32D6'
const label: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--ink-mid)' }

interface FeedUser { id: string; username: string; displayName: string; avatarUrl: string | null }
interface FeedItem {
  kind: 'status' | 'note'
  id: string
  createdAt: string
  hearts: number
  heartedByMe: boolean
  emoji?: string | null
  text?: string
  user?: FeedUser
  occasionType?: string
  sender?: FeedUser
  recipient?: FeedUser
}
interface ImportantDate { id: string; connectionName: string; label: string; month: number; day: number }

const OCCASION_SENTENCE: Record<string, string> = {
  BIRTHDAY: 'a birthday note', ANNIVERSARY: 'an anniversary note',
  CONGRATULATIONS: 'a congrats note', HOLIDAY: 'a holiday note',
  CONSOLATION: 'a thinking-of-you note', JUST_BECAUSE: 'a just-because note',
  INVITATION: 'an invitation', CUSTOM: 'a note',
}
const OCCASION_ART: Record<string, string> = {
  BIRTHDAY: 'cake', ANNIVERSARY: 'hearteyes', CONGRATULATIONS: 'popper',
  HOLIDAY: 'star', CONSOLATION: 'rainbow', JUST_BECAUSE: 'envelope',
  INVITATION: 'plane', CUSTOM: 'envelope',
}

function timeAgo(d: string) {
  const mins = Math.floor((Date.now() - +new Date(d)) / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m`
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h`
  return `${Math.floor(mins / 1440)}d`
}

function daysUntil(month: number, day: number) {
  const now = new Date()
  const year = now.getFullYear()
  let next = new Date(year, month - 1, day)
  const today = new Date(year, now.getMonth(), now.getDate())
  if (next < today) next = new Date(year + 1, month - 1, day)
  return Math.round((+next - +today) / 86400000)
}

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [dates, setDates] = useState<ImportantDate[]>([])
  const [myStatus, setMyStatus] = useState<MyStatus | null>(null)
  const [hasAddress, setHasAddress] = useState<boolean | null>(null)
  const [composing, setComposing] = useState(false)
  const [lastSeen] = useState(() => Number(localStorage.getItem('qn_feed_seen') ?? 0))

  useEffect(() => {
    api.get('/statuses/home-feed').then((r) => setFeed(r.data.data)).catch(() => {})
    api.get('/important-dates').then((r) => setDates(r.data.data)).catch(() => {})
    api.get('/statuses/mine').then((r) => setMyStatus(r.data.data)).catch(() => {})
    api.get('/address/me').then((r) => setHasAddress(!!r.data.data)).catch(() => setHasAddress(null))
    localStorage.setItem('qn_feed_seen', String(Date.now()))
  }, [])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
    return `Good ${part},`
  }, [])
  const firstName = user?.displayName?.split(' ')[0] ?? ''

  const nudge = useMemo(() => {
    const upcoming = dates
      .map((d) => ({ ...d, days: daysUntil(d.month, d.day) }))
      .filter((d) => d.days <= 45)
      .sort((a, b) => a.days - b.days)[0]
    return upcoming ?? null
  }, [dates])

  async function toggleHeart(item: FeedItem) {
    const targetType = item.kind === 'status' ? 'STATUS' : 'NOTE'
    setFeed((f) => f.map((i) => i === item
      ? { ...i, heartedByMe: !i.heartedByMe, hearts: i.hearts + (i.heartedByMe ? -1 : 1) }
      : i))
    try { await api.post('/statuses/heart', { targetType, targetId: item.id }) } catch { /* refreshed on next load */ }
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '110px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '18px 24px 0' }}>

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '44px', marginBottom: '12px' }}>
          <img src="/site/logo-ink.png" alt="QuteNote" style={{ width: '128px', display: 'block' }} />
        </div>

        {/* Happenings status row */}
        <button onClick={() => setComposing(true)} style={{
          display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
          padding: '8px 12px 8px 8px', borderRadius: '30px', border: '1px solid var(--stone)',
          background: '#fff', boxShadow: '0 4px 14px rgba(43,34,56,0.05)', cursor: 'pointer', textAlign: 'left',
        }}>
          <span style={{ width: '40px', height: '40px', minWidth: '40px', borderRadius: '20px', background: 'var(--lavender-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QEmoji name={myStatus?.emoji ?? 'sun'} size={28} />
          </span>
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <span style={label}>Happenings</span>
            <span style={{ fontSize: '16px', fontFamily: 'var(--font-body)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: myStatus ? 'var(--ink)' : 'var(--ink-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {myStatus?.text ?? "What's new with you?"}
            </span>
          </span>
          <span style={{ color: uv, display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16z" /></svg>
          </span>
        </button>

        {/* Greeting */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '27px', lineHeight: 1.18, color: 'var(--ink)', fontWeight: 400, letterSpacing: '-0.01em', margin: '22px 0 0' }}>
          {greeting}<br />{firstName}.
        </h1>

        {/* Date nudge */}
        {nudge && (
          <div style={{ marginTop: '18px', padding: '16px', borderRadius: '16px', background: 'var(--lavender-pale)', border: '1px solid var(--lavender-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <QEmoji name={/birth/i.test(nudge.label) ? 'cake' : 'star'} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--ink)', background: 'var(--lime)', padding: '3px 9px', borderRadius: '10px' }}>
                  {nudge.days === 0 ? 'Today' : `In ${nudge.days} day${nudge.days === 1 ? '' : 's'}`}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', marginTop: '2px', fontWeight: 400, letterSpacing: '-0.01em' }}>
                  {nudge.connectionName}'s {nudge.label.toLowerCase()}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '15px', lineHeight: 1.45, fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
              Write it now. We'll mail it so it lands on the day.
            </div>
            <button onClick={() => navigate(`/send?toName=${encodeURIComponent(nudge.connectionName.split(' ')[0])}`)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '46px',
              borderRadius: '10px', background: uv, color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em',
            }}>
              Write to {nudge.connectionName.split(' ')[0]}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
            </button>
          </div>
        )}

        {/* Address nudge (kept — people need it to receive mail) */}
        {hasAddress === false && (
          <button onClick={() => navigate('/address')} style={{
            width: '100%', marginTop: '14px', padding: '12px 16px', borderRadius: '12px',
            border: '1.5px dashed var(--lavender-soft)', background: '#fff', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '13px', color: uv, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>
            Add your address so QTs can mail you back
          </button>
        )}

        {/* Feed */}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', margin: '26px 0 2px', fontWeight: 400, letterSpacing: '-0.01em' }}>Your QTs, lately</div>
        <div style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--ink-mid)' }}>Statuses and public sends. Messages are never shown.</div>

        {feed.length === 0 && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-muted)', padding: '28px 0' }}>
            Quiet in here. Add some QTs and the good stuff follows.
          </p>
        )}

        {feed.map((item) => (
          <div key={`${item.kind}-${item.id}`} style={{ display: 'flex', gap: '12px', padding: '16px 0', borderBottom: '1px solid var(--stone)' }}>
            {item.kind === 'status' ? (
              <span style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '18px', background: 'var(--lavender-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '9px' }}>
                {(item.user?.displayName ?? '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            ) : (
              <span style={{ width: '36px', minWidth: '36px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                <QEmoji name={OCCASION_ART[item.occasionType ?? 'CUSTOM'] ?? 'envelope'} size={36} />
              </span>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {item.kind === 'status' ? (
                <>
                  <div style={{ fontSize: '15px', fontFamily: 'var(--font-body)' }}>
                    <strong>{item.user?.displayName}</strong>{' '}
                    <span style={{ color: 'var(--ink-mid)' }}>shared a status · {timeAgo(item.createdAt)}</span>
                    {+new Date(item.createdAt) > lastSeen && (
                      <span style={{ display: 'inline-block', width: '10px', height: '10px', marginLeft: '6px', borderRadius: '5px', background: 'var(--lime)', border: '1.5px solid var(--ink)', verticalAlign: 'middle' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', borderRadius: '12px', background: '#fff', border: '1px solid var(--stone)' }}>
                    {item.emoji && <QEmoji name={item.emoji} size={18} />}
                    <span style={{ fontSize: '15px', lineHeight: 1.4, fontFamily: 'var(--font-body)' }}>{item.text}</span>
                  </div>
                  <button onClick={() => navigate(`/send?toName=${encodeURIComponent(item.user?.displayName.split(' ')[0] ?? '')}`)} style={{
                    alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', height: '40px',
                    padding: '0 12px 0 14px', borderRadius: '6px', background: 'var(--lavender-pale)',
                    border: '1.5px dashed var(--lavender-soft)', color: uv, cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em',
                  }}>
                    Send a little somethin'
                    <span style={{ position: 'relative', width: '26px', height: '17px', flexShrink: 0 }}>
                      <img src="/brand/postmark-heart-only.png" alt="" style={{ position: 'absolute', inset: 0, width: '26px', height: '17px', objectFit: 'contain' }} />
                      <img src="/brand/postmark-waves-only.png" alt="" style={{ position: 'absolute', inset: 0, width: '26px', height: '17px', objectFit: 'contain' }} />
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '15px', lineHeight: 1.4, fontFamily: 'var(--font-body)' }}>
                    <strong>{item.sender?.displayName}</strong> sent <strong>{item.recipient?.displayName}</strong>{' '}
                    {OCCASION_SENTENCE[item.occasionType ?? 'CUSTOM'] ?? 'a note'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--ink-mid)' }}>
                    <span>{timeAgo(item.createdAt)}</span>
                    <button onClick={() => toggleHeart(item)} style={{
                      height: '30px', display: 'flex', alignItems: 'center', gap: '5px', border: 'none',
                      background: 'transparent', padding: 0, fontSize: '13px', cursor: 'pointer',
                      color: item.heartedByMe ? uv : 'var(--ink-mid)', fontFamily: 'var(--font-body)',
                      textTransform: 'none', letterSpacing: 0, fontWeight: item.heartedByMe ? 700 : 400,
                    }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill={item.heartedByMe ? uv : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
                      {item.hearts}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Status composer */}
      {composing && <StatusComposer onDone={(s) => { if (s) setMyStatus(s); setComposing(false) }} />}

      <TabBar />
    </div>
  )
}

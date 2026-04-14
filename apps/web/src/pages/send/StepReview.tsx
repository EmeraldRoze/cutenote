import { useState } from 'react'
import { api } from '../../lib/api'
import type { NoteData } from './SendFlow'
import { useNavigate } from 'react-router-dom'

const FONT_FAMILIES: Record<string, string> = {
  CAVEAT: "'Caveat', cursive",
  DANCING_SCRIPT: "'Dancing Script', cursive",
  REENIE_BEANIE: "'Reenie Beanie', cursive",
  PATRICK_HAND: "'Patrick Hand', cursive",
}

const OCCASION_LABELS: Record<string, string> = {
  BIRTHDAY: '🎂 Birthday',
  ANNIVERSARY: '💑 Anniversary',
  CONGRATULATIONS: '🎉 Congrats',
  HOLIDAY: '✨ Holiday',
  CONSOLATION: '🤗 Thinking of you',
  JUST_BECAUSE: '💌 Just because',
  INVITATION: '📬 Invitation',
  CUSTOM: '✏️ Custom',
}

const CARD_GRADIENTS: Record<string, string> = {
  'design-1': 'linear-gradient(135deg, #C4BAE0, #F5C2C7)',
  'design-2': 'linear-gradient(135deg, #fde68a, #fca5a5)',
  'design-3': 'linear-gradient(135deg, #9B8EC4, #3D3470)',
}
const CARD_EMOJI: Record<string, string> = {
  'design-1': '🌸',
  'design-2': '🎊',
  'design-3': '🌟',
}

export default function StepReview({
  note,
  onBack: _onBack,
}: {
  note: NoteData
  onBack: () => void
}) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fontFamily = FONT_FAMILIES[note.fontChoice] ?? FONT_FAMILIES['CAVEAT']
  const cardGradient = note.cardDesignId ? CARD_GRADIENTS[note.cardDesignId] : 'linear-gradient(135deg, #C4BAE0, #F5C2C7)'
  const cardEmoji = note.cardDesignId ? CARD_EMOJI[note.cardDesignId] : '💌'

  async function handleSend() {
    setSending(true)
    setError('')
    try {
      await api.post('/notes', {
        recipientId: note.recipientId,
        occasionType: note.occasionType,
        noteText: note.noteText,
        toneUsed: note.toneUsed,
        fontChoice: note.fontChoice,
        cardDesignType: note.cardDesignType,
        cardDesignId: note.cardDesignId,
        cardImageUrl: note.cardImageUrl,
      })
      navigate('/home?sent=1')
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Something went wrong. Try again.')
      setSending(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>
        Looks good?
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '24px' }}>
        Here's what {note.recipientName} will receive.
      </p>

      {/* Card front preview */}
      <div style={{
        width: '100%', aspectRatio: '3/2', borderRadius: '20px',
        background: cardGradient, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
        boxShadow: 'var(--shadow-card)', position: 'relative', overflow: 'hidden',
      }}>
        <span style={{ fontSize: '48px', marginBottom: '8px' }}>{cardEmoji}</span>
        {note.cardImageUrl && (
          <img
            src={note.cardImageUrl}
            alt="Your photo"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, borderRadius: '20px' }}
          />
        )}
      </div>

      {/* Card back / message preview */}
      <div style={{
        background: 'var(--white)', borderRadius: '20px',
        border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)',
        padding: '20px', marginBottom: '24px',
        backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(232,224,213,0.5) 27px, rgba(232,224,213,0.5) 28px)`,
      }}>
        <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px' }}>
          The message they'll read
        </p>
        <p style={{ fontSize: '20px', color: 'var(--ink)', lineHeight: 1.6, fontFamily }}>
          {note.noteText}
        </p>
        <div style={{
          marginTop: '16px', paddingTop: '16px',
          borderTop: '1px solid var(--lavender-pale)',
          display: 'flex', justifyContent: 'space-between',
          fontSize: '12px', color: 'var(--ink-muted)',
        }}>
          <span>{OCCASION_LABELS[note.occasionType] ?? note.occasionType}</span>
          <span>To: {note.recipientName}</span>
        </div>
      </div>

      {/* Load Google Fonts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Caveat&family=Dancing+Script&family=Reenie+Beanie&family=Patrick+Hand&display=swap"
      />

      {error && (
        <p style={{ fontSize: '13px', color: 'var(--error)', textAlign: 'center', marginBottom: '16px' }}>{error}</p>
      )}

      <button
        onClick={handleSend}
        disabled={sending}
        style={{
          width: '100%', padding: '15px 24px', fontSize: '16px', fontWeight: 500,
          borderRadius: '50px', border: 'none', cursor: sending ? 'not-allowed' : 'pointer',
          background: sending ? 'var(--lavender-light)' : 'var(--lavender)',
          color: '#fff', boxShadow: sending ? 'none' : 'var(--shadow-button)',
          fontFamily: 'var(--font-body)', transition: 'background 0.15s',
        }}
      >
        {sending ? 'Sending...' : '💌 Send this note'}
      </button>

      <p style={{ fontSize: '12px', color: 'var(--ink-muted)', textAlign: 'center', marginTop: '12px' }}>
        Your note will be printed and mailed within 2–3 business days.
      </p>
    </div>
  )
}

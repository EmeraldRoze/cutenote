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

const CARD_COLORS: Record<string, string> = {
  'design-1': 'from-pink-200 to-rose-300',
  'design-2': 'from-yellow-200 to-orange-300',
  'design-3': 'from-indigo-200 to-purple-300',
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
  const cardColor = note.cardDesignId ? CARD_COLORS[note.cardDesignId] : 'from-pink-200 to-rose-300'
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
      <h2 className="text-xl font-bold text-gray-800 mb-1">Looks good?</h2>
      <p className="text-sm text-gray-500 mb-6">Here's what {note.recipientName} will receive.</p>

      {/* Card front preview */}
      <div className={`w-full aspect-[3/2] rounded-2xl bg-gradient-to-br ${cardColor} flex flex-col items-center justify-center mb-4 shadow-sm`}>
        <span className="text-5xl mb-2">{cardEmoji}</span>
        {note.cardImageUrl && (
          <img
            src={note.cardImageUrl}
            alt="Your photo"
            className="w-full h-full object-cover rounded-2xl absolute inset-0 opacity-80"
          />
        )}
      </div>

      {/* Card back preview */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          The message they'll read
        </p>
        <p
          className="text-lg text-gray-700 leading-relaxed"
          style={{ fontFamily }}
        >
          {note.noteText}
        </p>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
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
        <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
      )}

      <button
        onClick={handleSend}
        disabled={sending}
        className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-colors text-base"
      >
        {sending ? 'Sending...' : '💌 Send this note'}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        Your note will be printed and mailed within 2–3 business days.
      </p>
    </div>
  )
}

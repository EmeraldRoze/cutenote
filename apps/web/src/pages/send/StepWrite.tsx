import { useState } from 'react'
import { api } from '../../lib/api'
import { NoteData } from './SendFlow'

const TONES = [
  { value: 'HEARTFELT', label: 'Heartfelt' },
  { value: 'FUNNY', label: 'Funny' },
  { value: 'FORMAL', label: 'Formal' },
  { value: 'QUIRKY', label: 'Quirky' },
]

const PROMPTS: Record<string, string[]> = {
  BIRTHDAY: [
    "Another year of being absolutely awesome. Here's to you:",
    "I can't believe it's your birthday again. Time flies when you're this cool:",
    "On your birthday, I just want to say:",
  ],
  CONGRATULATIONS: [
    "You did it! I always knew you would because:",
    "This is huge and you deserve every bit of it:",
    "I am so proud of you. Here's what I want you to know:",
  ],
  JUST_BECAUSE: [
    "No reason needed — I just wanted to tell you:",
    "I was thinking about you today and realized:",
    "You showed up for me and I never want you to forget:",
  ],
}

const MAX_CHARS = 300

export default function StepWrite({
  note,
  onNext,
  onBack,
}: {
  note: Partial<NoteData>
  onNext: (data: Partial<NoteData>) => void
  onBack: () => void
}) {
  const [mode, setMode] = useState<'blank' | 'prompt' | 'madlib'>('blank')
  const [tone, setTone] = useState('HEARTFELT')
  const [text, setText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const prompts = PROMPTS[note.occasionType ?? ''] ?? PROMPTS['JUST_BECAUSE']
  const remaining = MAX_CHARS - text.length

  async function generateMadlib() {
    setAiLoading(true)
    try {
      const res = await api.post('/ai/madlibs', {
        tone,
        occasion: note.occasionType,
        recipientName: note.recipientName,
      })
      setText(res.data.data.text ?? '')
    } catch {
      setText(`Hey ${note.recipientName}, just thinking about you and wanted to say — you're one of the good ones. 💌`)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Write your note</h2>
      <p className="text-sm text-gray-500 mb-4">
        Sometimes we choke on our feelings. We got you.
      </p>

      {/* Tone selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {TONES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTone(t.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              tone === t.value
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Mode tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4 gap-1">
        {(['blank', 'prompt', 'madlib'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
              mode === m ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {m === 'madlib' ? '✨ AI Help' : m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Prompt suggestions */}
      {mode === 'prompt' && (
        <div className="mb-4 space-y-2">
          {prompts.map((p, i) => (
            <button
              key={i}
              onClick={() => setText(p + ' ')}
              className="w-full text-left text-sm bg-white border border-gray-100 hover:border-rose-200 rounded-xl px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* AI madlib */}
      {mode === 'madlib' && (
        <button
          onClick={generateMadlib}
          disabled={aiLoading}
          className="w-full mb-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {aiLoading ? '✨ Writing something cute...' : '✨ Generate a note for me'}
        </button>
      )}

      {/* Text area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder={`Write your note to ${note.recipientName ?? 'them'}...`}
          rows={5}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
        />
        <span className={`absolute bottom-3 right-3 text-xs ${remaining < 30 ? (remaining < 10 ? 'text-red-400' : 'text-rose-400') : 'text-gray-300'}`}>
          {remaining}
        </span>
      </div>

      <button
        disabled={text.trim().length < 5}
        onClick={() => onNext({ noteText: text.trim(), toneUsed: tone })}
        className="w-full mt-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-colors"
      >
        Next
      </button>
    </div>
  )
}

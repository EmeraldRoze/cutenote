import { useState } from 'react'
import type { NoteData } from './SendFlow'

const FONTS = [
  { value: 'CAVEAT', label: 'Caveat', family: "'Caveat', cursive", sample: 'The quick brown fox' },
  { value: 'DANCING_SCRIPT', label: 'Dancing Script', family: "'Dancing Script', cursive", sample: 'The quick brown fox' },
  { value: 'REENIE_BEANIE', label: 'Reenie Beanie', family: "'Reenie Beanie', cursive", sample: 'The quick brown fox' },
  { value: 'PATRICK_HAND', label: 'Patrick Hand', family: "'Patrick Hand', cursive", sample: 'The quick brown fox' },
]

export default function StepFont({
  note,
  onNext,
  onBack: _onBack,
}: {
  note: Partial<NoteData>
  onNext: (data: Partial<NoteData>) => void
  onBack: () => void
}) {
  const [selected, setSelected] = useState('CAVEAT')

  const preview = note.noteText ?? 'Your note will look like this when it arrives.'

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Pick a handwriting style</h2>
      <p className="text-sm text-gray-500 mb-6">This is how your words will appear on the card.</p>

      <div className="space-y-3 mb-6">
        {FONTS.map((font) => (
          <button
            key={font.value}
            onClick={() => setSelected(font.value)}
            className={`w-full text-left rounded-2xl border-2 px-5 py-4 transition-all ${
              selected === font.value
                ? 'border-rose-400 bg-rose-50'
                : 'border-gray-100 bg-white hover:border-rose-200'
            }`}
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {font.label}
            </p>
            <p
              className="text-xl text-gray-700 leading-snug"
              style={{ fontFamily: font.family }}
            >
              {preview.length > 60 ? preview.slice(0, 60) + '…' : preview}
            </p>
          </button>
        ))}
      </div>

      {/* Load Google Fonts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Caveat&family=Dancing+Script&family=Reenie+Beanie&family=Patrick+Hand&display=swap"
      />

      <button
        onClick={() => onNext({ fontChoice: selected })}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3 transition-colors"
      >
        Next
      </button>
    </div>
  )
}

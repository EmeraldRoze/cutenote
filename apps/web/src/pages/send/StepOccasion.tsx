import type { NoteData } from './SendFlow'

const OCCASIONS = [
  { value: 'BIRTHDAY', emoji: '🎂', label: 'Birthday' },
  { value: 'ANNIVERSARY', emoji: '💑', label: 'Anniversary' },
  { value: 'CONGRATULATIONS', emoji: '🎉', label: 'Congrats' },
  { value: 'HOLIDAY', emoji: '✨', label: 'Holiday' },
  { value: 'CONSOLATION', emoji: '🤗', label: 'Thinking of you' },
  { value: 'JUST_BECAUSE', emoji: '💌', label: 'Just because' },
  { value: 'INVITATION', emoji: '📬', label: 'Invitation' },
  { value: 'CUSTOM', emoji: '✏️', label: 'Something else' },
]

export default function StepOccasion({
  onNext,
  onBack: _onBack,
}: {
  onNext: (data: Partial<NoteData>) => void
  onBack: () => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">What's the occasion?</h2>
      <p className="text-sm text-gray-500 mb-6">Pick one — we'll help you nail the tone.</p>

      <div className="grid grid-cols-2 gap-3">
        {OCCASIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => onNext({ occasionType: o.value })}
            className="bg-white hover:bg-rose-50 border border-gray-100 hover:border-rose-200 rounded-2xl p-5 text-left transition-all"
          >
            <span className="text-3xl block mb-2">{o.emoji}</span>
            <span className="text-sm font-medium text-gray-700">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

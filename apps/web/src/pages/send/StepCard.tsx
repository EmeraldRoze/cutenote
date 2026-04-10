import { useRef } from 'react'
import type { NoteData } from './SendFlow'

// Placeholder artist designs — will be replaced with real DB data in Phase 5
const ARTIST_DESIGNS = [
  { id: 'design-1', artist: 'Luna Park', title: 'Bloom', color: 'from-pink-200 to-rose-300', emoji: '🌸' },
  { id: 'design-2', artist: 'Doodle Co.', title: 'Confetti', color: 'from-yellow-200 to-orange-300', emoji: '🎊' },
  { id: 'design-3', artist: 'Inkwell', title: 'Stargazer', color: 'from-indigo-200 to-purple-300', emoji: '🌟' },
]

export default function StepCard({
  onNext,
  onBack: _onBack,
}: {
  onNext: (data: Partial<NoteData>) => void
  onBack: () => void
}) {
  // onBack handled by SendFlow header arrow
  const fileRef = useRef<HTMLInputElement>(null)

  function selectArtist(design: typeof ARTIST_DESIGNS[0]) {
    onNext({ cardDesignType: 'ARTIST', cardDesignId: design.id })
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onNext({ cardDesignType: 'USER_UPLOAD', cardImageUrl: url })
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Pick your card</h2>
      <p className="text-sm text-gray-500 mb-6">Choose an artist design or use your own photo.</p>

      {/* Artist designs */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Artist Picks</p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {ARTIST_DESIGNS.map((d) => (
          <button
            key={d.id}
            onClick={() => selectArtist(d)}
            className="aspect-[3/4] rounded-2xl overflow-hidden relative group"
          >
            <div className={`w-full h-full bg-gradient-to-br ${d.color} flex flex-col items-center justify-center`}>
              <span className="text-4xl">{d.emoji}</span>
              <span className="text-xs font-medium text-white/80 mt-2">{d.title}</span>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl" />
          </button>
        ))}
      </div>

      {/* Upload own photo */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Or use your photo</p>
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-200 hover:border-rose-300 rounded-2xl py-8 flex flex-col items-center gap-2 transition-colors"
      >
        <span className="text-3xl">📷</span>
        <span className="text-sm text-gray-500">Tap to upload a photo</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  )
}

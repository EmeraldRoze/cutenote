import { useState } from 'react'
import { api } from '../../lib/api'
import type { NoteData } from './SendFlow'

interface User {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
}

export default function StepRecipient({ onNext }: { onNext: (data: Partial<NoteData>) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [selected, setSelected] = useState<User | null>(null)
  const [searching, setSearching] = useState(false)

  async function search(q: string) {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const res = await api.get(`/users?q=${encodeURIComponent(q)}`)
      setResults(res.data.data)
    } finally {
      setSearching(false)
    }
  }

  function select(user: User) {
    setSelected(user)
    setResults([])
    setQuery(user.displayName)
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Who's getting the love?</h2>
      <p className="text-sm text-gray-500 mb-6">Search for someone on CuteNote.</p>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setSelected(null); search(e.target.value) }}
          placeholder="Search by name or username..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
        {searching && (
          <p className="absolute right-4 top-3 text-xs text-gray-400">Searching...</p>
        )}

        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg mt-1 z-10 overflow-hidden">
            {results.map((user) => (
              <button
                key={user.id}
                onClick={() => select(user)}
                className="w-full px-4 py-3 text-left hover:bg-rose-50 flex items-center gap-3 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm flex-shrink-0">
                  {user.displayName[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user.displayName}</p>
                  <p className="text-xs text-gray-400">@{user.username}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="mt-4 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center text-rose-600 font-bold">
            {selected.displayName[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800">{selected.displayName}</p>
            <p className="text-xs text-gray-500">@{selected.username}</p>
          </div>
          <span className="ml-auto text-rose-400 text-lg">✓</span>
        </div>
      )}

      <button
        disabled={!selected}
        onClick={() => selected && onNext({ recipientId: selected.id, recipientName: selected.displayName })}
        className="w-full mt-6 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-colors"
      >
        Next
      </button>
    </div>
  )
}

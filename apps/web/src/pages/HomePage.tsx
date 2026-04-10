import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-rose-500">CuteNote</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">@{user?.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm">Welcome back,</p>
          <h2 className="text-2xl font-bold text-gray-800">{user?.displayName}</h2>
        </div>

        {/* Send CTA */}
        <button
          onClick={() => navigate('/send')}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-2xl py-5 text-lg transition-colors shadow-sm mb-6"
        >
          Send a Cute Note
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-rose-500">{user?.points ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Points</p>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-rose-500">{user?.currentStreak ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Month streak</p>
          </div>
        </div>

        {/* Feed placeholder */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Recent Cuteness</h3>
          <p className="text-sm text-gray-400 text-center py-4">
            Your people are out there. Invite someone you love.
          </p>
        </div>
      </div>
    </div>
  )
}

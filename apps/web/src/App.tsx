import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import LandingPage from './pages/LandingPage'
import SendFlow from './pages/send/SendFlow'
import ConnectionsPage from './pages/ConnectionsPage'
import AddressPage from './pages/AddressPage'
import SubscribePage from './pages/SubscribePage'
import SubscribeSuccessPage from './pages/SubscribeSuccessPage'
import AdminPage from './pages/AdminPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import GoogleAuthSuccessPage from './pages/GoogleAuthSuccessPage'
import ProfilePage from './pages/ProfilePage'
import InvitePage from './pages/InvitePage'
import CollectAddressPage from './pages/CollectAddressPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <p className="text-rose-400 text-sm">Loading...</p>
    </div>
  )
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/home" replace /> : <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/google/success" element={<GoogleAuthSuccessPage />} />
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/send" element={<ProtectedRoute><SendFlow /></ProtectedRoute>} />
      <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
      <Route path="/address" element={<ProtectedRoute><AddressPage /></ProtectedRoute>} />
      <Route path="/subscribe" element={<ProtectedRoute><SubscribePage /></ProtectedRoute>} />
      <Route path="/subscribe/success" element={<ProtectedRoute><SubscribeSuccessPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="/invite" element={<ProtectedRoute><InvitePage /></ProtectedRoute>} />
      <Route path="/collect-address/:token" element={<CollectAddressPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

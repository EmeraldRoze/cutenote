import { SignInWithApple } from '@capacitor-community/apple-sign-in'
import { Browser } from '@capacitor/browser'
import { api } from './api'

// Runs Apple's native sign-in sheet, then trades Apple's proof for a QuteNote login
export async function appleSignIn() {
  const { response } = await SignInWithApple.authorize({
    clientId: 'club.cutenote.app',
    redirectURI: 'https://qutenote.com',
    scopes: 'email name',
  })
  const fullName = [response.givenName, response.familyName].filter(Boolean).join(' ')
  const res = await api.post('/auth/apple', {
    identityToken: response.identityToken,
    fullName,
  })
  return res.data.data as { token: string; user: any }
}

// Google blocks sign-in inside embedded app views, so we open the system browser.
// The server hands the login back to the app via the qutenote:// link.
export async function openGoogleSignIn() {
  const base = import.meta.env.VITE_API_BASE ?? '/api'
  await Browser.open({ url: `${base}/auth/google?native=1` })
}

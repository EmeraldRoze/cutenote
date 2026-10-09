import { api } from './api'

// Creates an invite link and opens the phone's Messages composer with it,
// so the sender picks the contact themselves — no typing numbers into QuteNote.
export async function inviteByText(_firstName?: string) {
  const r = await api.post('/invites', {})
  const link: string = r.data.data.link
  const body = `I saved you a free postcard on QuteNote. Send one to someone you love. ${link}`
  window.location.href = `sms:?&body=${encodeURIComponent(body)}`
  return link
}

import { PushNotifications } from '@capacitor/push-notifications'
import { api } from './api'
import { isNativeApp } from './native'

// Ask iOS for notification permission and register this phone for reminders.
export async function enableReminders(): Promise<boolean> {
  localStorage.setItem('qn_reminders', '1')
  if (!isNativeApp) return false
  try {
    const perm = await PushNotifications.requestPermissions()
    if (perm.receive !== 'granted') return false
    return await new Promise<boolean>((resolve) => {
      PushNotifications.addListener('registration', async (t) => {
        try {
          await api.post('/devices', { token: t.value, platform: 'ios' })
          localStorage.setItem('qn_push', '1')
          resolve(true)
        } catch {
          resolve(false)
        }
      })
      PushNotifications.addListener('registrationError', () => resolve(false))
      PushNotifications.register()
      setTimeout(() => resolve(false), 10000)
    })
  } catch {
    return false
  }
}

export function remindersEnabled(): boolean {
  return localStorage.getItem('qn_push') === '1'
}

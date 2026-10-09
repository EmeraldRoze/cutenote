import { PushNotifications } from '@capacitor/push-notifications'
import { api } from './api'
import { isNativeApp } from './native'

export type ReminderResult = 'on' | 'denied' | 'failed'

// Ask iOS for notification permission and register this phone for reminders.
export async function enableReminders(): Promise<ReminderResult> {
  localStorage.setItem('qn_reminders', '1')
  if (!isNativeApp) return 'failed'
  try {
    const perm = await PushNotifications.requestPermissions()
    if (perm.receive !== 'granted') return 'denied'
    return await new Promise<ReminderResult>((resolve) => {
      PushNotifications.addListener('registration', async (t) => {
        try {
          await api.post('/devices', { token: t.value, platform: 'ios' })
          localStorage.setItem('qn_push', '1')
          resolve('on')
        } catch {
          resolve('failed')
        }
      })
      PushNotifications.addListener('registrationError', () => resolve('failed'))
      PushNotifications.register()
      setTimeout(() => resolve('failed'), 10000)
    })
  } catch {
    return 'failed'
  }
}

export function remindersEnabled(): boolean {
  return localStorage.getItem('qn_push') === '1'
}

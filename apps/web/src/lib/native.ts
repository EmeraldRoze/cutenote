import { Capacitor } from '@capacitor/core'

// True when running inside the iOS/Android app shell, false in a web browser
export const isNativeApp = Capacitor.isNativePlatform()

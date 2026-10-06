import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'club.cutenote.app',
  appName: 'QuteNote',
  webDir: 'dist',
  backgroundColor: '#FBF8F4',
  ios: {
    contentInset: 'never',
  },
}

export default config

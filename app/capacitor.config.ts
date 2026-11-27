import type { CapacitorConfig } from '@capacitor/cli';

// Empaqueta la build web (dist) como APK Android.
const config: CapacitorConfig = {
  appId: 'bo.pescadoquecuida.app',
  appName: 'Pescado que cuida',
  webDir: 'dist',
};

export default config;

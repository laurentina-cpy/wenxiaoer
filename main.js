import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  // 持久化插件，保存状态到本地存储
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
  return {
    app,
    pinia
  }
}
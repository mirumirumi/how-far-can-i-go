import axios from 'axios'
import App from './App.vue'
import router from './router'
import VueAxios from 'vue-axios'
import Toaster from "@/components/modules/vue-toaster"
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { messages } from "@/utils/i18n"
import { key, store } from './store/index'

const i18n = createI18n({
  legacy: false,  // for Composition API
  locale: "ja",
  fallbackLocale: "en",
  messages,
})

const app = createApp(App)
  .use(i18n)
  .use(router)
  .use(store, key)
  .use(VueAxios, axios)

app.use(Toaster, {
  position: "top-right",
  duration: false,
}).provide('toast', app.config.globalProperties.$toast)

app.mount('#app')

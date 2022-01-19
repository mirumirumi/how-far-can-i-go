import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { key, store } from './store/index'
import axios from 'axios'
import VueAxios from 'vue-axios'
import { createI18n } from 'vue-i18n'
import { messages } from "@/utils/i18n"
import Toaster from "@/components/modules/vue-toaster"

const i18n = createI18n({
  legacy: false,  // for Composition API
  locale: "ja",
  fallbackLocale: "en",
  messages,
})

const app = createApp(App)
  .use(store, key)
  .use(router)
  .use(i18n)
  .use(VueAxios, axios)

app.use(Toaster, {
  position: "top-right",
  duration: 5555,
}).provide('toast', app.config.globalProperties.$toast)
app.mount('#app')

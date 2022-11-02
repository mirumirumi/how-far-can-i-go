import axios from "axios"
import App from "./App.vue"
import router from "./router"
import VueAxios from "vue-axios"
import { createApp } from "vue"
import { createI18n } from "vue-i18n"
import { messages } from "@/utils/i18n"
import { key, store } from "./store/index"
import Toast, { PluginOptions, POSITION } from "vue-toastification"
import "vue-toastification/dist/index.css"
import "@/scss/toast.css"

const toastOptions: PluginOptions = {
  closeButton: "button",
  closeOnClick: false,
  draggable: false,
  draggablePercent: 0.6,
  hideProgressBar: true,
  icon: false,
  maxToasts: 7,
  newestOnTop: true,
  pauseOnFocusLoss: false,
  pauseOnHover: true,
  position: POSITION.BOTTOM_LEFT,
  rtl: false,
  showCloseButtonOnHover: true,
  timeout: 4444,
  transition: "original_fade",
}

const i18n = createI18n({
  legacy: false,  // for Composition API
  locale: "ja",
  fallbackLocale: "en",
  messages,
})

createApp(App)
  .use(i18n)
  .use(router)
  .use(store, key)
  .use(VueAxios, axios)
  .use(Toast, toastOptions)
  .mount("#app")

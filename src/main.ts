import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { key, store } from './store/index'
import Toaster from "@/components/modules/vue-toaster"

const app = createApp(App)
  .use(store, key)
  .use(router)

app.use(Toaster, {
  position: "top-left",
  duration: 3333,
}).provide('toast', app.config.globalProperties.$toast)
app.mount('#app')

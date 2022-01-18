import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { key, store } from './store/index'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Toaster from "@/components/modules/vue-toaster"

const app = createApp(App)
  .use(store, key)
  .use(router)
  .use(VueAxios, axios)

app.use(Toaster, {
  position: "top-right",
  duration: 5555,
}).provide('toast', app.config.globalProperties.$toast)
app.mount('#app')

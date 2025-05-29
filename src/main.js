import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

const app = createApp(App)
app.use(router)
app.use(store)
app.config.globalProperties.$axios = axios // Hacer Axios accesible en todos los componentes
app.mount('#app')

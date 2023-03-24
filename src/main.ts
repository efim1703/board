import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/scss/base.scss'
import '@/assets/scss/global.scss'

createApp(App).use(router).mount('#app')

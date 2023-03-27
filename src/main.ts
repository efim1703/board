import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Notifications from '@kyvg/vue3-notification'
import '@/assets/scss/base.scss'
import '@/assets/scss/global.scss'


createApp(App).use(router).use(Notifications).mount('#app')

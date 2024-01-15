import './assets/base.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { auth } from './includes/firebase'

import App from './App.vue'
import router from './router'

import VeeValidatePlugin from './includes/validation'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

let app
auth.onAuthStateChanged(() => {
  if (!app) {
    app = createApp(App)

    app.use(createPinia())
    app.use(router)
    app.use(VeeValidatePlugin)
    app.component('font-awesome-icon', FontAwesomeIcon)

    app.mount('#app')
  }
})

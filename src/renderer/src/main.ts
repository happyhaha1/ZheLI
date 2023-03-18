// import devtools from '@vue/devtools'
import { createApp } from 'vue'
import App from './App.vue'
import naive from 'naive-ui'

createApp(App).use(naive).mount('#app')

// if (import.meta.env.DEV) devtools.connect('10.10.10.3', 8098)

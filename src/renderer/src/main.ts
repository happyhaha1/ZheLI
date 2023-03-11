import devtools from '@vue/devtools'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

if (import.meta.env.DEV) devtools.connect('10.10.10.3', 8098)

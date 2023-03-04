import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import piniaStore from './store'
import App from './App.vue'

createApp(App)
  .use(ElementPlus)
  .use(piniaStore)
  .mount('#app')

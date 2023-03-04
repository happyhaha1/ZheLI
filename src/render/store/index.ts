import { createPinia } from 'pinia'
import { PiniaLoading } from 'pinia-plugin-loading'

import { useUserStore } from './modules/user'

const pinia = createPinia()
pinia.use(PiniaLoading)
// pinia.use(piniaPluginPersistedstate);

export { useUserStore }
export default pinia

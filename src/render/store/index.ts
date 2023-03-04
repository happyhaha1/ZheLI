import { createPinia } from 'pinia'
import { PiniaLoading } from 'pinia-plugin-loading'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { useUserStore } from './modules/user'
import { useCoursesStore } from './modules/courses'
import { useAppStore } from './modules/app'

const pinia = createPinia()
pinia.use(PiniaLoading)
pinia.use(piniaPluginPersistedstate)

export { useUserStore, useCoursesStore, useAppStore }
export default pinia

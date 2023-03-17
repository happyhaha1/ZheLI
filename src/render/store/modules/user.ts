import { defineStore } from 'pinia'
import { ipcInstance } from '@render/plugins/ipc'
import { useCoursesStore } from './courses'
export const useUserStore = defineStore('user', {
    state: (): User => {
        return {
            name: null,
            company: null,
            avatarUrl: null,
            integral: null,
        }
    },
    getters: {
        isLoggedIn: state => state.name != null,
    },
    actions: {
        setInfo(partial: Partial<User>) {
            this.$patch(partial)
        },
        resetInfo() {
            this.$reset()
        },
        async info() {
            const coursesStore = useCoursesStore()
            await new Promise(resolve => setTimeout(resolve, 1000))
            const { data } = await ipcInstance.send<User>('get_user_info')
            this.$patch(data)
            coursesStore.get_courses()
        },
        async logout() {
            await ipcInstance.send('logout')
            this.resetInfo()
        },
        async syncInfo() {
            const { data } = await ipcInstance.send('sync_info')
            this.$patch(data)
        },
    },
})

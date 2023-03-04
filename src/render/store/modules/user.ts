import { defineStore } from 'pinia'
import { ipcInstance } from '@render/plugins/ipc'

export const useUserStore = defineStore('user', {
  state: (): User => {
    return {
      name: null,
      company: null,
      avatarUrl: null,
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
      await new Promise(resolve => setTimeout(resolve, 1000))
      const { data } = await ipcInstance.send<User>('get_user_info')
      this.setInfo(data)
    },
    async logout() {
      await ipcInstance.send('logout')
      this.resetInfo()
      // 路由表重置
    },
  },
})

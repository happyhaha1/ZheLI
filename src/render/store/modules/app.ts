import { defineStore } from 'pinia'
import { ipcInstance } from '@render/plugins/ipc'

export const useAppStore = defineStore('app', {
    state: () => {
        return {
            show: false,
        }
    },
    getters: {
    },
    actions: {
        async chageShow() {
            await ipcInstance.send('change_show', this.show)
        },
    },
    persist: true,
})

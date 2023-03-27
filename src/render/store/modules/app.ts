import { defineStore } from 'pinia'
import { ipcInstance } from '@render/plugins/ipc'

export const useAppStore = defineStore('app', {
    state: () => {
        return {
            show: false,
            rate: 1,
        }
    },
    getters: {
    },
    actions: {
        async chageShow() {
            await ipcInstance.send('change_show', this.show)
        },
        async chageRate() {
            await ipcInstance.send('change_rate', this.rate)
        },
    },
    persist: true,
})

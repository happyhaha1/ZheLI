import { ipcInstance } from '@render/plugins'
import { defineStore } from 'pinia'

export const useCoursesStore = defineStore('courses', {
    state: () => {
        return {
            cousers: null,
            meta: {
                pageNo: 1,
                pageSize: 20,
                total: 1820,
            },
            selectionCouers: [],
            isSync: false,
            syncProgress: 0,
            currentVideo: null,
            allProgress: 0,
            isStudy: false,
        }
    },
    getters: {
    },
    actions: {
        async get_courses() {
            // await new Promise(resolve => setTimeout(resolve, 1000))
            const { data } = await ipcInstance.send<{ courses: Course[]; count: number }>('get_courses', this.meta.pageNo, this.meta.pageSize)
            this.$patch({
                cousers: data.courses,
                meta: {
                    total: data.count,
                },
            })
        },
        async sync_coures() {
            this.isSync = true
            const { data } = await ipcInstance.send<number>('sync_courses')
            this.syncProgress = Math.floor((1 / data) * 100)
            this.get_courses()
        },
        async study() {
            const { data } = await ipcInstance.send<number>('study')
        },
    },
})

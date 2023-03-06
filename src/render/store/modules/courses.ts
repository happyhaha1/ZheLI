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
    },
})

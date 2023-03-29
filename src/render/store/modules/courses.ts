import { ipcInstance } from '@render/plugins'
import { defineStore } from 'pinia'
import { useAppStore } from './app'

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
            dialogVisible: false,
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
            const app = useAppStore()
            await ipcInstance.send<string>('study', JSON.stringify(this.selectionCouers), app.show, app.rate)
        },
        async receive(course: Course, percentage: number) {
            if (percentage === 100) {
                this.isStudy = false
                this.get_courses()
            } else {
                this.$patch({
                    currentVideo: course.currentVideo,
                    allProgress: percentage,
                })
            }
        },
        async cancel() {
            ipcInstance.send('cancel')
        },
        async empty() {
            this.$patch ({
                currentVideo: null,
                allProgress: 0,
                isStudy: false,
                dialogVisible: false,
            })
            this.get_courses()
        },
    },
})

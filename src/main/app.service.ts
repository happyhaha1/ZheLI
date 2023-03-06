import { BrowserWindow } from 'electron'
import { Injectable, Window } from 'einf'
import { ZheXue } from './Study'
import { OrmService } from './db/OrmService'
import { CourseModel } from './db/models/CourseModel'

@Injectable()
export class AppService {
    private stu: ZheXue
    private orm: OrmService
    constructor(@Window() private win: BrowserWindow) {
        this.stu = new ZheXue(win)
        this.orm = OrmService.getInstance()
    }

    public async login(): Promise<IpcResponse<String>> {
        try {
            await this.stu.login()
            return { data: '登录成功' }
        } catch (error) {
            return { error }
        }
    }

    public async get_user_info(isSync: boolean): Promise<IpcResponse<User>> {
        try {
            if (isSync) {
                const userInfo = await this.stu.getUserInfoByBrowser()
                return { data: userInfo }
            } else {
                const userInfo = await this.stu.getUserInfoByFile()
                return { data: userInfo }
            }
        } catch (error) {
            return { error }
        }
    }

    public async get_courses(page: number, pagesize: number): Promise<IpcResponse<{ courses: Course[]; count: number }>> {
        try {
            const res = await this.orm.findCourse(page, pagesize)
            const courses = res.couseModels.map(coures => coures.toCourse())
            return { data: { courses, count: res.count } }
        } catch (error) {
            return { error }
        }
    }

    public async syncCoures(): Promise<IpcResponse<number>> {
        const pageconut = await this.stu.getCourseCount()
        const allCourse = await this.orm.findAndDelCourseAll()
        // console.log(pageconut)
        const courses = await this.stu.getCourses(1)
        const courseModels = courses.map(course => convertCourseToCourseModel(course, allCourse))
        this.orm.saveList(courseModels)
        this.syncCouresPage(pageconut, allCourse)
        return { data: pageconut }
    }

    public async syncCouresPage(pagecount: number, models: CourseModel[]) {
        for (let index = 2; index <= pagecount; index++) {
            const courses = await this.stu.getCourses(index)
            const courseModels = courses.map(course => convertCourseToCourseModel(course, models))
            this.orm.saveList(courseModels)
            // console.log()
            this.win.webContents.send('sync_current', index, pagecount)
        }
    }

    public async change_show(show: boolean): Promise<IpcResponse<string>> {
        try {
            await this.stu.chageShow(show)
            return { data: '切换成功' }
        } catch (error) {
            return { error }
        }
    }

    public async logout(): Promise<IpcResponse<string>> {
        try {
            await this.stu.logout()
            return { data: '退出登录成功' }
        } catch (error) {
            return { error }
        }
    }
}

function convertCourseToCourseModel(course: Course, models: CourseModel[]): CourseModel {
    const courseModel = new CourseModel()
    courseModel.userId = 1
    courseModel.name = course.name
    courseModel.url = course.url
    courseModel.imgUrl = course.imgUrl
    const courseWithUrl = models.find(v => v.url === course.url)
    if (courseWithUrl)
        course.progress = courseWithUrl.progress
    courseModel.progress = course.progress || 0
    courseModel.videoNum = course.videoNum
    return courseModel
}

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

    public async get_user_info(): Promise<IpcResponse<User>> {
        try {
            const userInfo = await this.stu.getUserInfoByFile()
            return { data: userInfo }
        } catch (error) {
            return { error }
        }
    }

    public async get_courses(page: number): Promise<IpcResponse<Course[]>> {
        try {
            const couresModels = await this.orm.findCourse(page)
            if (couresModels && couresModels.length > 0) {
                const courses = couresModels.map(coures => coures.toCourse())
                return { data: courses }
            } else {
                const courses = await this.stu.getCourses(page)
                const courseModels = courses.map(course => convertCourseToCourseModel(course))
                this.orm.saveList(courseModels)
                return { data: courses }
            }
        } catch (error) {
            return { error }
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

function convertCourseToCourseModel(course: Course): CourseModel {
    const courseModel = new CourseModel()
    courseModel.userId = 1
    courseModel.name = course.name
    courseModel.url = course.url
    courseModel.imgUrl = course.imgUrl
    courseModel.progress = course.progress || 0
    courseModel.videoNum = course.videoNum
    return courseModel
}

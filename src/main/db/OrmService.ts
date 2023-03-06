import { DataSource } from 'typeorm'
import { CourseModel } from './models/CourseModel'
import { DataBase } from './database'

export class OrmService {
    static instance: OrmService
    private dataSource: DataSource

    static getInstance() {
        if (!this.instance)
            this.instance = new OrmService()

        return this.instance
    }

    constructor() {
        // 创建数据库
        this.dataSource = new DataBase('zheli').dataSource
    }

    // 实现新增方法
    async saveList(courseModels: CourseModel[]) {
        await this.dataSource.initialize()
        const res = await this.dataSource.manager.save(courseModels)
        await this.dataSource.destroy()
        return res
    }

    async findCourse(page: number, pagesize = 20) {
        await this.dataSource.initialize()
        const skip = pagesize * (page - 1)
        const take = pagesize

        const [couseModels, count] = await this.dataSource.getRepository(CourseModel)
            .createQueryBuilder('course')
            .skip(skip)
            .take(take)
            .getManyAndCount()

        await this.dataSource.destroy()
        return { couseModels, count }
    }

    async findAndDelCourseAll(): Promise<CourseModel[]> {
        await this.dataSource.initialize()

        const repository = await this.dataSource.getRepository(CourseModel)
        const courses = await repository.find()
        await repository.remove(courses)

        await this.dataSource.destroy()
        return courses
    }
}

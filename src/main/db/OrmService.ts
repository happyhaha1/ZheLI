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

  async findCourse(page: number) {
    await this.dataSource.initialize()
    const skip = 20 * (page - 1)
    const take = 20

    const couseModels = await this.dataSource.getRepository(CourseModel)
      .createQueryBuilder('course')
      .skip(skip)
      .take(take)
      .getMany()

    await this.dataSource.destroy()
    return couseModels
  }
}

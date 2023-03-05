import path from 'path'
import { DataSource } from 'typeorm'
import { app } from 'electron'
import { BetterSqlite3ConnectionOptions } from 'typeorm/driver/better-sqlite3/BetterSqlite3ConnectionOptions'
import { UserModel } from './models/UserModel'
import { CourseModel } from './models/CourseModel'
import { VideoModel } from './models/VideoModel'

export class DataBase {
    dataSource: DataSource

    // 初始化数据库文件
    constructor(database: string) {
        const basePath = path.join(
            app.getPath('appData'),
            app.getName(),
            `./data/${database}.db`,
        )
        const options: BetterSqlite3ConnectionOptions = {
            type: 'better-sqlite3',
            entities: [CourseModel, VideoModel, UserModel],
            database: basePath,
            synchronize: true,
        }
        this.dataSource = new DataSource(options)
    }
}

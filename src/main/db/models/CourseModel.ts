import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { VideoModel } from './VideoModel'

@Entity()
export class CourseModel {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number | undefined

  @Column({ type: 'int', nullable: false })
  userId: number | undefined

  @Column({ type: 'text', nullable: false })
  name: string | undefined

  @Column({ type: 'text', nullable: false })
  url: string | undefined

  @Column({ type: 'text', nullable: false })
  imgUrl: string | undefined

  @Column({ type: 'int8', nullable: false })
  progress: number | undefined

  @Column({ type: 'int8', nullable: false })
  videoNum: number | undefined

  @OneToMany(() => VideoModel, videomodel => videomodel.courseId)
  videos: Promise<VideoModel[]>

  // 将当前CourseModel对象转换为Course对象
  toCourse(): Course {
    return {
      name: this.name,
      url: this.url,
      imgUrl: this.imgUrl,
      progress: this.progress,
      videoNum: this.videoNum,
      frist: true,
    }
  }
}

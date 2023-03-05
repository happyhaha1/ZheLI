import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class VideoModel {
    @PrimaryGeneratedColumn({ type: 'int' })
        id: number | undefined

    @Column({ type: 'int', nullable: false })
        courseId: number | undefined

    @Column({ type: 'int8', nullable: false })
        index: number | undefined

    @Column({ type: 'text', nullable: false })
        name: string | undefined

    @Column({ type: 'int', nullable: false })
        ntime: number | undefined

    @Column({ type: 'int', nullable: false })
        dtime: number | undefined

    @Column({ type: 'int8', nullable: false })
        progress: number | undefined
}

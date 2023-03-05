import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class UserModel {
  @PrimaryColumn({ type: 'int' })
  id: number | undefined

  @Column({ type: 'text', nullable: false })
  name: number | undefined

  @Column({ type: 'text', nullable: false })
  company: number | undefined

  @Column({ type: 'text', nullable: false })
  avatarUrl: string | undefined

  @Column({ type: 'text', nullable: false })
  cookie: string | undefined
}

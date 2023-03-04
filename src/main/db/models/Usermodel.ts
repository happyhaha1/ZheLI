import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class UserModel {
  @PrimaryColumn({ type: 'int' })
  id: number | undefined

  @Column({ type: 'int8', nullable: false })
  userName: number | undefined

  @Column({ type: 'text', nullable: false })
  content: string | undefined

  @Column({ type: 'text', nullable: false })
  cookie: string | undefined
}

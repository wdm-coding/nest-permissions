import { Users } from '../users/users.entity'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'

@Entity()
export class Logs {
  @PrimaryColumn()
  id: number // 主键id字段
  @Column({ type: 'varchar', length: 255 })
  path: string // 日志路径字段
  @Column({ type: 'varchar', length: 255 })
  method: string // 日志方法字段
  @Column({ type: 'varchar', length: 255 })
  data: string // 日志数据字段
  @Column({ type: 'varchar', length: 255 })
  result: string // 日志结果字段
  @ManyToOne(() => Users, users => users.logs) // 关系装饰器，告诉 TypeORM 这个属性是一对多关系。
  @JoinColumn({ name: 'user_id' }) // 关联列装饰器，告诉 TypeORM 这个属性是外键字段。
  users: Users
}

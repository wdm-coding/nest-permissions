import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Roles } from '../roles/roles.entity'

@Entity()
export class Menus {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  name: string
  @Column()
  path: string
  @Column({ nullable: true })
  icon: string
  @Column()
  order: number
  @Column()
  acl: string
  @Column({ unique: true })
  path_key: string
  @Column({ nullable: true })
  description: string
  // 多对多关系，一个菜单可以属于多个角色，一个角色可以拥有多个菜单。
  @ManyToMany(() => Roles, roles => roles.menus)
  @JoinTable({ name: 'role_menu' })
  roles: Roles[]
}

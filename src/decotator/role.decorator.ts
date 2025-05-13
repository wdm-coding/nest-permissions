import { SetMetadata } from '@nestjs/common'
import { Role } from '../enum/role.enum'
// 自定义装饰器，用于标记角色权限
export const ROLES_KEY = 'roles'
// SetMetadata：NestJS 提供的用于设置元数据的装饰器工厂。
export const Roles = (...roles: Role[]) => {
  // 接受可变数量的 Role 参数，返回 SetMetadata 设置的元数据。
  // 实际使用中，@Roles(Role.Admin) 会将该路由的所需角色存储到元数据。
  return SetMetadata(ROLES_KEY, roles)
}

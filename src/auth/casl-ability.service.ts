import { ForbiddenException, Injectable } from '@nestjs/common'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import { UserService } from '../user/user.service'
import getEntities from '../utils/getEntities'
@Injectable()
export class CaslAbilityService {
  constructor(private userService: UserService) {}
  async forRoot(username: string) {
    const { can, build } = new AbilityBuilder(createMongoAbility) // CASL 提供的工具，用于构建 Ability 对象。
    const user = await this.userService.findOneByName(username)
    if (!user) throw new ForbiddenException('用户不存在')
    user.roles.forEach(role => {
      role.menus.forEach(menu => {
        menu.acl.split(',').forEach(action => {
          can(action, getEntities(menu.path))
        })
      })
    })
    const ability = build({
      // 生成 Ability 对象 表示用户的权限 并传入配置对象，其中 detectSubjectType 是一个函数，用于确定主体类型。
      detectSubjectType: item => item.constructor.name
    })
    // 在守卫中使用 ability 对象来检查权限等操作。例如，在守卫中可以使用 can 方法来判断用户是否有执行某个操作的权限。
    return ability
  }
}

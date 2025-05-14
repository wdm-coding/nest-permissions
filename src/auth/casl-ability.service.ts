import { ForbiddenException, Injectable } from '@nestjs/common'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import { UserService } from '../user/user.service'
import getEntities from '../utils/getEntities'
@Injectable()
export class CaslAbilityService {
  constructor(private userService: UserService) {}
  async forRoot(username: string) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)
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
      detectSubjectType: item => item.constructor.name
    })
    return ability
  }
}

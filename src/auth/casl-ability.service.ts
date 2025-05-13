import { Injectable } from '@nestjs/common'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
@Injectable()
export class CaslAbilityService {
  constructor() {}
  forRoot() {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)
    const ability = build({
      detectSubjectType: item => item.constructor.name
    })
    ability.can('manage', 'all')
    return ability
  }
}

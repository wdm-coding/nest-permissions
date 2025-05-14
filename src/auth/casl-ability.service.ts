import { Injectable } from '@nestjs/common'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import { Logs } from '../entities/logs/logs.entity'
@Injectable()
export class CaslAbilityService {
  constructor() {}
  forRoot() {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)
    const ability = build({
      detectSubjectType: item => item.constructor.name
    })
    ability.can('read', Logs)
    ability.cannot('update', Logs)
    return ability
  }
}

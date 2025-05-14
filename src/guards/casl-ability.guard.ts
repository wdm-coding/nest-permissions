import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { CaslAbilityService } from '../auth/casl-ability.service'
import { CHECK_POLICIES_KEY } from '../decotator/casl.decorator'

@Injectable()
export class CaslAbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityService: CaslAbilityService
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // 获取当前用户的能力
    const handlers = this.reflector.getAllAndMerge<any[]>(CHECK_POLICIES_KEY.HANDLER, [
      context.getHandler(),
      context.getClass()
    ])
    const canhandlers = this.reflector.getAllAndMerge<any[]>(CHECK_POLICIES_KEY.CAN, [
      context.getHandler(),
      context.getClass()
    ])
    const cannothandlers = this.reflector.getAllAndMerge<any[]>(CHECK_POLICIES_KEY.CANNOT, [
      context.getHandler(),
      context.getClass()
    ])

    const ability = this.caslAbilityService.forRoot()
    let flag = true
    if (handlers) {
      flag = flag && handlers.every(handler => handler(ability))
    }
    if (canhandlers) {
      flag = flag && canhandlers.every(handler => handler(ability))
    }
    if (cannothandlers) {
      flag = flag && cannothandlers.some(handler => !handler(ability))
    }
    return flag
  }
}

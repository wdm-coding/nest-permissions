import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CaslAbilityService } from '../auth/casl-ability.service'
import { CaslHandlerType, CHECK_POLICIES_KEY, PolicyHandlerCallback } from '../decotator/casl.decorator'

@Injectable()
export class CaslAbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityService: CaslAbilityService
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    console.log('CaslAbilityGuard')
    // 获取当前用户的能力
    const handlers = this.reflector.getAllAndMerge<PolicyHandlerCallback[]>(CHECK_POLICIES_KEY.HANDLER, [
      context.getHandler(),
      context.getClass()
    ])
    const canhandlers = this.reflector.getAllAndMerge<any[]>(CHECK_POLICIES_KEY.CAN, [
      context.getHandler(),
      context.getClass()
    ]) as CaslHandlerType
    const cannothandlers = this.reflector.getAllAndMerge<any[]>(CHECK_POLICIES_KEY.CANNOT, [
      context.getHandler(),
      context.getClass()
    ]) as CaslHandlerType
    if (!handlers && !canhandlers && !cannothandlers) return true
    const ability = this.caslAbilityService.forRoot()
    let flag = true
    if (handlers) {
      flag = flag && handlers.every(handler => handler(ability))
    }
    if (flag && canhandlers) {
      flag = flag && canhandlers.every(handler => handler(ability))
    }
    if (flag && cannothandlers) {
      flag = flag && cannothandlers.some(handler => !handler(ability))
    }
    return flag
  }
}

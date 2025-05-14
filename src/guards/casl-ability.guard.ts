import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CaslHandlerType, CHECK_POLICIES_KEY, PolicyHandlerCallback } from '../decotator/casl.decorator'
import { CaslAbilityService } from 'src/auth/casl-ability.service'

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private reflector: Reflector, // 用于获取装饰器上的数据
    private caslAbilityService: CaslAbilityService // 用于获取当前用户的权限
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // handlers‌：读取 CHECK_POLICIES_KEY.HANDLER 对应的自定义权限检查逻辑
    const handlers = this.reflector.getAllAndMerge<PolicyHandlerCallback[]>(CHECK_POLICIES_KEY.HANDLER, [
      context.getHandler(),
      context.getClass()
    ])
    // canHandlers：读取 CHECK_POLICIES_KEY.CAN 对应的权限检查逻辑
    const canHandlers = this.reflector.getAllAndMerge<any[]>(CHECK_POLICIES_KEY.CAN, [
      context.getHandler(),
      context.getClass()
    ]) as CaslHandlerType
    // cannotHandlers：读取 CHECK_POLICIES_KEY.CANNOT 对应的权限检查逻辑
    const cannotHandlers = this.reflector.getAllAndMerge<any[]>(CHECK_POLICIES_KEY.CANNOT, [
      context.getHandler(),
      context.getClass()
    ]) as CaslHandlerType
    // 判断，如果用户未设置上述的任何权限，那么就直接返回true
    if (handlers.length === 0 && canHandlers.length === 0 && cannotHandlers.length === 0) return true
    const req = context.switchToHttp().getRequest()
    if (!req.user) throw new ForbiddenException('用户不存在')
    // 获取当前用户的权限 调用 CaslAbilityService 的 forRoot 方法，根据用户的用户名生成一个 Ability 对象，表示用户的权限。
    const ability = await this.caslAbilityService.forRoot(req.user.username)
    let flag = true
    // 如果 handlers 存在，遍历每个回调函数，传入 ability 对象，检查是否都返回 true。
    if (handlers) {
      flag = flag && handlers.every(handler => handler(ability))
    }
    // 如果 flag 为 true，并且 canHandlers 存在，再次遍历每个回调函数，传入 ability 对象，检查是否都返回 true。
    if (flag && canHandlers) {
      flag = flag && canHandlers.every(handler => handler(ability))
    }
    // 如果 flag 为 true，并且 cannotHandlers 存在，再次遍历每个回调函数，传入 ability 对象，检查是否都返回 false。
    if (flag && cannotHandlers) {
      flag = flag && cannotHandlers.every(handler => handler(ability))
    }
    return flag
  }
}

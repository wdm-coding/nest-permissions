import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decotator/role.decorator'
import { Role } from '../enum/role.enum'
import { UserService } from '../user/user.service'

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    // 使用userService 必须在使用此守卫的模块中导入UserModel模块，否则会报错
    private userService: UserService
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // reflector 获取装饰器中的数据
    // getAllAndOverride 获取路由上的元数据，第一个参数是装饰器的key值，第二个参数是装饰器所在的类或者方法
    // getAllAndMerge 合并类和方法的元数据，第一个参数是装饰器的key值，第二个参数是装饰器所在的类或者方法
    const requestRole = this.reflector.getAllAndMerge<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()])
    if (!requestRole) return true
    // 获取当前请求的用户信息
    const req = context.switchToHttp().getRequest()
    // 查询用户信息
    const user = await this.userService.findOneByName(req.user.username)
    if (!user) throw new ForbiddenException('用户不存在')
    const roles = user.roles?.map(role => role.code)
    const flag = requestRole.some(role => roles?.includes(role))
    if (!flag) throw new ForbiddenException('无权限访问')
    return true
  }
}

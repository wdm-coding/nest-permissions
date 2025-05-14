import { SetMetadata } from '@nestjs/common'
import { AnyMongoAbility, InferSubjects } from '@casl/ability'
import { Action } from 'src/enum/action.enum'

export enum CHECK_POLICIES_KEY {
  HANDLER = 'CHECK_POLICIES_HANDLER', // 自定义的权限监察逻辑处理函数
  CAN = 'CHECK_POLICIES_CAN', // 表示用户被允许执行某个操作(ability.can)
  CANNOT = 'CHECK_POLICIES_CANNOT' // 表示用户不被允许执行某个操作(ability.cannot)
}
// 回调函数类型，接收一个 ability 对象（CASL 的权限对象），返回一个布尔值，表示权限检查的结果。
export type PolicyHandlerCallback = (ability: AnyMongoAbility) => boolean
// 自定义的权限检查逻辑处理函数类型，可以是单个回调函数或者一个回调函数的数组。
// @CheckPolices 装饰器接收一个或多个回调函数，并将其存储在 CHECK_POLICIES_KEY.HANDLER 中。
export type CaslHandlerType = PolicyHandlerCallback[]
// SetMetadata 将这些回调函数存储到 CHECK_POLICIES_KEY.HANDLER 中
export const CheckPolices = (...handlers: PolicyHandlerCallback[]) => SetMetadata(CHECK_POLICIES_KEY.HANDLER, handlers)
// 定义了一个装饰器 Can，用于将 ability.can 的权限检查逻辑绑定到元数据。

/**
 *
 * @param action 权限动作，例如 'read', 'create' 等。
 * @param subject 权限对象，例如一个模型类或者具体的实例。
 * @param conditions 额外的条件，用于更细粒度的权限控制。例如，在某些情况下你可能需要根据用户的角色或特定的属性来决定是否允许执行某个操作。这些条件会被传递给 ability.can 方法作为第三个参数。
 * @returns 使用 SetMetadata 将 ability.can 的逻辑存储到 CHECK_POLICIES_KEY.CAN 中
 */
export const Can = (action: Action, subject: InferSubjects<any>, conditions?: any) =>
  SetMetadata(CHECK_POLICIES_KEY.CAN, (ability: AnyMongoAbility) => ability.can(action, subject, conditions))

export const Cannot = (action: Action, subject: InferSubjects<any>, conditions?: any) =>
  SetMetadata(CHECK_POLICIES_KEY.CANNOT, (ability: AnyMongoAbility) => ability.cannot(action, subject, conditions))

import { AnyMongoAbility, InferSubjects } from '@casl/ability'
import { SetMetadata } from '@nestjs/common'
import { Action } from '../enum/action.enum'

export enum CHECK_POLICIES_KEY {
  HANDLER = 'CHECK_POLICIES_HANDLER',
  CAN = 'CHECK_POLICIES_CAN',
  CANNOT = 'CHECK_POLICIES_CANNOT'
}
type PolicyHandlerCallback = (ability: AnyMongoAbility) => boolean
// 代码解释：这段代码定义了三个装饰器，用于在NestJS应用程序中实现基于能力的授权检查。这些装饰器允许你为特定的路由处理器、能力或禁止操作指定一组策略处理程序（handlers）。
// 作用 1. CheckPolices: 允许你为特定的路由处理器指定一组策略处理程序。这些处理程序将在执行请求之前被调用，以确定用户是否有权访问该资源。
export const CheckPolices = (...handlers: PolicyHandlerCallback[]) => SetMetadata(CHECK_POLICIES_KEY.HANDLER, handlers)
// 作用 2. Can: 允许你为特定的能力指定一组策略处理程序。这些处理程序将在执行请求之前被调用，以确定用户是否有权访问该资源。

export const Can = (action: Action, subject: InferSubjects<any>, conditions: any) =>
  // 设置元数据，键为CHECK_POLICIES_KEY.CAN
  SetMetadata(
    CHECK_POLICIES_KEY.CAN,
    // 使用一个函数作为值，该函数接受一个AnyMongoAbility类型的参数ability
    (ability: AnyMongoAbility) =>
      // 调用ability的can方法，传入action、subject和conditions参数，返回结果
      ability.can(action, subject, conditions)
  )
// 作用 3. Cannot: 允许你为特定的禁止操作指定一组策略处理程序。这些处理程序将在执行请求之前被调用，以确定用户是否有权访问该资源。
export const Cannot = (action: Action, subject: InferSubjects<any>, conditions: any) =>
  // 设置元数据，键为CHECK_POLICIES_KEY.CAN
  SetMetadata(
    CHECK_POLICIES_KEY.CAN,
    // 返回一个函数，该函数接收一个AnyMongoAbility类型的参数
    (ability: AnyMongoAbility) =>
      // 调用ability对象的cannot方法，传入action、subject和conditions参数
      ability.cannot(action, subject, conditions)
  )

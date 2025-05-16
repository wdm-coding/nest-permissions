import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { AllExceptionsFilter } from '../filters/all-exception.filter'
import { HttpAdapterHost } from '@nestjs/core'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

const setupApp = (app: INestApplication) => {
  // 使用全局日志记录器
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
  // 使用全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost), app.get(WINSTON_MODULE_NEST_PROVIDER)))
  // 设置全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true // 移除多余属性
    })
  )
  // 开启跨域资源共享策略
  app.enableCors()
  // 设置安全头盔
  app.use(helmet())
  // 设置请求频率限制
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100 // 限制每IP地址15分钟内最多只能访问100次
    })
  )
  // 设置全局路由前缀
  app.setGlobalPrefix('api')
}
export default setupApp

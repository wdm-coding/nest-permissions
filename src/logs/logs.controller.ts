import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common'
import { LogsService } from './logs.service'
import { TypeormDecorator } from '../decotator/typeorm.decotator'
import { ResponseInterceptor } from '../interceptors/response.interceptor'
import { JwtGuard } from '../guards/jwt.guard'
@Controller('logs')
@TypeormDecorator()
@UseInterceptors(new ResponseInterceptor())
@UseGuards(JwtGuard)
export class LogsController {
  constructor(private logsService: LogsService) {}
  // 日志高级查询
  @Get('list')
  findAll() {
    return this.logsService.findAll()
  }
}

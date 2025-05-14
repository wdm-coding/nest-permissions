import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common'
import { LogsService } from './logs.service'
import { TypeormDecorator } from '../decotator/typeorm.decotator'
import { ResponseInterceptor } from '../interceptors/response.interceptor'
import { JwtGuard } from '../guards/jwt.guard'
import { Can, CheckPolices } from '../decotator/casl.decorator'
import { Logs } from '../entities/logs/logs.entity'
import { Action } from '../enum/action.enum'
import { CaslAbilityGuard } from 'src/guards/casl-ability.guard'
@Controller('logs')
@TypeormDecorator()
@UseInterceptors(new ResponseInterceptor())
@UseGuards(CaslAbilityGuard, JwtGuard)
@CheckPolices(ability => ability.can(Action.Read, Logs))
export class LogsController {
  constructor(private logsService: LogsService) {}
  // 日志高级查询
  @Get('list')
  @Can(Action.Update, Logs)
  findAll() {
    return this.logsService.findAll()
  }
}

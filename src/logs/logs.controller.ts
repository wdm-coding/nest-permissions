import { Controller, Get } from '@nestjs/common'
import { LogsService } from './logs.service'
@Controller('logs')
export class LogsController {
  constructor(private logsService: LogsService) {}
  // 日志高级查询
  @Get('logsByGroup/:id')
  async getLogsByGroup(): Promise<any> {
    const data = await this.logsService.findLogsByGroup(1)
    return {
      code: 0,
      msg: 'success',
      data: data.map(item => ({
        user_id: item.user_id,
        result: item.result,
        count: item.count
      }))
    }
  }
}

import { Controller, Get, Res, Sse } from '@nestjs/common'
import { Observable } from 'rxjs'
import { Response } from 'express'
import { SseService } from './sse.service'
@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Get('message')
  @Sse()
  sse(@Res() res: Response): Observable<MessageEvent> {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    return this.sseService.sendEvents()
  }

  @Get('send')
  send(@Res() res: Response) {
    this.sseService.addEvent({
      id: '123',
      name: '张三'
    })
    res.send({
      code: 0,
      data: null,
      msg: '发送成功'
    })
  }
}

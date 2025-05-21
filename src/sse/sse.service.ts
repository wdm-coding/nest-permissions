import { Injectable } from '@nestjs/common'
import { Observable, Subject } from 'rxjs'
interface SseMessage {
  data: any
  event?: string // 可选，因为SSE标准中event是可选的
  id?: string // MessageEvent的标准属性
  lastEventId?: string
  origin?: string
  ports?: readonly MessagePort[]
  source?: MessageEventSource | null
}
@Injectable()
export class SseService {
  private events = new Subject<MessageEvent>()

  addEvent(data: any, eventName = 'message') {
    console.log('addEvent', data, eventName)
    this.events.next({ data, event: eventName } as SseMessage as MessageEvent)
    return this.events.asObservable()
  }

  sendEvents(): Observable<MessageEvent> {
    return this.events.asObservable()
  }
}

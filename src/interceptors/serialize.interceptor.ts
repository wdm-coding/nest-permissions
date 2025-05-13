import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { map, Observable } from 'rxjs'

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp()
    const response = httpContext.getResponse()
    if (response.statusCode === 201) {
      response.status(200)
    }
    return next.handle().pipe(
      map(data =>
        plainToInstance(this.dto, data, {
          excludeExtraneousValues: true // 排除掉多余的值,必须设置Exporse或者Exclude
        })
      )
    )
  }
}

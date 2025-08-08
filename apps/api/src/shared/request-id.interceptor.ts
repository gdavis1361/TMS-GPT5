import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { tap } from 'rxjs/operators'

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToHttp()
    const req: any = ctx.getRequest()
    const res: any = ctx.getResponse()
    const id = req.headers['x-request-id'] || randomUUID()
    res.header('X-Request-Id', id)
    const start = Date.now()
    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start
        // basic request log
        // eslint-disable-next-line no-console
        console.log(`${req.method} ${req.url} ${res.statusCode} id=${id} ${ms}ms`)
      }),
    )
  }
}

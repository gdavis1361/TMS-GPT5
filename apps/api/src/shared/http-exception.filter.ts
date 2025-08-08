import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res: any = ctx.getResponse()
    const req: any = ctx.getRequest()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: any = 'Internal Server Error'
    let errors: any = undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const resp = exception.getResponse() as any
      message = resp?.message || exception.message
      errors = resp?.errors
    }

    // RFC 7807 Problem Details
    res
      .status(status)
      .type('application/problem+json')
      .send({
        type: 'about:blank',
        title: message,
        status,
        detail: Array.isArray(errors) ? errors.join(', ') : errors,
        instance: req.url,
        requestId: res.getHeader('X-Request-Id'),
        timestamp: new Date().toISOString(),
      })
  }
}

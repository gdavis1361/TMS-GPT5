import 'reflect-metadata'
import { config as loadEnv } from 'dotenv'
loadEnv()
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import cors from '@fastify/cors'
import { AppModule } from './modules/app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import pino from 'pino'
import { HttpExceptionFilter } from './shared/http-exception.filter'
import { randomUUID } from 'crypto'
import { collectDefaultMetrics, Counter, Histogram, register } from 'prom-client'

async function bootstrap() {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers',
        'password',
        'token',
      ],
      remove: true,
    },
  })
  const adapter = new FastifyAdapter({
    logger,
    genReqId: (req: any) => (req.headers['x-request-id'] as string) || randomUUID(),
  })
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter)
  const fastify = app.getHttpAdapter().getInstance() as FastifyInstance
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',')
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      const ok = allowedOrigins.includes(origin)
      cb(ok ? null : new Error('CORS blocked'), ok)
    },
    credentials: true,
  })
  // Consider enabling @nestjs/throttler per-route instead of Fastify rate-limit to avoid duplicate limiting

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())

  const config = new DocumentBuilder().setTitle('TMS API').setVersion('v1').build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  // Request-Id header propagation
  fastify.addHook('onRequest', (req: FastifyRequest, reply: FastifyReply, done) => {
    const id = (req as any).id as string
    if (!reply.getHeader('X-Request-Id')) reply.header('X-Request-Id', id)
    ;(req as any)._metricsStartNs = process.hrtime.bigint()
    done()
  })

  // Prometheus metrics
  collectDefaultMetrics()
  const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'] as const,
  })
  const httpRequestDurationSeconds = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status'] as const,
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  })
  fastify.addHook('onResponse', (req: FastifyRequest, reply: FastifyReply, done) => {
    const method = req.method
    // Prefer routerPath if available, fallback to url
    const route = ((req as any).routerPath as string) || (req as any).url || ''
    const status = String(reply.statusCode)
    const start = (req as any)._metricsStartNs as bigint | undefined
    if (start) {
      const diffNs = Number(process.hrtime.bigint() - start)
      const seconds = diffNs / 1e9
      httpRequestDurationSeconds.labels(method, route, status).observe(seconds)
    }
    httpRequestsTotal.labels(method, route, status).inc()
    done()
  })
  fastify.get('/metrics', async (_req, reply) => {
    reply.header('Content-Type', register.contentType)
    return register.metrics()
  })

  await app.listen(Number(process.env.PORT) || 3001, '0.0.0.0')
}

bootstrap()

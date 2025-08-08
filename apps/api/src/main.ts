import 'reflect-metadata'
import { config as loadEnv } from 'dotenv'
loadEnv()
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import cors from '@fastify/cors'
import { AppModule } from './modules/app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import pino from 'pino'
import { HttpExceptionFilter } from './shared/http-exception.filter'

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
  const adapter = new FastifyAdapter({ logger })
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter)
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

  // Expose Prometheus metrics endpoint (Fastify basic)
  app.getHttpAdapter().getInstance().get('/metrics', async (_req: any, reply: any) => {
    // TODO: wire prom-client registry; placeholder OK for now
    reply.header('Content-Type', 'text/plain')
    return '# HELP tms_up 1 when API is up\n# TYPE tms_up gauge\ntms_up 1\n'
  })

  await app.listen(Number(process.env.PORT) || 3001, '0.0.0.0')
}

bootstrap()

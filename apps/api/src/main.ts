import 'reflect-metadata'
import { config as loadEnv } from 'dotenv'
import { join } from 'node:path'
loadEnv({ path: join(__dirname, '..', '.env') })
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { AppModule } from './modules/app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { HttpExceptionFilter } from './shared/http-exception.filter'

async function bootstrap() {
  const adapter = new FastifyAdapter({ logger: { level: 'info' } })
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter)
  await app.register(cors, { origin: true, credentials: true })
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })

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

  await app.listen(Number(process.env.PORT) || 3001, '0.0.0.0')
}

bootstrap()

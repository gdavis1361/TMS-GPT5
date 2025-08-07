import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { AppModule } from './modules/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter({}))
  await app.listen({ port: 3001, host: '0.0.0.0' })
}

bootstrap()


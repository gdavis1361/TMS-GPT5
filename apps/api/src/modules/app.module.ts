import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from '../routes/app.controller'
import { SecurityHeadersGuard } from '../security/security-headers.guard'
import { PrismaService } from '../prisma/prisma.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { RequestIdInterceptor } from '../shared/request-id.interceptor'
import { ContactsModule } from './contacts/contacts.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        PORT: Joi.number().default(3001),
      }),
    }),
    ContactsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: SecurityHeadersGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
  ],
})
export class AppModule {}

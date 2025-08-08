import { Module } from '@nestjs/common'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import Redis from 'ioredis'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { AppController } from '../routes/app.controller'
import { SecurityHeadersGuard } from '../security/security-headers.guard'
import { PrismaService } from '../prisma/prisma.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { RequestIdInterceptor } from '../shared/request-id.interceptor'
import { MailService } from '../shared/mail.service'
import { ContactsModule } from './contacts/contacts.module'
import { CustomersModule } from './customers/customers.module'
import { LocationsModule } from './locations/locations.module'
import { OrdersModule } from './orders/orders.module'
import { DocumentsModule } from './documents/documents.module'
import { AuthModule } from './auth/auth.module'
import rateLimit from '@nestjs/throttler'

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          { ttl: 60, limit: 100 },
          // Stricter auth bucket
          { ttl: 60, limit: 10 },
        ],
        storage: new ThrottlerStorageRedisService(new Redis(process.env.REDIS_URL || 'redis://redis:6379')),
        // Use IP by default so global guard doesn't rely on auth state
        getTracker: (req: any) => {
          const ip = (req.ip || req.headers['x-forwarded-for'] || '').toString()
          return ip
        },
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        PORT: Joi.number().default(3001),
        DATABASE_URL: Joi.string().uri().required(),
        JWT_SECRET: Joi.string().min(16).optional(),
        JWT_PRIVATE_KEY: Joi.string().optional(),
        JWT_PUBLIC_KEY: Joi.string().optional(),
        JWT_ISSUER: Joi.string().optional(),
        JWT_AUDIENCE: Joi.string().optional(),
        SMTP_HOST: Joi.string().optional(),
        SMTP_PORT: Joi.number().optional(),
      }),
    }),
    ContactsModule,
    CustomersModule,
    LocationsModule,
    OrdersModule,
    DocumentsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: SecurityHeadersGuard,
    },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
    MailService,
  ],
})
export class AppModule {}

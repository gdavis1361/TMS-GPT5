import { Module } from '@nestjs/common'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from '../routes/app.controller'
import { SecurityHeadersGuard } from '../security/security-headers.guard'
import { PrismaService } from '../prisma/prisma.service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { RequestIdInterceptor } from '../shared/request-id.interceptor'
import { ContactsModule } from './contacts/contacts.module'
import { CustomersModule } from './customers/customers.module'
import { LocationsModule } from './locations/locations.module'
import { OrdersModule } from './orders/orders.module'
import { DocumentsModule } from './documents/documents.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60, limit: 100 }] }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        PORT: Joi.number().default(3001),
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
  ],
})
export class AppModule {}

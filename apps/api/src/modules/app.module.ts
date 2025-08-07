import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from '../routes/app.controller'
import { SecurityHeadersGuard } from '../security/security-headers.guard'

@Module({
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SecurityHeadersGuard,
    },
  ],
})
export class AppModule {}


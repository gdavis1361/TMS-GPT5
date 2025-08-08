import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { OrdersController } from './orders.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [OrdersController],
  providers: [PrismaService],
})
export class OrdersModule {}

import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { OrdersController } from './orders.controller'

@Module({
  controllers: [OrdersController],
  providers: [PrismaService],
})
export class OrdersModule {}

import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CustomersController } from './customers.controller'

@Module({
  controllers: [CustomersController],
  providers: [PrismaService],
})
export class CustomersModule {}

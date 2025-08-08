import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CustomersController } from './customers.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [CustomersController],
  providers: [PrismaService],
})
export class CustomersModule {}

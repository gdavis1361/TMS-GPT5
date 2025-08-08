import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { LocationsController } from './locations.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [LocationsController],
  providers: [PrismaService],
})
export class LocationsModule {}

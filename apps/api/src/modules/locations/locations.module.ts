import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { LocationsController } from './locations.controller'

@Module({
  controllers: [LocationsController],
  providers: [PrismaService],
})
export class LocationsModule {}

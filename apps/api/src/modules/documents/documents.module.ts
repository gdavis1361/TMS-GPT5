import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { DocumentsController } from './documents.controller'

@Module({
  controllers: [DocumentsController],
  providers: [PrismaService],
})
export class DocumentsModule {}

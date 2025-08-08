import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { DocumentsController } from './documents.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [DocumentsController],
  providers: [PrismaService],
})
export class DocumentsModule {}

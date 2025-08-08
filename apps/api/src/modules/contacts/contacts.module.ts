import { Module } from '@nestjs/common'
import { ContactsController } from './contacts.controller'
import { PrismaService } from '../../prisma/prisma.service'

@Module({
  controllers: [ContactsController],
  providers: [PrismaService],
})
export class ContactsModule {}

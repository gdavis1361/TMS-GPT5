import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { IsEmail, IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'

class CreateContactDto {
  @IsString()
  name!: string

  @IsEmail()
  email!: string

  @IsOptional()
  @IsString()
  phone?: string
}

class ListQueryDto {
  @IsOptional()
  @IsString()
  q?: string

  @Type(() => Number)
  @IsOptional()
  page?: number = 1

  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 25
}

@Controller({ path: 'contacts', version: '1' })
export class ContactsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: ListQueryDto) {
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 25))
    const mode = Prisma.QueryMode.insensitive
    const where: Prisma.ContactWhereInput | undefined = query.q
      ? {
          OR: [
            { name: { contains: query.q, mode } },
            { email: { contains: query.q, mode } },
            { phone: { contains: query.q, mode } },
          ],
        }
      : undefined
    const whereActive: Prisma.ContactWhereInput = { AND: [where ?? {}, { deletedAt: null }] }
    const [total, items] = await Promise.all([
      this.prisma.contact.count({ where: whereActive }),
      this.prisma.contact.findMany({
        where: whereActive,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])
    return { items, total, page, pageSize }
  }

  @Post()
  async create(@Body() dto: CreateContactDto) {
    const created = await this.prisma.contact.create({
      data: { email: dto.email, name: dto.name, phone: dto.phone },
    })
    return created
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.prisma.contact.findUniqueOrThrow({ where: { id } })
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateContactDto>) {
    return this.prisma.contact.update({
      where: { id },
      data: { name: dto.name, email: dto.email, phone: dto.phone },
    })
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prisma.contact.update({ where: { id }, data: { deletedAt: new Date() } })
    return { ok: true }
  }
}

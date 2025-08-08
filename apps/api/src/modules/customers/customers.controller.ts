import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'

class UpsertCustomerDto {
  @IsString()
  name!: string
  @IsOptional()
  @IsString()
  email?: string
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

@Controller({ path: 'customers', version: '1' })
export class CustomersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: ListQueryDto) {
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 25))
    const mode = Prisma.QueryMode.insensitive
    const q = query.q
    const whereActive: Prisma.CustomerWhereInput = {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode } },
                { email: { contains: q, mode } },
                { phone: { contains: q, mode } },
              ],
            }
          : {},
        { deletedAt: null },
      ],
    }
    const [total, items] = await Promise.all([
      this.prisma.customer.count({ where: whereActive }),
      this.prisma.customer.findMany({
        where: whereActive,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])
    return { items, total, page, pageSize }
  }

  @Post()
  async create(@Body() dto: UpsertCustomerDto) {
    return this.prisma.customer.create({
      data: { name: dto.name, email: dto.email, phone: dto.phone },
    })
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.prisma.customer.findUniqueOrThrow({ where: { id } })
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<UpsertCustomerDto>) {
    return this.prisma.customer.update({
      where: { id },
      data: { name: dto.name, email: dto.email, phone: dto.phone },
    })
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } })
    return { ok: true }
  }
}

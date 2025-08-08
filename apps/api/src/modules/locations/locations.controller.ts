import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'

class UpsertLocationDto {
  @IsString()
  customerId!: string
  @IsString()
  name!: string
  @IsOptional()
  @IsString()
  address1?: string
  @IsOptional()
  @IsString()
  city?: string
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

@Controller({ path: 'locations', version: '1' })
export class LocationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: ListQueryDto) {
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 25))
    const mode = Prisma.QueryMode.insensitive
    const q = query.q
    const whereActive: Prisma.LocationWhereInput = {
      AND: [
        q ? { OR: [{ name: { contains: q, mode } }, { city: { contains: q, mode } }] } : {},
        { deletedAt: null },
      ],
    }
    const [total, items] = await Promise.all([
      this.prisma.location.count({ where: whereActive }),
      this.prisma.location.findMany({
        where: whereActive,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])
    return { items, total, page, pageSize }
  }

  @Post()
  async create(@Body() dto: UpsertLocationDto) {
    return this.prisma.location.create({
      data: { customerId: dto.customerId, name: dto.name, address1: dto.address1, city: dto.city },
    })
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.prisma.location.findUniqueOrThrow({ where: { id } })
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<UpsertLocationDto>) {
    return this.prisma.location.update({
      where: { id },
      data: { name: dto.name, address1: dto.address1, city: dto.city },
    })
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prisma.location.update({ where: { id }, data: { deletedAt: new Date() } })
    return { ok: true }
  }
}

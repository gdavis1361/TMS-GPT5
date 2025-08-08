import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
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

@UseGuards(AuthGuard)
@Controller({ path: 'customers', version: '1' })
export class CustomersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Req() req: any, @Query() query: ListQueryDto) {
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 25))
    const mode = Prisma.QueryMode.insensitive
    const q = query.q
    const whereActive: Prisma.CustomerWhereInput = {
      AND: [
        { ownerId: req.user.id },
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
  async create(@Req() req: any, @Body() dto: UpsertCustomerDto) {
    return this.prisma.customer.create({
      data: { ownerId: req.user.id, name: dto.name, email: dto.email, phone: dto.phone },
    })
  }

  @Get(':id')
  async get(@Req() req: any, @Param('id') id: string) {
    return this.prisma.customer.findFirstOrThrow({ where: { id, ownerId: req.user.id } })
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<UpsertCustomerDto>) {
    await this.prisma.customer.findFirstOrThrow({ where: { id, ownerId: req.user.id } })
    return this.prisma.customer.update({
      where: { id },
      data: { name: dto.name, email: dto.email, phone: dto.phone },
    })
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.prisma.customer.update({
      where: { id, ownerId: req.user.id } as any,
      data: { deletedAt: new Date() },
    })
    return { ok: true }
  }
}

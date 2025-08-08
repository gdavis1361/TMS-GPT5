import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma, OrderStatus } from '@prisma/client'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'

class UpsertOrderDto {
  @IsString()
  customerId!: string
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus
}

class ListQueryDto {
  @IsOptional()
  @IsString()
  customerId?: string
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus
  @Type(() => Number)
  @IsOptional()
  page?: number = 1
  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 25
}

@UseGuards(AuthGuard)
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Req() req: any, @Query() query: ListQueryDto) {
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 25))
    const where: Prisma.OrderWhereInput = {
      AND: [
        query.customerId ? { customerId: query.customerId } : {},
        query.status ? { status: query.status } : {},
        { deletedAt: null },
      ],
    }
    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])
    return { items, total, page, pageSize }
  }

  @Post()
  create(@Req() req: any, @Body() dto: UpsertOrderDto) {
    return this.prisma.order.create({ data: { customerId: dto.customerId, status: dto.status } })
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.prisma.order.findUniqueOrThrow({ where: { id } })
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<UpsertOrderDto>) {
    return this.prisma.order.update({ where: { id }, data: { status: dto.status } })
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prisma.order.update({ where: { id }, data: { deletedAt: new Date() } })
    return { ok: true }
  }
}

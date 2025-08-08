import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { IsInt, IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'

class UpsertDocumentDto {
  @IsOptional()
  @IsString()
  customerId?: string
  @IsOptional()
  @IsString()
  orderId?: string
  @IsString()
  filename!: string
  @IsString()
  mimeType!: string
  @Type(() => Number)
  @IsInt()
  size!: number
  @IsString()
  storageKey!: string
}

class ListQueryDto {
  @IsOptional()
  @IsString()
  customerId?: string
  @IsOptional()
  @IsString()
  orderId?: string
  @Type(() => Number)
  @IsOptional()
  page?: number = 1
  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 25
}

@Controller({ path: 'documents', version: '1' })
export class DocumentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: ListQueryDto) {
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 25))
    const where: Prisma.DocumentWhereInput = {
      AND: [
        query.customerId ? { customerId: query.customerId } : {},
        query.orderId ? { orderId: query.orderId } : {},
        { deletedAt: null },
      ],
    }
    const [total, items] = await Promise.all([
      this.prisma.document.count({ where }),
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])
    return { items, total, page, pageSize }
  }

  @Post()
  create(@Body() dto: UpsertDocumentDto) {
    return this.prisma.document.create({
      data: {
        customerId: dto.customerId,
        orderId: dto.orderId,
        filename: dto.filename,
        mimeType: dto.mimeType,
        size: dto.size,
        storageKey: dto.storageKey,
      },
    })
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.prisma.document.findUniqueOrThrow({ where: { id } })
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<UpsertDocumentDto>) {
    return this.prisma.document.update({
      where: { id },
      data: { filename: dto.filename, mimeType: dto.mimeType },
    })
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prisma.document.update({ where: { id }, data: { deletedAt: new Date() } })
    return { ok: true }
  }
}

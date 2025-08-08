import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('/health')
  health() {
    return { ok: true }
  }

  @Get('/ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1 as ok`
      return { ok: true }
    } catch {
      return { ok: false }
    }
  }

  @Get('/users/count')
  async usersCount() {
    const count = await this.prisma.user.count()
    return { count }
  }
}

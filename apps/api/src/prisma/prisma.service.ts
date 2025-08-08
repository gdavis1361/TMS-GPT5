import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    })
    // Soft-delete default scope middleware
    this.$use(async (params, next) => {
      const modelsWithSoftDelete = new Set(['User', 'Contact', 'Customer', 'Location', 'Order', 'Document'])
      if (!modelsWithSoftDelete.has(params.model ?? '')) {
        return next(params)
      }
      const isFind = params.action === 'findUnique' || params.action === 'findFirst' || params.action === 'findMany'
      if (isFind) {
        const where = (params.args && params.args.where) || {}
        // allow explicit includeDeleted to bypass filter
        const includeDeleted = params.args?.includeDeleted === true
        if (!includeDeleted) {
          if (params.action === 'findMany') {
            params.args = { ...params.args, where: { deletedAt: null, ...where } }
          } else {
            params.args = { ...params.args, where: { deletedAt: null, ...where } }
          }
        } else {
          delete params.args.includeDeleted
        }
      }
      return next(params)
    })
  }
  async onModuleInit(): Promise<void> {
    await this.$connect()
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    process.on('beforeExit', async () => {
      await app.close()
    })
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}

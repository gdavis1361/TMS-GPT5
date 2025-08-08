import { Test } from '@nestjs/testing'
import { INestApplication, VersioningType } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { LocationsModule } from './locations.module'
import { PrismaService } from '../../prisma/prisma.service'

describe('Locations', () => {
  let app: NestFastifyApplication
  let prisma: PrismaService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [LocationsModule] }).compile()
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
    prisma = app.get(PrismaService)
    await app.init()
  })
  afterAll(async () => {
    await app.close()
  })
  it('list + create', async () => {
    const customer = await prisma.customer.create({ data: { name: 'Cust A' } })
    const create = await app.inject({
      method: 'POST',
      url: '/v1/locations',
      payload: { customerId: customer.id, name: 'HQ' },
    })
    expect(create.statusCode).toBe(201)
    const list = await app.inject({ method: 'GET', url: '/v1/locations' })
    expect(list.statusCode).toBe(200)
  })
})

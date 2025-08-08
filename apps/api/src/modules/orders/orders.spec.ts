import { Test } from '@nestjs/testing'
import { INestApplication, VersioningType } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { OrdersModule } from './orders.module'
import { PrismaService } from '../../prisma/prisma.service'

describe('Orders', () => {
  let app: NestFastifyApplication
  let prisma: PrismaService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [OrdersModule] }).compile()
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
    prisma = app.get(PrismaService)
    await app.init()
  })
  afterAll(async () => {
    await app.close()
  })
  it('list + create', async () => {
    const email = `o${Date.now()}@example.com`
    const password = 'Password123!'
    const signup = await app.inject({
      method: 'POST',
      url: '/v1/auth/signup',
      payload: { email, password },
    })
    const { access_token } = signup.json() as any
    const user = await prisma.user.findUniqueOrThrow({ where: { email } })
    const customer = await prisma.customer.create({ data: { ownerId: user.id, name: 'Cust B' } })
    const create = await app.inject({
      method: 'POST',
      url: '/v1/orders',
      headers: { authorization: `Bearer ${access_token}` },
      payload: { customerId: customer.id },
    })
    expect(create.statusCode).toBe(201)
    const list = await app.inject({
      method: 'GET',
      url: '/v1/orders',
      headers: { authorization: `Bearer ${access_token}` },
    })
    expect(list.statusCode).toBe(200)
  })
})

import { Test } from '@nestjs/testing'
import { INestApplication, VersioningType } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { CustomersModule } from './customers.module'

describe('Customers', () => {
  let app: NestFastifyApplication
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [CustomersModule] }).compile()
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
    await app.init()
  })
  afterAll(async () => {
    await app.close()
  })
  it('list + create', async () => {
    const create = await app.inject({
      method: 'POST',
      url: '/v1/customers',
      payload: { name: 'Acme Co' },
    })
    expect(create.statusCode).toBe(201)
    const list = await app.inject({ method: 'GET', url: '/v1/customers' })
    expect(list.statusCode).toBe(200)
  })
})

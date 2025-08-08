import { Test } from '@nestjs/testing'
import { ContactsModule } from './contacts.module'
import { INestApplication, VersioningType } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import request from 'supertest'

describe('Contacts', () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [ContactsModule] }).compile()
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('list contacts', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/contacts' })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body).toBeDefined()
  })
})

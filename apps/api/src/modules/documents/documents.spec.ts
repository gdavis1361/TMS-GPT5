import { Test } from '@nestjs/testing'
import { INestApplication, VersioningType } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentsModule } from './documents.module'

describe('Documents', () => {
  let app: NestFastifyApplication
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [DocumentsModule] }).compile()
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
    await app.init()
  })
  afterAll(async () => {
    await app.close()
  })
  it('list + create', async () => {
    const payload = { filename: 'a.txt', mimeType: 'text/plain', size: 1, storageKey: 'test/a.txt' }
    const create = await app.inject({ method: 'POST', url: '/v1/documents', payload })
    expect(create.statusCode).toBe(201)
    const list = await app.inject({ method: 'GET', url: '/v1/documents' })
    expect(list.statusCode).toBe(200)
  })
})

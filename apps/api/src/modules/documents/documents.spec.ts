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
    const email = `d${Date.now()}@example.com`
    const password = 'Password123!'
    const signup = await app.inject({
      method: 'POST',
      url: '/v1/auth/signup',
      payload: { email, password },
    })
    const { access_token } = signup.json() as any
    const payload = {
      filename: `a-${Date.now()}.txt`,
      mimeType: 'text/plain',
      size: 1,
      storageKey: `test/a-${Date.now()}.txt`,
    }
    const create = await app.inject({
      method: 'POST',
      url: '/v1/documents',
      headers: { authorization: `Bearer ${access_token}` },
      payload,
    })
    expect(create.statusCode).toBe(201)
    const list = await app.inject({
      method: 'GET',
      url: '/v1/documents',
      headers: { authorization: `Bearer ${access_token}` },
    })
    expect(list.statusCode).toBe(200)
  })
})

import { Test } from '@nestjs/testing'
import { AuthModule } from './auth.module'
import { INestApplication, VersioningType } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import request from 'supertest'

describe('Auth', () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AuthModule] }).compile()
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('signup and login', async () => {
    const email = `u${Date.now()}@example.com`
    const password = 'Password123!'
    const signup = await app.inject({
      method: 'POST',
      url: '/v1/auth/signup',
      payload: { email, password },
    })
    expect(signup.statusCode).toBe(201)
    const login = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: { email, password },
    })
    expect(login.statusCode).toBe(201)
  })
})

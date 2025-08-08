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

  it('email verification flow', async () => {
    const email = `v${Date.now()}@example.com`
    const password = 'Password123!'
    // signup
    await app.inject({ method: 'POST', url: '/v1/auth/signup', payload: { email, password } })
    // request token
    const reqTok = await app.inject({
      method: 'POST',
      url: '/v1/auth/request-email-verification',
      payload: { email },
    })
    expect(reqTok.statusCode).toBe(201)
    const token = (reqTok.json() as any).token
    expect(token).toBeTruthy()
    // verify
    const verify = await app.inject({
      method: 'POST',
      url: '/v1/auth/verify-email',
      payload: { email, token },
    })
    expect(verify.statusCode).toBe(201)
  })

  it('password reset flow', async () => {
    const email = `r${Date.now()}@example.com`
    const password = 'Password123!'
    await app.inject({ method: 'POST', url: '/v1/auth/signup', payload: { email, password } })
    const req = await app.inject({
      method: 'POST',
      url: '/v1/auth/request-password-reset',
      payload: { email },
    })
    expect(req.statusCode).toBe(201)
    const token = (req.json() as any).token
    const nextPass = 'NewPass123!'
    const reset = await app.inject({
      method: 'POST',
      url: '/v1/auth/reset-password',
      payload: { email, token, newPassword: nextPass },
    })
    expect(reset.statusCode).toBe(201)
    // old refresh should be revoked; just ensure login with new password works
    const login = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: { email, password: nextPass },
    })
    expect(login.statusCode).toBe(201)
  })
})

import { Test } from '@nestjs/testing'
import { AuthModule } from './auth.module'
import { INestApplication, VersioningType } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { PrismaService } from '../../prisma/prisma.service'
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

  it('email verification: expired token is rejected and logs request', async () => {
    const prisma = app.get(PrismaService)
    const email = `exp${Date.now()}@example.com`
    const password = 'Password123!'
    await app.inject({ method: 'POST', url: '/v1/auth/signup', payload: { email, password } })
    const reqTok = await app.inject({
      method: 'POST',
      url: '/v1/auth/request-email-verification',
      payload: { email },
    })
    const token = (reqTok.json() as any).token as string
    const [tokenId] = token.split('.')
    // expire it
    await prisma.emailVerificationToken.updateMany({
      where: { tokenId },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    })
    const verify = await app.inject({
      method: 'POST',
      url: '/v1/auth/verify-email',
      payload: { email, token },
    })
    expect(verify.statusCode).toBe(400)
    const user = await prisma.user.findUniqueOrThrow({ where: { email } })
    const logs = await prisma.auditLog.findMany({
      where: { userId: user.id, event: 'auth.verify_email.request' },
    })
    expect(logs.length).toBeGreaterThan(0)
  })

  it('email verification: used token is rejected', async () => {
    const email = `used${Date.now()}@example.com`
    const password = 'Password123!'
    await app.inject({ method: 'POST', url: '/v1/auth/signup', payload: { email, password } })
    const reqTok = await app.inject({
      method: 'POST',
      url: '/v1/auth/request-email-verification',
      payload: { email },
    })
    const token = (reqTok.json() as any).token as string
    const first = await app.inject({
      method: 'POST',
      url: '/v1/auth/verify-email',
      payload: { email, token },
    })
    expect(first.statusCode).toBe(201)
    const second = await app.inject({
      method: 'POST',
      url: '/v1/auth/verify-email',
      payload: { email, token },
    })
    expect(second.statusCode).toBe(400)
  })

  it('password reset: expired token is rejected and logs request', async () => {
    const prisma = app.get(PrismaService)
    const email = `prex${Date.now()}@example.com`
    const password = 'Password123!'
    await app.inject({ method: 'POST', url: '/v1/auth/signup', payload: { email, password } })
    const req = await app.inject({
      method: 'POST',
      url: '/v1/auth/request-password-reset',
      payload: { email },
    })
    const token = (req.json() as any).token as string
    const [tokenId] = token.split('.')
    await prisma.passwordResetToken.updateMany({
      where: { tokenId },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    })
    const reset = await app.inject({
      method: 'POST',
      url: '/v1/auth/reset-password',
      payload: { email, token, newPassword: 'NextPass123!' },
    })
    expect(reset.statusCode).toBe(400)
    const user = await prisma.user.findUniqueOrThrow({ where: { email } })
    const logs = await prisma.auditLog.findMany({
      where: { userId: user.id, event: 'auth.reset_password.request' },
    })
    expect(logs.length).toBeGreaterThan(0)
  })

  it('password reset: used token is rejected', async () => {
    const email = `prused${Date.now()}@example.com`
    const password = 'Password123!'
    await app.inject({ method: 'POST', url: '/v1/auth/signup', payload: { email, password } })
    const req = await app.inject({
      method: 'POST',
      url: '/v1/auth/request-password-reset',
      payload: { email },
    })
    const token = (req.json() as any).token as string
    const ok = await app.inject({
      method: 'POST',
      url: '/v1/auth/reset-password',
      payload: { email, token, newPassword: 'NextPass123!' },
    })
    expect(ok.statusCode).toBe(201)
    const again = await app.inject({
      method: 'POST',
      url: '/v1/auth/reset-password',
      payload: { email, token, newPassword: 'AnotherPass123!' },
    })
    expect(again.statusCode).toBe(400)
  })
})

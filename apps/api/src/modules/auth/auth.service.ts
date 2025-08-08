import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { add } from 'date-fns'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(email: string, password: string) {
    const hash = await argon2.hash(password, { type: argon2.argon2id })
    const user = await this.prisma.user.create({ data: { email, hash } })
    await this.log(null, 'auth.signup', { email })
    return this.issueTokens(user.id)
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')
    const ok = await argon2.verify(user.hash, password)
    if (!ok) throw new UnauthorizedException('Invalid credentials')
    await this.log(user.id, 'auth.login', {})
    return this.issueTokens(user.id)
  }

  private async issueTokens(userId: string) {
    const access_token = await this.jwt.signAsync({ sub: userId })
    const tokenId = cryptoRandom(32)
    const refreshSecret = cryptoRandom(64)
    const refresh_token = `${tokenId}.${refreshSecret}`
    const tokenHash = await argon2.hash(refreshSecret, { type: argon2.argon2id })
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenId,
        tokenHash,
        expiresAt: add(new Date(), { days: 7 }),
      },
    })
    await this.log(userId, 'auth.issue_tokens', {})
    return { access_token, refresh_token }
  }

  async refresh(userId: string, refresh_token: string) {
    const [tokenId, providedSecret] = refresh_token.split('.')
    const record = await this.prisma.refreshToken.findFirst({
      where: { userId, tokenId, revokedAt: null, expiresAt: { gt: new Date() } },
    })
    if (!record) throw new UnauthorizedException('Invalid refresh token')
    if (!providedSecret) throw new UnauthorizedException('Invalid refresh token')
    const ok = await argon2.verify(record.tokenHash, providedSecret)
    if (!ok) throw new UnauthorizedException('Invalid refresh token')
    // rotate
    const nextId = cryptoRandom(32)
    const nextSecret = cryptoRandom(64)
    const next = `${nextId}.${nextSecret}`
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date(), replacedBy: nextId },
    })
    const nextHash = await argon2.hash(nextSecret, { type: argon2.argon2id })
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenId: nextId,
        tokenHash: nextHash,
        expiresAt: add(new Date(), { days: 7 }),
      },
    })
    const access_token = await this.jwt.signAsync({ sub: userId })
    await this.log(userId, 'auth.refresh', {})
    return { access_token, refresh_token: next }
  }

  async revokeAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    await this.log(userId, 'auth.logout_all', {})
    return { ok: true }
  }

  async requestEmailVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) return { ok: true }
    const tokenId = cryptoRandom(32)
    const secret = cryptoRandom(64)
    const token = `${tokenId}.${secret}`
    const tokenHash = await argon2.hash(secret, { type: argon2.argon2id })
    await this.prisma.emailVerificationToken.create({
      data: { userId: user.id, tokenId, tokenHash, expiresAt: add(new Date(), { hours: 24 }) },
    })
    await this.log(user.id, 'auth.verify_email.request', {})
    return { ok: true, token }
  }

  async verifyEmail(email: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new BadRequestException('Invalid request')
    const [tokenId, secret] = token.split('.')
    const rec = await this.prisma.emailVerificationToken.findFirst({
      where: { userId: user.id, tokenId, usedAt: null, expiresAt: { gt: new Date() } },
    })
    if (!rec || !secret) throw new BadRequestException('Invalid token')
    const ok = await argon2.verify(rec.tokenHash, secret)
    if (!ok) throw new BadRequestException('Invalid token')
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } }),
      this.prisma.emailVerificationToken.update({
        where: { id: rec.id },
        data: { usedAt: new Date() },
      }),
    ])
    await this.log(user.id, 'auth.verify_email.success', {})
    return { ok: true }
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) return { ok: true }
    const tokenId = cryptoRandom(32)
    const secret = cryptoRandom(64)
    const token = `${tokenId}.${secret}`
    const tokenHash = await argon2.hash(secret, { type: argon2.argon2id })
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenId, tokenHash, expiresAt: add(new Date(), { hours: 2 }) },
    })
    await this.log(user.id, 'auth.reset_password.request', {})
    return { ok: true, token }
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new BadRequestException('Invalid request')
    const [tokenId, secret] = token.split('.')
    const rec = await this.prisma.passwordResetToken.findFirst({
      where: { userId: user.id, tokenId, usedAt: null, expiresAt: { gt: new Date() } },
    })
    if (!rec || !secret) throw new BadRequestException('Invalid token')
    const ok = await argon2.verify(rec.tokenHash, secret)
    if (!ok) throw new BadRequestException('Invalid token')
    const hash = await argon2.hash(newPassword, { type: argon2.argon2id })
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { hash } }),
      this.prisma.passwordResetToken.update({
        where: { id: rec.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ])
    await this.log(user.id, 'auth.reset_password.success', {})
    return { ok: true }
  }

  private async log(userId: string | null, event: string, metadata: Record<string, unknown>) {
    await this.prisma.auditLog.create({
      data: { userId: userId ?? undefined, event, metadata: metadata as any },
    })
  }
}

function cryptoRandom(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  const arr = new Uint32Array(length)
  // Fallback: use Math.random if crypto not available
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return out
}

import { Injectable, UnauthorizedException } from '@nestjs/common'
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
    return this.issueTokens(user.id)
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')
    const ok = await argon2.verify(user.hash, password)
    if (!ok) throw new UnauthorizedException('Invalid credentials')
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
    return { access_token, refresh_token: next }
  }

  async revokeAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return { ok: true }
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

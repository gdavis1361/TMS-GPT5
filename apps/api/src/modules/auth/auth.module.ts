import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { readFileSync } from 'node:fs'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PrismaService } from '../../prisma/prisma.service'
import { MailService } from '../../shared/mail.service'
import { JwksController } from './jwks.controller'

@Module({
  imports: [
    JwtModule.register({
      global: true,
      privateKey:
        process.env.JWT_PRIVATE_KEY_FILE
          ? readFileSync(process.env.JWT_PRIVATE_KEY_FILE, 'utf8')
          : process.env.JWT_PRIVATE_KEY || undefined,
      publicKey:
        process.env.JWT_PUBLIC_KEY_FILE
          ? readFileSync(process.env.JWT_PUBLIC_KEY_FILE, 'utf8')
          : process.env.JWT_PUBLIC_KEY || undefined,
      secret: !(
        process.env.JWT_PRIVATE_KEY ||
        process.env.JWT_PRIVATE_KEY_FILE
      )
        ? process.env.JWT_SECRET
        : undefined,
      signOptions: {
        algorithm:
          process.env.JWT_PRIVATE_KEY || process.env.JWT_PRIVATE_KEY_FILE
            ? 'RS256'
            : 'HS256',
        expiresIn: '15m',
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
      },
    }),
  ],
  controllers: [AuthController, JwksController],
  providers: [AuthService, PrismaService, MailService],
})
export class AuthModule {}

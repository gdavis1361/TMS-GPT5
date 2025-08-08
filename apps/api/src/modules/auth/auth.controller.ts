import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator'
import { UseGuards, Get, Req } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { AuthGuard } from './auth.guard'

class CredentialsDto {
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message: 'Password must include upper, lower, number, and symbol',
  })
  password!: string

  @IsOptional()
  @IsString()
  @MinLength(6)
  totp?: string
}

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  signup(@Body() dto: CredentialsDto) {
    return this.auth.signup(dto.email, dto.password)
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  login(@Req() req: any, @Body() dto: CredentialsDto) {
    return this.auth.login(
      dto.email,
      dto.password,
      { ip: req.ip, userAgent: req.headers['user-agent'] },
      dto.totp,
    )
  }

  @Post('refresh')
  refresh(@Req() req: any, @Body() dto: { userId: string; refresh_token: string }) {
    return this.auth.refresh(dto.userId, dto.refresh_token, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })
  }

  @Post('logout')
  logout(@Body() dto: { userId: string }) {
    return this.auth.revokeAll(dto.userId)
  }

  @Post('request-email-verification')
  @Throttle({ default: { limit: 5, ttl: 300 } })
  requestEmailVerification(@Body() dto: { email: string }) {
    return this.auth.requestEmailVerification(dto.email)
  }

  @Post('verify-email')
  @Throttle({ default: { limit: 5, ttl: 300 } })
  verifyEmail(@Body() dto: { email: string; token: string }) {
    return this.auth.verifyEmail(dto.email, dto.token)
  }

  @Post('request-password-reset')
  @Throttle({ default: { limit: 5, ttl: 300 } })
  requestPasswordReset(@Body() dto: { email: string }) {
    return this.auth.requestPasswordReset(dto.email)
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 300 } })
  resetPassword(@Body() dto: { email: string; token: string; newPassword: string }) {
    return this.auth.resetPassword(dto.email, dto.token, dto.newPassword)
  }

  @UseGuards(AuthGuard)
  @Get('sessions')
  listSessions(@Req() req: any) {
    return this.auth.listSessions(req.user.id)
  }

  @UseGuards(AuthGuard)
  @Post('revoke')
  revoke(@Req() req: any, @Body() dto: { tokenId: string }) {
    return this.auth.revokeOne(req.user.id, dto.tokenId)
  }

  @UseGuards(AuthGuard)
  @Post('mfa/setup')
  mfaSetup(@Req() req: any) {
    return this.auth.mfaSetup(req.user.id)
  }

  @UseGuards(AuthGuard)
  @Post('mfa/verify')
  mfaVerify(@Req() req: any, @Body() dto: { code: string }) {
    return this.auth.mfaVerify(req.user.id, dto.code)
  }

  @UseGuards(AuthGuard)
  @Post('mfa/disable')
  mfaDisable(@Req() req: any, @Body() dto: { code: string }) {
    return this.auth.mfaDisable(req.user.id, dto.code)
  }
}

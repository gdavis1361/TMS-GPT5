import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { IsEmail, IsString, Matches, MinLength } from 'class-validator'

class CredentialsDto {
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message: 'Password must include upper, lower, number, and symbol',
  })
  password!: string
}

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  signup(@Body() dto: CredentialsDto) {
    return this.auth.signup(dto.email, dto.password)
  }

  @Post('login')
  login(@Body() dto: CredentialsDto) {
    return this.auth.login(dto.email, dto.password)
  }

  @Post('refresh')
  refresh(@Body() dto: { userId: string; refresh_token: string }) {
    return this.auth.refresh(dto.userId, dto.refresh_token)
  }

  @Post('logout')
  logout(@Body() dto: { userId: string }) {
    return this.auth.revokeAll(dto.userId)
  }

  @Post('request-email-verification')
  requestEmailVerification(@Body() dto: { email: string }) {
    return this.auth.requestEmailVerification(dto.email)
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: { email: string; token: string }) {
    return this.auth.verifyEmail(dto.email, dto.token)
  }

  @Post('request-password-reset')
  requestPasswordReset(@Body() dto: { email: string }) {
    return this.auth.requestPasswordReset(dto.email)
  }

  @Post('reset-password')
  resetPassword(@Body() dto: { email: string; token: string; newPassword: string }) {
    return this.auth.resetPassword(dto.email, dto.token, dto.newPassword)
  }
}

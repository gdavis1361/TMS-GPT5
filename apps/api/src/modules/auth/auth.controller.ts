import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { IsEmail, IsString, MinLength } from 'class-validator'

class CredentialsDto {
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
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
}

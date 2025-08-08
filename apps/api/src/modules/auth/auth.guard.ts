import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const req: any = context.switchToHttp().getRequest()
    const header = (req.headers['authorization'] || '') as string
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) throw new UnauthorizedException('Missing token')
    try {
      const payload = await this.jwt.verifyAsync(token)
      req.user = { id: payload.sub }
      return true
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }
}

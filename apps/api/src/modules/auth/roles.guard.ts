import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from '../../prisma/prisma.service'

export const Roles = (...roles: string[]) => SetMetadata('roles', roles)

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler()) || []
    if (roles.length === 0) return true
    const req: any = context.switchToHttp().getRequest()
    const userId = req.user?.id
    if (!userId) throw new ForbiddenException('No user context')
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new ForbiddenException('No user')
    if (!roles.includes(user.role)) throw new ForbiddenException('Insufficient role')
    return true
  }
}

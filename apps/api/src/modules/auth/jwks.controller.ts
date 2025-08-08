import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common'
import { createPublicKey, createHash } from 'node:crypto'

@Controller({ path: '.well-known', version: '1' })
export class JwksController {
  @Get('jwks.json')
  getJwks() {
    const pem = process.env.JWT_PUBLIC_KEY || (process.env.JWT_PUBLIC_KEY_FILE ? require('node:fs').readFileSync(process.env.JWT_PUBLIC_KEY_FILE, 'utf8') : undefined)
    if (!pem) return { keys: [] }
    const jwk = createPublicKey(pem).export({ format: 'jwk' }) as any
    const kid = process.env.JWT_KID || createHash('sha256').update(pem).digest('hex')
    return {
      keys: [
        {
          kty: jwk.kty,
          n: jwk.n,
          e: jwk.e,
          alg: 'RS256',
          use: 'sig',
          kid,
        },
      ],
    }
  }
}



// Minimal fetch wrapper + types from openapi-typescript schema
const fs = require('node:fs')
const path = require('node:path')

const out = `// Auto-generated lightweight client
import type { paths } from '../src/api/schema'

type Fetcher = (input: RequestInfo, init?: RequestInit) => Promise<Response>

const defaultFetcher: Fetcher = (input, init) => fetch(input, init)

export function createApiClient(baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', fetcher: Fetcher = defaultFetcher) {
  async function get<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetcher(baseUrl + url, { ...init, method: 'GET', headers: { 'content-type': 'application/json', ...(init?.headers||{}) } })
    if (!res.ok) throw await res.json().catch(() => new Error(res.statusText))
    return res.json() as Promise<T>
  }
  async function post<T>(url: string, body?: any, init?: RequestInit): Promise<T> {
    const res = await fetcher(baseUrl + url, { ...init, method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', ...(init?.headers||{}) } })
    if (!res.ok) throw await res.json().catch(() => new Error(res.statusText))
    return res.json() as Promise<T>
  }
  return { get, post }
}
`

fs.mkdirSync(path.join(__dirname, '..', 'src', 'api'), { recursive: true })
fs.writeFileSync(path.join(__dirname, '..', 'src', 'api', 'client.ts'), out)
console.log('Generated client at src/api/client.ts')



"use client"
import { useQuery } from '@tanstack/react-query'
import { createApiClient } from '../../api/client'

export default function Example() {
  const api = createApiClient(process.env.NEXT_PUBLIC_API_URL)
  const { data, isLoading, error } = useQuery({
    queryKey: ['ready'],
    queryFn: () => api.get<string>('/v1/ready'),
  })
  return (
    <main className="p-6">
      <h2 className="text-xl font-semibold">API Ready</h2>
      {isLoading && <p>Loading…</p>}
      {error && <p className="text-red-600">{String((error as any)?.message || 'Error')}</p>}
      {data && <pre className="text-sm mt-2">{JSON.stringify(data, null, 2)}</pre>}
    </main>
  )
}



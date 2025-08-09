"use client"
import { useQuery } from '@tanstack/react-query'
import { createApiClient } from '../../api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function Example() {
  const api = createApiClient(process.env.NEXT_PUBLIC_API_URL)
  const { data, isLoading, error } = useQuery({
    queryKey: ['ready'],
    queryFn: () => api.get<string>('/v1/ready'),
  })
  return (
    <main className="p-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>API Ready</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint</Label>
            <Input id="endpoint" value="/v1/ready" readOnly />
          </div>
          <div className="space-y-2">
            <Label>Result</Label>
            {isLoading && <p>Loading…</p>}
            {error && <p className="text-red-600">{String((error as any)?.message || 'Error')}</p>}
            {data && <pre className="text-sm mt-2">{JSON.stringify(data, null, 2)}</pre>}
          </div>
          <Button onClick={() => void refetch()}>Refetch</Button>
        </CardContent>
      </Card>
    </main>
  )
}



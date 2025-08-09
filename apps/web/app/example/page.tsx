"use client"
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { createApiClient } from '../../src/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectItem } from '@/components/ui/select'

export default function Example() {
  const api = createApiClient(process.env.NEXT_PUBLIC_API_URL)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ready'],
    queryFn: () => api.get<string>('/v1/ready'),
  })
  const [env, setEnv] = useState<string>('development')
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
            <Label htmlFor="env">Environment</Label>
            <Select value={env} onValueChange={setEnv} placeholder="Select environment">
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Add a note about this call…" />
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



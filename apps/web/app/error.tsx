"use client"
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <html>
      <body className="p-8">
        <div className="max-w-md space-y-4">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  )
}



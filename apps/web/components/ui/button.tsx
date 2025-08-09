"use client"
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/app/../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref as any}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2',
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'



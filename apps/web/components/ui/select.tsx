"use client"
import * as React from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { cn } from '@/app/../lib/utils'

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children?: React.ReactNode
}

export function Select({ value, onValueChange, placeholder, children }: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        className={cn(
          'inline-flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="z-50 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <RadixSelect.Item
      value={value}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'focus:bg-accent focus:text-accent-foreground',
      )}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  )
}



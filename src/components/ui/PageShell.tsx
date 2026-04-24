"use client"

import React from 'react'
import { cn } from '@/lib/utils'

export default function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-[72vh] flex items-start justify-center px-4 py-12 bg-[var(--bg)]', className)}>
      <div className="w-full max-w-4xl">
        {children}
      </div>
    </div>
  )
}

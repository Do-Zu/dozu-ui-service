"use client"

import React from 'react'
import { cn } from '@/lib/utils' // nếu có classnames helper, không có thì dùng className trực tiếp

interface SpinnerProps {
  size?: number
  className?: string
}

export default function Spinner({ size = 40, className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'border-4 border-dashed rounded-full animate-spin border-primary',
        className
      )}
      style={{ width: size, height: size }}
    />
  )
}

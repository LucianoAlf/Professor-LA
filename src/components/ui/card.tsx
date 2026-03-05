import React from 'react'

type DivProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className = '', ...props }: DivProps) {
  return <div className={`bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 ${className}`} {...props} />
}

export function CardHeader({ className = '', ...props }: DivProps) {
  return <div className={`mb-3.5 ${className}`} {...props} />
}

export function CardTitle({ className = '', ...props }: DivProps) {
  return <div className={`text-[11px] font-bold text-[var(--txt3)] tracking-[1.5px] uppercase ${className}`} {...props} />
}

export function CardContent({ className = '', ...props }: DivProps) {
  return <div className={className} {...props} />
}

import React from 'react'

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const variantClass =
    variant === 'success'
      ? 'bg-[rgba(26,110,66,0.14)] text-[var(--green)] border-[rgba(26,110,66,0.25)]'
      : variant === 'warning'
      ? 'bg-[rgba(200,151,58,0.14)] text-[var(--gold)] border-[rgba(200,151,58,0.25)]'
      : variant === 'danger'
      ? 'bg-[rgba(166,28,28,0.12)] text-[var(--red)] border-[rgba(166,28,28,0.25)]'
      : 'bg-[rgba(45,90,160,0.12)] text-[var(--ink3)] border-[rgba(45,90,160,0.25)]'

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${variantClass} ${className}`}
      {...props}
    />
  )
}

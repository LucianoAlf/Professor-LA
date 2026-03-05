import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-mono text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  )
})

Input.displayName = 'Input'

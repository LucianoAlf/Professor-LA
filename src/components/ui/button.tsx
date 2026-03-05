import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const variantClass =
      variant === 'outline'
        ? 'bg-[var(--btn-ghost-bg)] text-[var(--btn-ghost-color)] border border-[var(--btn-ghost-border)] hover:bg-[var(--btn-ghost-hover)] hover:text-[var(--txt)]'
        : 'bg-[var(--gold)] text-[var(--ink)] border border-transparent hover:bg-[var(--goldD)]'

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-[0.3px] cursor-pointer transition-all duration-150 font-sans disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${className}`}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

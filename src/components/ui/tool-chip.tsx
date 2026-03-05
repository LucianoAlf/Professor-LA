import React from 'react';

interface ToolChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  danger?: boolean;
}

export const ToolChip = React.forwardRef<HTMLButtonElement, ToolChipProps>(
  ({ className = '', active = false, danger = false, ...props }, ref) => {
    const toneClass = danger
      ? 'border-[rgba(166,28,28,0.32)] text-[var(--red)] hover:bg-[rgba(166,28,28,0.12)]'
      : active
      ? 'border-[var(--gold)] text-[var(--gold)] bg-[rgba(200,151,58,0.12)]'
      : 'border-[var(--btn-ghost-border)] text-[var(--btn-ghost-color)] hover:bg-[var(--btn-ghost-hover)] hover:text-[var(--txt)]';

    return (
      <button
        ref={ref}
        className={`inline-flex h-8 items-center justify-center rounded-full border px-2.5 transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${toneClass} ${className}`}
        {...props}
      />
    );
  }
);

ToolChip.displayName = 'ToolChip';

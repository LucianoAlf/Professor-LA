import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <label
      className={`inline-flex items-center gap-2 text-xs text-[var(--txt2)] select-none ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      } ${className}`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={`flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors ${
          checked
            ? 'border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)]'
            : 'border-[var(--input-border)] bg-[var(--input-bg)] text-transparent hover:border-[var(--gold)]/70'
        }`}
      >
        <Check className="h-3 w-3" />
      </button>
      <span>{label}</span>
    </label>
  );
};

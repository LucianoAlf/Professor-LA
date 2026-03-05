import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = 'Selecione',
  disabled = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(() => options.find((option) => option.value === value), [options, value]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="h-10 w-full rounded-md border border-[var(--input-border)] bg-[var(--bg2)] px-3 text-sm text-[var(--txt)] outline-none transition-colors focus:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left">{selectedOption?.label ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-[var(--txt3)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-[120] max-h-56 w-full overflow-auto rounded-md border border-[var(--input-border)] bg-[var(--bg)] p-1 shadow-[0_16px_32px_rgba(0,0,0,0.5)]"
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return;
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? 'bg-[rgba(200,151,58,0.28)] text-[var(--txt)]'
                    : 'text-[var(--txt2)] hover:bg-[rgba(255,255,255,0.08)]'
                } disabled:cursor-not-allowed disabled:opacity-50`}
                role="option"
                aria-selected={isSelected}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="h-4 w-4 text-[var(--gold)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

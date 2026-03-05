import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-[140] w-max -translate-x-1/2 translate-y-1 rounded-md border border-[var(--input-border)] bg-[var(--bg)] px-2 py-1 text-[11px] font-medium text-[var(--txt2)] opacity-0 shadow-[0_10px_24px_rgba(0,0,0,0.45)] transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        {content}
      </div>
    </div>
  );
};

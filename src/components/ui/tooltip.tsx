import React, { useState, useRef } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  if (!content) return <>{children}</>;

  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    }
    setVisible(true);
  };

  return (
    <div
      ref={ref}
      className="w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="pointer-events-none fixed z-[9999] w-max -translate-y-1/2 rounded-md border border-[var(--input-border)] bg-[var(--bg)] px-2 py-1 text-[11px] font-medium text-[var(--txt2)] shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
          style={{ top: pos.top, left: pos.left }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

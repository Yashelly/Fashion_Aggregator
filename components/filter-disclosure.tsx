"use client";

import { SlidersHorizontal } from "lucide-react";
import { useRef, useState } from "react";

export function FilterDisclosure({ label, defaultOpen, children }: { label: string; defaultOpen: boolean; children: React.ReactNode }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      className="advanced-filters"
      open={open}
      ref={detailsRef}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !detailsRef.current?.open) return;
        event.preventDefault();
        setOpen(false);
        summaryRef.current?.focus();
      }}
    >
      <summary ref={summaryRef}>
        <SlidersHorizontal aria-hidden="true" size={18} />
        {label}
      </summary>
      {children}
    </details>
  );
}

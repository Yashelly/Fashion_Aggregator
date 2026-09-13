"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, type KeyboardEvent } from "react";

type Option = { value: string; label: string; optionLabel?: string; disabled?: boolean };

/** A disclosure of ordinary choice buttons, not an OS select or a simulated combobox. */
export function OptionPicker({ label, value, options, name, className = "", showLabel = false, onChange }: {
  label: string; value: string; options: Option[]; name?: string; className?: string;
  showLabel?: boolean; onChange?: (value: string) => void;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  const panelId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  function close(restoreFocus = false) {
    if (!details.current?.open) return;
    details.current.open = false;
    if (restoreFocus) details.current.querySelector("summary")?.focus();
  }

  useEffect(() => {
    const element = details.current;
    function outside(event: PointerEvent) {
      if (element?.open && event.target instanceof Node && !element.contains(event.target)) element.open = false;
    }
    function resized() { if (element?.open) element.open = false; }
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", resized);
    return () => { document.removeEventListener("pointerdown", outside); window.removeEventListener("resize", resized); };
  }, []);

  function navigate(event: KeyboardEvent<HTMLDetailsElement>) {
    const element = details.current;
    if (!element) return;
    if (event.key === "Escape" && element.open) {
      event.preventDefault(); event.stopPropagation(); close(true); return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const choices = [...element.querySelectorAll<HTMLButtonElement>(".picker-options button:not(:disabled)")];
    if (!choices.length) return;
    event.preventDefault();
    const current = choices.indexOf(document.activeElement as HTMLButtonElement);
    element.open = true;
    const next = event.key === "Home" ? 0 : event.key === "End" ? choices.length - 1
      : current < 0 ? (event.key === "ArrowUp" ? choices.length - 1 : 0)
      : (current + (event.key === "ArrowUp" ? -1 : 1) + choices.length) % choices.length;
    choices[next].focus();
  }

  return <details ref={details} className={`option-picker ${className}`} data-value={value} name="catalog-picker"
    onKeyDown={navigate} onBlur={(event) => {
      if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) close();
    }}>
    <summary aria-label={`${label}: ${selected?.label ?? value}`} aria-controls={panelId}>
      {showLabel && <span className="picker-label">{label}:</span>}
      <span className="picker-value">{selected?.label ?? value}</span><ChevronDown aria-hidden="true" size={14} />
    </summary>
    <div className="picker-options" id={panelId} role="group" aria-label={label}>
      {options.map((option) => <button key={option.value} type={name ? "submit" : "button"} name={name} value={option.value}
        data-value={option.value} disabled={option.disabled} aria-pressed={option.value === value}
        onClick={() => { onChange?.(option.value); close(true); }}>
        <span>{option.optionLabel ?? option.label}</span><Check aria-hidden="true" size={15} />
      </button>)}
    </div>
  </details>;
}

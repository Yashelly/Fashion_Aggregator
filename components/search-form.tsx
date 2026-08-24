"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";

/** How long the pre-navigation animation is held before the route changes. */
const REVEAL_MS = 620;

/**
 * The catalog search/filter form.
 *
 * A plain `<form action="/search">` works with JavaScript disabled (a native GET
 * submit), but that is a *full page reload* with no feedback. When JS is
 * available we progressively enhance it: on submit we play a short, deliberate
 * "searching" animation (a progress bar + button spinner) and only *then*
 * soft-navigate to the results.
 *
 * The deliberate delay is the whole point. An earlier version relied on
 * `useTransition`'s pending flag alone, but a same-route soft navigation to
 * /search resolves in a few milliseconds (the catalog is cached in memory), so
 * the pending state flashed too briefly to ever be seen — "works in the code,
 * not in practice". Holding the animation for REVEAL_MS guarantees it is
 * visible before the page changes. `prefers-reduced-motion` skips the hold.
 */
export function SearchForm({
  action,
  className,
  role,
  children,
}: {
  action: string;
  className?: string;
  role?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [revealing, setRevealing] = useState(false);
  // Only one reveal timer is ever alive at a time (each submit clears the
  // prior). A scalar ref read live in cleanup avoids the stale-snapshot trap of
  // capturing an array by value at mount — otherwise an away-click within
  // REVEAL_MS would unmount the form yet still fire a delayed router.push.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function submitForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      const text = typeof value === "string" ? value.trim() : "";
      if (text) params.set(key, text);
    }
    const href = `${action}${params.size ? `?${params}` : ""}`;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduce ? 0 : REVEAL_MS;

    // Show the animation now; navigate once it has played.
    if (timer.current) clearTimeout(timer.current);
    setRevealing(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      // Hand the "busy" look off to the transition's pending flag for the
      // (brief) fetch, so there is never a stuck spinner even if that flag is
      // batched away — `revealing` is already cleared here deterministically.
      startTransition(() => router.push(href, { scroll: false }));
      setRevealing(false);
    }, delay);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitForm(event.currentTarget);
  }

  // Dropdown filters apply on change — shoppers expect a filter to take effect
  // the moment they pick it, not only after pressing "Show results" (which the
  // free-text query still uses, so typing does not fire a search per keystroke).
  function handleChange(event: React.ChangeEvent<HTMLFormElement>) {
    if (event.target instanceof HTMLSelectElement) {
      submitForm(event.currentTarget);
    }
  }

  const busy = revealing || pending;

  return (
    <form
      action={action}
      aria-busy={busy || undefined}
      className={className}
      data-pending={busy || undefined}
      onChange={handleChange}
      onSubmit={handleSubmit}
      role={role}
    >
      <span aria-hidden="true" className="search-progress" />
      {children}
    </form>
  );
}

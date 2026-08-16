"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";

/**
 * The catalog search/filter form. A plain `<form action="/search">` works with
 * JavaScript disabled (a native GET submit), but that is a *full page reload* —
 * the browser tears down and repaints the whole document, which reads as an
 * abrupt "teleport" with no feedback. When JS is available we progressively
 * enhance it into an App Router soft navigation: same URL, but React swaps only
 * what changed, `useTransition` gives us a pending flag for the button/results,
 * and the results can animate in. `data-pending` is the styling hook.
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      const text = typeof value === "string" ? value.trim() : "";
      if (text) params.set(key, text);
    }
    const href = `${action}${params.size ? `?${params}` : ""}`;
    startTransition(() => router.push(href, { scroll: false }));
  }

  return (
    <form
      action={action}
      aria-busy={pending || undefined}
      className={className}
      data-pending={pending || undefined}
      onSubmit={handleSubmit}
      role={role}
    >
      {children}
    </form>
  );
}

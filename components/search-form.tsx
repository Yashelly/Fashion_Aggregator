"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition, type ReactNode } from "react";
import { useLocaleContext } from "@/lib/use-client-locale";

/** Native GET is the baseline; enhancement reflects only actual navigation work. */
export function SearchForm({ action, className, role, children }: {
  action: string; className?: string; role?: string; children: ReactNode;
}) {
  const router = useRouter();
  const { getNavigationLocale } = useLocaleContext();
  const [pending, startTransition] = useTransition();
  const pendingHref = useRef("");
  useEffect(() => { if (!pending) pendingHref.current = ""; }, [pending]);
  function submit(form: HTMLFormElement, submitter: HTMLElement | null) {
    if (!form.reportValidity()) return;
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form, submitter)) {
      if (typeof value === "string" && value.trim()) params.append(key, value.trim());
    }
    // A language click and submit can share one task. Hidden inputs still
    // contain the old render; stamp both EN and LT from synchronous intent.
    params.set("lang", getNavigationLocale());
    const href = `${action}${params.size ? `?${params}` : ""}`;
    if (pendingHref.current === href) return;
    pendingHref.current = href;
    startTransition(() => router.push(href, { scroll: false }));
  }
  return <form action={action} method="get" className={className} role={role}
    aria-busy={pending || undefined} data-pending={pending || undefined}
    onSubmit={(event) => { event.preventDefault(); submit(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter); }}>
    {children}
  </form>;
}

"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";

/** Never substitute a different garment when a catalog image fails. */
export function ProductImage({ src, alt, unavailableLabel, sizes, eager = false }: {
  src?: string | null; alt: string; unavailableLabel: string; sizes: string; eager?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) return <span className="image-fallback" role="img" aria-label={`${alt}. ${unavailableLabel}`}>
    <ImageOff aria-hidden="true" size={28} /><span>{unavailableLabel}</span>
  </span>;
  return <Image src={src} alt={alt} fill sizes={sizes} loading={eager ? "eager" : "lazy"}
    fetchPriority={eager ? "high" : undefined} onError={() => setFailedSrc(src)} />;
}

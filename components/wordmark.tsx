"use client";

import { useEffect, useRef } from "react";

/**
 * The Weft wordmark.
 *
 * Renders lowercase `weft`. A hidden lowercase `i` lives between `f` and `t`
 * inside the rust `fit`; when `animate` is set, a gap opens and the `i` drops
 * straight in, so the mark reads `wefit` — "we fit" — before settling back to
 * `weft`. This is the whole reason the brand is lowercase: an uppercase `WEFIT`
 * has a full-height `I` and loses the trick.
 *
 * Sizing is inherited: the component works in `em`, so each surface sets its
 * own `font-size` on (or above) the element. Spacing is tuned for an even
 * w–e–f–t rhythm and verified against rendered screenshots — the resting f–t
 * gap matches the e–f gap, and `w` is pulled a hair toward `e`.
 *
 * Accessibility: the mark is a single `role="img"` named "weft", so the reveal
 * is decorative and assistive tech always reads the brand, not "wefit". Under
 * `prefers-reduced-motion` it simply stays resting `weft` with no motion.
 */
type WordmarkProps = {
  className?: string;
  /** Play the i-reveal. Off = static `weft` (header, footer). */
  animate?: boolean;
  /** When an animated mark plays: on mount, or when it scrolls into view. */
  trigger?: "load" | "inview";
};

export function Wordmark({ className, animate = false, trigger = "load" }: WordmarkProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const slot = root.querySelector<HTMLElement>(".wm-islot");
    const ichar = root.querySelector<HTMLElement>(".wm-ichar");
    if (!slot || !ichar) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Open the gap to exactly one glyph advance, measured from the real font.
    const measure = () => {
      const w = ichar.getBoundingClientRect().width;
      if (w) slot.style.setProperty("--wm-iw", `${w.toFixed(2)}px`);
    };

    let timers: ReturnType<typeof setTimeout>[] = [];
    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    const play = () => {
      if (reduce) return; // resting `weft`, no motion
      clear();
      ichar.classList.remove("is-in", "is-out");
      slot.classList.remove("is-open", "is-shut");
      void root.offsetWidth;

      const SETTLE = 300; // gap opened + i landed
      const HOLD = 1200; // hold "wefit"
      const FALL = 320; // gap closed + i fell out

      slot.classList.add("is-open");
      ichar.classList.add("is-in");
      timers.push(
        setTimeout(() => {
          ichar.classList.remove("is-in");
          ichar.classList.add("is-out");
          slot.classList.add("is-shut");
          slot.classList.remove("is-open");
        }, SETTLE + HOLD),
        setTimeout(() => {
          ichar.classList.remove("is-out");
          slot.classList.remove("is-shut");
        }, SETTLE + HOLD + FALL + 120),
      );
    };

    let cleanup = () => {};
    const start = () => {
      measure();
      if (!animate) return;
      if (trigger === "inview" && "IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              play();
              io.disconnect();
            }
          },
          { threshold: 0.6 },
        );
        io.observe(root);
        cleanup = () => io.disconnect();
      } else {
        const id = setTimeout(play, 400);
        timers.push(id);
      }
    };

    // Measure once the display font is actually laid out.
    if (document.fonts?.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }
    window.addEventListener("resize", measure);

    return () => {
      clear();
      cleanup();
      window.removeEventListener("resize", measure);
    };
  }, [animate, trigger]);

  return (
    <span ref={ref} className={["wordmark", className].filter(Boolean).join(" ")} role="img" aria-label="weft">
      <span className="wm-lead">w</span>e<span className="wm-fit">f<span className="wm-islot"><span className="wm-ichar">i</span></span>t</span>
    </span>
  );
}

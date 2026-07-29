"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type SubmitEvent,
} from "react";
import { useRouter } from "next/navigation";

type Locale = "en" | "lt";
type LoadingPhase = "idle" | "searching" | "found";
type ItemKind = "sock" | "shirt" | "shoe" | "hat" | "bag" | "dress";
type ThrowSide = -1 | 1;
type LoadingMascotController = {
  finish: () => void;
  start: () => void;
};

const LoadingMascotContext = createContext<LoadingMascotController | null>(null);
const ITEMS: ItemKind[] = ["sock", "shirt", "shoe", "hat", "bag", "dress"];
const SHOW_DELAY_MS = 180;
const FOUND_DURATION_MS = 560;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function ItemShape({ kind }: { kind: ItemKind }) {
  switch (kind) {
    case "sock":
      return <path d="M102 47v20c0 8 6 13 14 13h8c7 0 11-4 11-10v-5h-13V47z" />;
    case "shirt":
      return <path d="m97 53 14-7h18l14 7 8 14-12 6-6-10v26h-28V63l-6 10-12-6z" />;
    case "shoe":
      return <path d="M91 72c10-1 17-8 23-18l12 9c4 4 10 7 18 9l5 10H98c-5 0-8-4-7-10Z" />;
    case "hat":
      return (
        <>
          <path d="M99 75v-7c0-13 9-22 22-22s22 9 22 22v7" />
          <path d="M94 75h54v10H94zM105 47l-3-6M114 44l-1-7M124 44l1-7M134 48l3-6" />
        </>
      );
    case "bag":
      return (
        <>
          <path d="M95 62h52l5 28H90z" />
          <path d="M105 63c0-12 6-18 16-18s16 6 16 18" />
        </>
      );
    case "dress":
      return <path d="M110 45h22l2 13-7 8 16 24H99l16-24-7-8z" />;
  }
}

function Diamond() {
  return (
    <g className="loading-mascot-diamond" aria-hidden="true">
      <path d="m78 48 16-18h32l16 18-32 38z" />
      <path d="m78 48 32 38 32-38M94 30l16 56 16-56M78 48h64M94 30l16 18 16-18" />
      <path d="M66 32v12M60 38h12M151 25v14M144 32h14M151 67v12M145 73h12" />
    </g>
  );
}

function MascotSvg({ phase }: { phase: Exclude<LoadingPhase, "idle"> }) {
  const reducedMotion = useReducedMotion();
  const [item, setItem] = useState<ItemKind>(() => ITEMS[Math.floor(Math.random() * ITEMS.length)]);
  const [side, setSide] = useState<ThrowSide>(() => (Math.random() > 0.5 ? 1 : -1));
  const robotRef = useRef<SVGGElement>(null);
  const itemRef = useRef<SVGGElement>(null);
  const frontFlapRef = useRef<SVGPathElement>(null);
  const diamondRef = useRef<SVGGElement>(null);
  const cycleRef = useRef(0);

  useEffect(() => {
    const cycle = ++cycleRef.current;
    const animations: Animation[] = [];
    const animate = (
      element: Element | null,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
    ) => {
      if (!element) return null;
      const animation = element.animate(keyframes, options);
      animations.push(animation);
      return animation;
    };

    if (reducedMotion) {
      if (itemRef.current) itemRef.current.style.opacity = "0";
      if (diamondRef.current) diamondRef.current.style.opacity = phase === "found" ? "1" : "0";
      return () => {
        animations.forEach((animation) => animation.cancel());
      };
    }

    if (phase === "found") {
      if (itemRef.current) itemRef.current.style.opacity = "0";
      animate(
        robotRef.current,
        [
          { transform: "translateY(0)" },
          { transform: "translateY(28px)", offset: 0.23 },
          { transform: "translateY(-8px)", offset: 0.68 },
          { transform: "translateY(0)" },
        ],
        { duration: 440, easing: "cubic-bezier(.3,.8,.2,1)", fill: "both" },
      );
      animate(
        diamondRef.current,
        [
          { opacity: 0, transform: "translateY(22px) scale(.35)" },
          { opacity: 0, transform: "translateY(22px) scale(.35)", offset: 0.3 },
          { opacity: 1, transform: "translateY(-3px) scale(1.08)", offset: 0.75 },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        { duration: 460, easing: "cubic-bezier(.2,.9,.25,1.25)", fill: "both" },
      );
      animate(
        frontFlapRef.current,
        [
          { transform: "rotate(0deg)" },
          { transform: "rotate(3deg)", offset: 0.48 },
          { transform: "rotate(-2deg)", offset: 0.72 },
          { transform: "rotate(0deg)" },
        ],
        { duration: 430, easing: "ease-out", fill: "both" },
      );
    } else {
      const direction = side;
      const robotAnimation = animate(
        robotRef.current,
        [
          { transform: "translate(0, 0) rotate(0deg)" },
          { transform: `translate(${direction * 7}px, 4px) rotate(${direction * 9}deg)`, offset: 0.32 },
          { transform: `translate(${direction * 11}px, -3px) rotate(${direction * 13}deg)`, offset: 0.58 },
          { transform: "translate(0, 0) rotate(0deg)" },
        ],
        { duration: 860, easing: "cubic-bezier(.45,0,.2,1)", fill: "both" },
      );
      animate(
        itemRef.current,
        [
          { opacity: 0, transform: "translate(0, 18px) rotate(0deg) scale(.72)" },
          { opacity: 1, transform: `translate(${direction * 8}px, 2px) rotate(${direction * 5}deg) scale(.9)`, offset: 0.26 },
          { opacity: 1, transform: `translate(${direction * 66}px, -58px) rotate(${direction * 24}deg) scale(1)`, offset: 0.76 },
          { opacity: 0, transform: `translate(${direction * 88}px, -34px) rotate(${direction * 38}deg) scale(.96)` },
        ],
        { duration: 860, easing: "cubic-bezier(.35,.1,.25,1)", fill: "both" },
      );
      animate(
        frontFlapRef.current,
        [
          { transform: "rotate(0deg)" },
          { transform: `rotate(${direction * -2.5}deg)`, offset: 0.52 },
          { transform: "rotate(0deg)" },
        ],
        { duration: 680, easing: "ease-out", fill: "both" },
      );

      robotAnimation?.finished
        .then(() => {
          if (cycle !== cycleRef.current) return;
          setItem((current) => {
            const candidates = ITEMS.filter((candidate) => candidate !== current);
            return candidates[Math.floor(Math.random() * candidates.length)];
          });
          setSide((current) => (current === 1 ? -1 : 1));
        })
        .catch(() => undefined);
    }

    return () => {
      cycleRef.current += 1;
      animations.forEach((animation) => animation.cancel());
    };
  }, [item, phase, reducedMotion, side]);

  return (
    <svg
      aria-hidden="true"
      className="loading-mascot-svg"
      focusable="false"
      viewBox="0 0 220 180"
    >
      <g className="loading-mascot-ink">
        <path className="loading-mascot-paper" d="m43 91 15-19 50-7 57 7 19 18-24 20H67z" />
        <path className="loading-mascot-inside" d="m43 91 55-17 86 16-29 24H66z" />
        <path d="m56 83-25-13-20 14 32 7M164 82l25-12 20 15-25 5" />
      </g>

      <g className="loading-mascot-robot" ref={robotRef}>
        <rect className="loading-mascot-paper" height="62" rx="18" width="68" x="76" y="39" />
        {phase === "found" ? (
          <path d="M92 70c3-5 8-5 11 0M117 70c3-5 8-5 11 0" />
        ) : (
          <>
            <circle className="loading-mascot-eye" cx="98" cy="69" r="4.5" />
            <circle className="loading-mascot-eye" cx="122" cy="69" r="4.5" />
          </>
        )}
        <path d="M89 96 73 86M131 96l17-12" />
        <circle className="loading-mascot-paper" cx="71" cy="85" r="6" />
        <circle className="loading-mascot-paper" cx="150" cy="82" r="6" />
      </g>

      <g className="loading-mascot-item loading-mascot-paper" ref={itemRef}>
        <ItemShape kind={item} />
      </g>

      <g className="loading-mascot-ink">
        <path className="loading-mascot-paper" d="m43 91 24 18-7 52-20-14z" />
        <path className="loading-mascot-paper" d="m159 110 25-20 22 16-20 23z" />
        <path className="loading-mascot-paper" d="m60 108 99 2-4 52-95-1z" />
        <path
          className="loading-mascot-paper loading-mascot-front-flap"
          d="m43 91 116 19-18 25-118-20z"
          ref={frontFlapRef}
        />
        <path d="m159 110 27 19-2 37-29-4M60 108l-20-17-17 24" />
      </g>

      <g className="loading-mascot-found" ref={diamondRef}>
        <Diamond />
      </g>
    </svg>
  );
}

export function LoadingMascotProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const [phase, setPhase] = useState<LoadingPhase>("idle");
  const phaseRef = useRef<LoadingPhase>("idle");
  const pendingRef = useRef(0);
  const navigationOriginRef = useRef<Element | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setCurrentPhase = useCallback((nextPhase: LoadingPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const clearTimer = (timerRef: typeof showTimerRef) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = useCallback(() => {
    if (pendingRef.current > 0) return;
    pendingRef.current = 1;
    navigationOriginRef.current = document.querySelector("#main-content")?.firstElementChild ?? null;

    clearTimer(hideTimerRef);
    if (phaseRef.current !== "idle") {
      setCurrentPhase("searching");
      return;
    }

    clearTimer(showTimerRef);
    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null;
      if (pendingRef.current > 0) setCurrentPhase("searching");
    }, SHOW_DELAY_MS);
  }, [setCurrentPhase]);

  const finish = useCallback(() => {
    pendingRef.current = Math.max(0, pendingRef.current - 1);
    if (pendingRef.current > 0) return;

    clearTimer(showTimerRef);
    if (phaseRef.current === "idle") return;

    setCurrentPhase("found");
    clearTimer(hideTimerRef);
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      if (pendingRef.current === 0) setCurrentPhase("idle");
    }, FOUND_DURATION_MS);
  }, [setCurrentPhase]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (pendingRef.current === 0) return;
      const currentRoot = document.querySelector("#main-content")?.firstElementChild ?? null;
      if (currentRoot?.classList.contains("route-loading-space")) return;
      if (currentRoot !== navigationOriginRef.current) finish();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      clearTimer(showTimerRef);
      clearTimer(hideTimerRef);
    };
  }, [finish]);

  const controller = useMemo(() => ({ finish, start }), [finish, start]);
  const status = phase === "found"
    ? locale === "lt" ? "Radau!" : "Found it!"
    : locale === "lt" ? "Ieškau tinkamo daikto…" : "Looking for the right piece…";

  return (
    <LoadingMascotContext.Provider value={controller}>
      {children}
      {phase !== "idle" ? (
        <div
          aria-atomic="true"
          aria-live="polite"
          className={`loading-mascot-layer is-${phase}`}
          role="status"
        >
          <MascotSvg phase={phase} />
          <span className="sr-only">{status}</span>
        </div>
      ) : null}
    </LoadingMascotContext.Provider>
  );
}

export function MascotSearchForm({
  children,
  onSubmit,
  ...props
}: ComponentPropsWithoutRef<"form">) {
  const controller = useContext(LoadingMascotContext);
  const router = useRouter();

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    onSubmit?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();

    const params = new URLSearchParams();
    new FormData(event.currentTarget).forEach((value, key) => {
      if (typeof value === "string" && value) params.append(key, value);
    });

    controller?.start();
    router.push(`/search${params.size ? `?${params}` : ""}`);
  };

  return (
    <form {...props} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

export function RouteLoadingFallback({ label }: { label: string }) {
  return (
    <div aria-busy="true" className="route-shell route-loading-space">
      <p className="sr-only" role="status">{label}</p>
    </div>
  );
}

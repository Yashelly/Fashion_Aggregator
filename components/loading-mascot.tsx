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
const MIN_SEARCHING_DURATION_MS = 520;
const FOUND_DURATION_MS = 720;
const MAX_SEARCH_DURATION_MS = 6_500;

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
      return <path d="M104 40v27c0 8 6 13 14 13h10c7 0 11-4 11-10v-7h-16V40z" />;
    case "shirt":
      return <path d="m96 50 15-8h20l15 8 10 16-14 7-7-11v29h-30V62l-7 11-14-7z" />;
    case "shoe":
      return <path d="M88 72c11-1 20-9 27-22l13 11c5 5 12 8 21 10l6 13H97c-7 0-11-5-9-12Z" />;
    case "hat":
      return (
        <>
          <path d="M97 74v-7c0-15 10-25 24-25s24 10 24 25v7" />
          <path d="M90 74h62v12H90z" />
        </>
      );
    case "bag":
      return (
        <>
          <path d="M91 60h60l6 32H85z" />
          <path d="M103 61c0-14 7-21 18-21s18 7 18 21" />
        </>
      );
    case "dress":
      return <path d="M108 39h26l3 16-8 10 18 29H95l18-29-8-10z" />;
  }
}

function Diamond() {
  return (
    <g className="loading-mascot-diamond" aria-hidden="true" transform="translate(0 -18)">
      <path d="m84 34 13-15h26l13 15-26 36z" />
      <path d="m84 34 26 36 26-36M97 19l13 51 13-51M84 34h52M97 19l13 15 13-15" />
      <path d="M75 20v10M70 25h10M145 24v11M140 29h10" />
    </g>
  );
}

function MascotSvg({ phase }: { phase: Exclude<LoadingPhase, "idle"> }) {
  const reducedMotion = useReducedMotion();
  const [item, setItem] = useState<ItemKind>(() => ITEMS[Math.floor(Math.random() * ITEMS.length)]);
  const [side, setSide] = useState<ThrowSide>(() => (Math.random() > 0.5 ? 1 : -1));
  const robotRef = useRef<SVGGElement>(null);
  const itemRef = useRef<SVGGElement>(null);
  const leftArmRef = useRef<SVGGElement>(null);
  const rightArmRef = useRef<SVGGElement>(null);
  const backBoxRef = useRef<SVGGElement>(null);
  const frontBoxRef = useRef<SVGGElement>(null);
  const treasureRef = useRef<SVGGElement>(null);
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
      if (treasureRef.current) treasureRef.current.style.opacity = phase === "found" ? "1" : "0";
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
          { transform: "translateY(18px)", offset: 0.2 },
          { transform: "translateY(-7px)", offset: 0.62 },
          { transform: "translateY(0)" },
        ],
        { duration: 480, easing: "cubic-bezier(.3,.8,.2,1)", fill: "both" },
      );
      animate(
        treasureRef.current,
        [
          { opacity: 0, transform: "translateY(30px) scale(.55)" },
          { opacity: 0, transform: "translateY(30px) scale(.55)", offset: 0.18 },
          { opacity: 1, transform: "translateY(-3px) scale(1.06)", offset: 0.72 },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        { duration: 480, easing: "cubic-bezier(.2,.9,.25,1.2)", fill: "both" },
      );
      [backBoxRef.current, frontBoxRef.current].forEach((box) => {
        animate(
          box,
          [
            { transform: "translateY(0) rotate(0deg)" },
            { transform: "translateY(2px) rotate(-1deg)", offset: 0.42 },
            { transform: "translateY(0) rotate(0deg)" },
          ],
          { duration: 430, easing: "ease-out", fill: "both" },
        );
      });
    } else {
      const direction = side;
      const itemIndex = ITEMS.indexOf(item);
      const duration = [780, 940, 830, 1_020, 870, 920][itemIndex];
      const throwDistance = [96, 112, 104, 118, 108, 114][itemIndex];
      const throwLift = [72, 86, 78, 90, 76, 84][itemIndex];
      const robotAnimation = animate(
        robotRef.current,
        [
          { transform: "translate(0, 0) rotate(0deg)" },
          { transform: `translate(${direction * -3}px, 10px) rotate(${direction * -5}deg)`, offset: 0.24 },
          { transform: `translate(${direction * 8}px, 5px) rotate(${direction * 10}deg)`, offset: 0.5 },
          { transform: `translate(${direction * 12}px, -5px) rotate(${direction * 13}deg)`, offset: 0.68 },
          { transform: "translate(0, 0) rotate(0deg)" },
        ],
        { duration, easing: "cubic-bezier(.45,0,.2,1)", fill: "both" },
      );
      animate(
        itemRef.current,
        [
          { opacity: 0, transform: "translate(0, 24px) rotate(0deg) scale(.68)" },
          { opacity: 0.95, transform: `translate(${direction * 8}px, 4px) rotate(${direction * 6}deg) scale(.92)`, offset: 0.3 },
          { opacity: 1, transform: `translate(${direction * 34}px, -32px) rotate(${direction * 18}deg) scale(1.16)`, offset: 0.56 },
          { opacity: 1, transform: `translate(${direction * throwDistance}px, ${throwLift * -1}px) rotate(${direction * 34}deg) scale(1.24)`, offset: 0.82 },
          { opacity: 0, transform: `translate(${direction * (throwDistance + 34)}px, ${throwLift * -0.72}px) rotate(${direction * 50}deg) scale(1.1)` },
        ],
        { duration, easing: "cubic-bezier(.3,.05,.2,1)", fill: "both" },
      );
      [backBoxRef.current, frontBoxRef.current].forEach((box) => {
        animate(
          box,
          [
            { transform: "translate(0, 0) rotate(0deg)" },
            { transform: `translate(${direction * -2}px, 1px) rotate(${direction * -1.2}deg)`, offset: 0.28 },
            { transform: `translate(${direction * 3}px, 0) rotate(${direction}deg)`, offset: 0.58 },
            { transform: "translate(0, 0) rotate(0deg)" },
          ],
          { duration: duration * 0.88, easing: "ease-out", fill: "both" },
        );
      });
      animate(
        direction < 0 ? leftArmRef.current : rightArmRef.current,
        [
          { transform: "translate(0, 0) rotate(0deg)" },
          { transform: `translate(${direction * -2}px, 8px) rotate(${direction * -8}deg)`, offset: 0.25 },
          { transform: `translate(${direction * 8}px, -13px) rotate(${direction * 34}deg)`, offset: 0.56 },
          { transform: `translate(${direction * 14}px, -19px) rotate(${direction * 48}deg)`, offset: 0.7 },
          { transform: "translate(0, 0) rotate(0deg)" },
        ],
        { duration, easing: "cubic-bezier(.45,0,.2,1)", fill: "both" },
      );
      animate(
        direction < 0 ? rightArmRef.current : leftArmRef.current,
        [
          { transform: "translate(0, 0)" },
          { transform: "translate(0, 7px)", offset: 0.25 },
          { transform: "translate(0, 2px)", offset: 0.58 },
          { transform: "translate(0, 0)" },
        ],
        { duration, easing: "ease-in-out", fill: "both" },
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
        <g className="loading-mascot-box" ref={backBoxRef}>
          <path className="loading-mascot-paper" d="m42 92 22-17h93l24 17-23 20H64z" />
          <path className="loading-mascot-inside" d="m42 92 48-14 91 14-28 24-89-4z" />
          <path className="loading-mascot-paper" d="m64 75-23-12-18 17 19 12M157 75l24-12 18 17-18 12" />
        </g>
      </g>

      <g className="loading-mascot-item loading-mascot-paper" ref={itemRef}>
        <ItemShape kind={item} />
      </g>

      <g className="loading-mascot-robot" ref={robotRef}>
        <rect className="loading-mascot-paper" height="68" rx="21" width="76" x="72" y="34" />
        {phase === "found" ? (
          <>
            <path d="M91 68c4-6 9-6 13 0M116 68c4-6 9-6 13 0" />
            <path d="M101 82c5 4 13 4 18 0" />
          </>
        ) : (
          <>
            <circle className="loading-mascot-eye" cx="96" cy="67" r="5" />
            <circle className="loading-mascot-eye" cx="124" cy="67" r="5" />
            <path d="M103 82c4 3 10 3 14 0" />
          </>
        )}
      </g>

      <g className="loading-mascot-ink loading-mascot-box" ref={frontBoxRef}>
        <path className="loading-mascot-paper" d="m42 92 22 20v46l-21-13z" />
        <path className="loading-mascot-paper" d="m158 112 23-20-2 57-24 9z" />
        <path className="loading-mascot-paper" d="m64 112h94l-3 46H64z" />
        <path className="loading-mascot-paper" d="m42 92 116 20-15 24-119-22z" />
      </g>

      {phase === "searching" ? (
        <>
          <g className="loading-mascot-arm" ref={leftArmRef}>
            <path d="M87 86Q74 92 77 109" />
            <circle className="loading-mascot-paper" cx="77" cy="109" r="6" />
          </g>
          <g className="loading-mascot-arm" ref={rightArmRef}>
            <path d="M133 86q13 6 10 23" />
            <circle className="loading-mascot-paper" cx="143" cy="109" r="6" />
          </g>
        </>
      ) : (
        <g className="loading-mascot-found" ref={treasureRef}>
          <Diamond />
          <path d="M82 88Q70 66 91 48M138 88q12-22-9-40" />
          <circle className="loading-mascot-paper" cx="91" cy="48" r="5.5" />
          <circle className="loading-mascot-paper" cx="129" cy="48" r="5.5" />
        </g>
      )}
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
  const startedAtRef = useRef(0);
  const foundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setCurrentPhase = useCallback((nextPhase: LoadingPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const clearTimer = (timerRef: typeof foundTimerRef) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = useCallback(() => {
    if (pendingRef.current > 0) return;
    pendingRef.current = 1;
    startedAtRef.current = Date.now();
    navigationOriginRef.current = document.querySelector("#main-content")?.firstElementChild ?? null;

    clearTimer(foundTimerRef);
    clearTimer(hideTimerRef);
    clearTimer(safetyTimerRef);
    safetyTimerRef.current = setTimeout(() => {
      safetyTimerRef.current = null;
      pendingRef.current = 0;
      setCurrentPhase("idle");
    }, MAX_SEARCH_DURATION_MS);

    setCurrentPhase("searching");
  }, [setCurrentPhase]);

  const finish = useCallback(() => {
    pendingRef.current = Math.max(0, pendingRef.current - 1);
    if (pendingRef.current > 0) return;

    clearTimer(safetyTimerRef);
    if (phaseRef.current === "idle") return;

    const showFoundState = () => {
      foundTimerRef.current = null;
      if (pendingRef.current > 0) return;

      setCurrentPhase("found");
      clearTimer(hideTimerRef);
      hideTimerRef.current = setTimeout(() => {
        hideTimerRef.current = null;
        if (pendingRef.current === 0) setCurrentPhase("idle");
      }, FOUND_DURATION_MS);
    };
    const remainingSearchTime = Math.max(
      0,
      MIN_SEARCHING_DURATION_MS - (Date.now() - startedAtRef.current),
    );

    clearTimer(foundTimerRef);
    if (remainingSearchTime > 0) {
      foundTimerRef.current = setTimeout(showFoundState, remainingSearchTime);
    } else {
      showFoundState();
    }
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
      clearTimer(foundTimerRef);
      clearTimer(hideTimerRef);
      clearTimer(safetyTimerRef);
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

    const target = `/search${params.size ? `?${params}` : ""}`;
    controller?.start();

    if (`${window.location.pathname}${window.location.search}` === target) {
      router.refresh();
    } else {
      router.push(target);
    }
  };

  return (
    <form {...props} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

export function SearchMascotSettler() {
  const controller = useContext(LoadingMascotContext);

  useEffect(() => {
    controller?.finish();
  });

  return null;
}

export function RouteLoadingFallback({ label }: { label: string }) {
  return (
    <div aria-busy="true" className="route-shell route-loading-space">
      <p className="sr-only" role="status">{label}</p>
    </div>
  );
}

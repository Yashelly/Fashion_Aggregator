import "server-only";

export type AbortScope = {
  signal: AbortSignal;
  timedOut: () => boolean;
  dispose: () => void;
};

/**
 * Combine a caller cancellation signal with a local timeout. The returned
 * signal is already aborted when either input has completed before the scope
 * is created, which lets callers avoid launching unnecessary network work.
 */
export function createAbortScope(
  parentSignal: AbortSignal | undefined,
  timeoutMs: number,
): AbortScope {
  const controller = new AbortController();
  let timeoutReached = false;
  const boundedTimeoutMs = Math.max(0, timeoutMs);

  const abortFromParent = () => controller.abort(parentSignal?.reason);
  if (parentSignal?.aborted) {
    abortFromParent();
  } else {
    parentSignal?.addEventListener("abort", abortFromParent, { once: true });
  }

  const timeout = setTimeout(() => {
    timeoutReached = true;
    controller.abort(new DOMException("Search request timed out", "TimeoutError"));
  }, boundedTimeoutMs);

  return {
    signal: controller.signal,
    timedOut: () => timeoutReached,
    dispose: () => {
      clearTimeout(timeout);
      parentSignal?.removeEventListener("abort", abortFromParent);
    },
  };
}

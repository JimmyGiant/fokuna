const CLEAR_MS = 250;

let clearTimer: ReturnType<typeof setTimeout> | null = null;

/** Delay clearing drag UI so drop animation / placeholder settle without flash. */
export function scheduleDragClear(clear: () => void, delayMs = CLEAR_MS) {
  if (clearTimer) {
    clearTimeout(clearTimer);
  }
  clearTimer = setTimeout(() => {
    clearTimer = null;
    clear();
  }, delayMs);
}

export function cancelScheduledDragClear() {
  if (clearTimer) {
    clearTimeout(clearTimer);
    clearTimer = null;
  }
}

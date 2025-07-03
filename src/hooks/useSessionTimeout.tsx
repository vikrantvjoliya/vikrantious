import { useEffect, useRef } from "react";

const EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
];

export function useSessionTimeout(onTimeout: () => void, timeoutMs = 10 * 60 * 1000) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(onTimeout, timeoutMs);
    };

    EVENTS.forEach(event =>
      window.addEventListener(event, resetTimer)
    );
    resetTimer();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      EVENTS.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [onTimeout, timeoutMs]);
}
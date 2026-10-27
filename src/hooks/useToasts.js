import { useState, useCallback, useRef, useEffect } from "react";

const DISPLAY_MS = 3500;

/** Small notification queue: notify("Saved", "success") shows a toast that removes itself. */
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, variant = "success") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      timers.current.set(id, setTimeout(() => dismiss(id), DISPLAY_MS));
    },
    [dismiss]
  );

  // Clear pending timers if the app unmounts.
  useEffect(() => {
    const active = timers.current;
    return () => active.forEach((timer) => clearTimeout(timer));
  }, []);

  return { toasts, notify, dismiss };
}

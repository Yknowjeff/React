import { useState, useEffect } from "react";

/**
 * useState that is mirrored to localStorage.
 * - The saved value is read once, when the component first renders.
 * - Every change is written back in an effect.
 * - Broken JSON, a wrong data shape, or blocked storage falls back to `initialValue`.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved === null) return initialValue;
      const parsed = JSON.parse(saved);
      // The ledger only stores arrays, so reject anything else.
      return Array.isArray(parsed) ? parsed : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or disabled: the app still works, it just will not persist.
    }
  }, [key, value]);

  return [value, setValue];
}

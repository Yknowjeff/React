import { useState, useRef, useCallback } from "react";
import { isFilled } from "../utils/ledger.js";

/**
 * Field with Bootstrap-style validation status.
 * status: null (untouched) | "valid" | "invalid"
 *
 * `validator` decides what counts as valid. It defaults to the original midterm
 * rule (the field must not be blank), so existing usages behave exactly as before.
 */
export function useValidatedField(validator = isFilled, initialValue = "") {
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState(null);
  const ref = useRef(null);

  // Validate on blur / on save; returns validity
  const validate = useCallback(() => {
    const ok = validator(value);
    setStatus(ok ? "valid" : "invalid");
    return ok;
  }, [value, validator]);

  const onChange = useCallback(
    (e) => {
      const next = e.target.value;
      setValue(next);
      // Re-check while typing only once the field has been flagged
      if (status === "invalid") setStatus(validator(next) ? "valid" : "invalid");
    },
    [status, validator]
  );

  // Clear back to an empty (or given) value with no validation styling
  const reset = useCallback(
    (nextValue = initialValue) => {
      setValue(nextValue);
      setStatus(null);
    },
    [initialValue]
  );

  const focus = useCallback(() => ref.current?.focus(), []);

  return { value, status, ref, onChange, onBlur: validate, validate, reset, focus };
}

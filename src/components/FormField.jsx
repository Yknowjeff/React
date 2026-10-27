import { forwardRef } from "react";

/**
 * One labelled input with Bootstrap validation styling.
 * - Default renders a text input (same as the midterm version).
 * - Pass `options` to render a <select> instead.
 * - Extra props such as type, min, step, disabled go straight to the control.
 */
const FormField = forwardRef(function FormField(
  { id, label, placeholder, value, status, errorMessage, onChange, onBlur, options, optional, ...rest },
  ref
) {
  const stateClass =
    status === "invalid" ? " is-invalid" : status === "valid" ? " is-valid" : "";

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold">
        {label}
        {optional && <span className="text-secondary fw-normal"> (optional)</span>}
      </label>
      {options ? (
        <select
          ref={ref}
          id={id}
          className={`form-select${stateClass}`}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={ref}
          type="text"
          id={id}
          className={`form-control${stateClass}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={!optional}
          {...rest}
        />
      )}
      <div className="invalid-feedback">{errorMessage}</div>
    </div>
  );
});

export default FormField;

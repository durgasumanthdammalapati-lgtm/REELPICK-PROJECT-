import { useState } from "react";

/** Label + input + error message. Password fields get a Show / Hide button. */
export default function FormField({ id, label, type = "text", value, onChange, error, hint, autoComplete }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input
          id={id}
          name={id}
          type={isPassword && visible ? "text" : type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
        />
        {isPassword && (
          <button
            type="button"
            className="toggle-visibility"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
          >
            {visible ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

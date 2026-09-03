export default function Input({ label, error, hint, id, className = "", ...props }) {
  const inputId = id || props.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-on-surface">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`h-12 w-full rounded-md border bg-white px-3.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          error ? "border-error focus:border-error" : "border-outline-variant focus:border-primary"
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs font-medium text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-on-surface-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Select({ label, error, hint, id, className = "", children, ...props }) {
  const inputId = id || props.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-on-surface">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`h-12 w-full rounded-md border bg-white px-3.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          error ? "border-error" : "border-outline-variant focus:border-primary"
        }`}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1 text-xs font-medium text-error">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

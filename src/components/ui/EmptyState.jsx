import Button from "./Button.jsx";

export function EmptyState({ icon = "inbox", title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-6 py-12 text-center">
      <span className="material-symbols-outlined mb-3 text-4xl text-outline">{icon}</span>
      <h4 className="text-base font-semibold text-on-surface">{title}</h4>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button size="sm" variant="secondary" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description, onRetry, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border border-error-container bg-error-container/40 px-6 py-12 text-center ${className}`}>
      <span className="material-symbols-outlined mb-3 text-4xl text-error">error</span>
      <h4 className="text-base font-semibold text-error">{title}</h4>
      {description && <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{description}</p>}
      {onRetry && (
        <Button size="sm" variant="danger" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

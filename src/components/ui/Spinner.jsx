export default function Spinner({ label, size = 22 }) {
  return (
    <div className="flex flex-col items-center gap-3 text-on-surface-variant">
      <span
        className="material-symbols-outlined animate-spin text-primary"
        style={{ fontSize: size }}
      >
        progress_activity
      </span>
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

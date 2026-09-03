const STYLES = {
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  error: "bg-error text-on-error",
  neutral: "bg-outline text-white",
  info: "bg-primary text-on-primary",
  "success-soft": "bg-success-container text-success",
  "warning-soft": "bg-warning-container text-warning",
  "error-soft": "bg-error-container text-error",
};

export default function StatusChip({ tone = "neutral", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${STYLES[tone] || STYLES.neutral}`}
    >
      {children}
    </span>
  );
}

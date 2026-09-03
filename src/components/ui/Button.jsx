const VARIANTS = {
  primary:
    "bg-primary text-on-primary hover:bg-[#005555] shadow-card disabled:bg-outline-variant disabled:text-outline",
  secondary:
    "bg-white text-primary border border-primary/30 hover:bg-primary-container/10 disabled:opacity-50",
  outline:
    "bg-transparent text-on-surface border border-outline-variant hover:bg-surface-container disabled:opacity-50",
  danger: "bg-error text-on-error hover:bg-[#a01515] disabled:opacity-50",
  ghost: "bg-transparent text-primary hover:bg-primary-container/10 disabled:opacity-50",
};

const SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-12 px-5 text-sm gap-2",
  lg: "h-14 px-6 text-base gap-2",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-150 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      {children}
    </Component>
  );
}

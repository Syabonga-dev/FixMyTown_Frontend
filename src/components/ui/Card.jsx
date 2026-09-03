export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-lg border border-outline-variant/60 bg-surface-container-lowest shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-4 p-5 pb-3 ${className}`}>
      <div>
        <h3 className="text-[17px] font-semibold text-on-surface">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-on-surface-variant">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={`p-5 pt-2 ${className}`}>{children}</div>;
}

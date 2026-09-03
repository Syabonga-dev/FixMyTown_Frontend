import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

const ICONS = { success: "check_circle", error: "error", info: "info" };
const COLORS = {
  success: "border-success bg-success-container text-success",
  error: "border-error bg-error-container text-error",
  info: "border-primary bg-primary-container/10 text-primary",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (msg) => push(msg, "success"),
    error: (msg) => push(msg, "error"),
    info: (msg) => push(msg, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-2 rounded-md border px-4 py-3 text-sm font-medium shadow-elevated animate-fade-in ${COLORS[t.type]}`}
          >
            <span className="material-symbols-outlined text-[18px]">{ICONS[t.type]}</span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="material-symbols-outlined text-[16px] opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              close
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

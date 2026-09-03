import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initials = (user?.fullName || user?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-outline-variant/60 bg-surface-container-lowest/90 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="material-symbols-outlined rounded-md p-1.5 text-on-surface hover:bg-surface-container lg:hidden"
          aria-label="Open menu"
        >
          menu
        </button>
        <h1 className="text-lg font-semibold text-on-surface">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="material-symbols-outlined relative rounded-full p-2 text-on-surface-variant hover:bg-surface-container"
          aria-label="Notifications"
        >
          notifications
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-outline-variant/60 py-1 pl-1 pr-3 hover:bg-surface-container"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
              {initials}
            </span>
            <span className="hidden text-sm font-medium sm:inline">
              {user?.fullName || user?.name || "Account"}
            </span>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              expand_more
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-md border border-outline-variant/60 bg-white shadow-elevated animate-fade-in">
              <div className="border-b border-outline-variant/60 px-4 py-3">
                <p className="truncate text-sm font-semibold text-on-surface">
                  {user?.fullName || user?.name}
                </p>
                <p className="truncate text-xs text-on-surface-variant">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-error hover:bg-error-container/40"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

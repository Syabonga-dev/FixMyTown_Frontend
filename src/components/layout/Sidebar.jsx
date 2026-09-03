import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";

const NAV_BY_ROLE = {
  Patient: [
    { to: "/patient", label: "Dashboard", icon: "space_dashboard", end: true },
    { to: "/patient/medications", label: "Medications", icon: "medication" },
    { to: "/patient/symptom-checker", label: "Symptom Checker", icon: "psychology_alt" },
    { to: "/patient/clinic-finder", label: "Clinic Finder", icon: "location_on" },
    { to: "/patient/notifications", label: "Reminders", icon: "notifications" },
  ],
  Nurse: [
    { to: "/nurse", label: "Dashboard", icon: "space_dashboard", end: true },
    { to: "/nurse/patients", label: "Patients", icon: "groups" },
    { to: "/nurse/collections", label: "Collections", icon: "inventory_2" },
    { to: "/nurse/audit-log", label: "Audit Log", icon: "fact_check" },
  ],
  Proxy: [
    { to: "/proxy", label: "Dashboard", icon: "space_dashboard", end: true },
    { to: "/proxy/patients", label: "Patients Under Care", icon: "family_restroom" },
  ],
  Admin: [
    { to: "/admin", label: "Overview", icon: "space_dashboard", end: true },
    { to: "/admin/register-staff", label: "Register Staff", icon: "person_add" },
    { to: "/admin/staff", label: "Manage Staff", icon: "badge" },
  ],
};

export default function Sidebar({ role, open, onClose }) {
  const items = NAV_BY_ROLE[role] || [];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-outline-variant/60 bg-surface-container-lowest transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-outline-variant/60 px-5">
          <img src={logo} alt="PhilaLink" className="h-8 w-8" />
          <span className="text-lg font-bold text-on-surface">
            Phila<span className="text-primary">Link</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary bg-primary-container/10 text-primary"
                    : "border-transparent text-on-surface-variant hover:bg-surface-container"
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-outline-variant/60 p-3">
          <NavLink
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            Landing page
          </NavLink>
        </div>
      </aside>
    </>
  );
}

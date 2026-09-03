import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import PhilaniChatbot from "../chatbot/PhilaniChatbot.jsx";

const TITLES = {
  "/patient": "Dashboard",
  "/patient/medications": "Medications",
  "/patient/symptom-checker": "Symptom Checker",
  "/patient/clinic-finder": "Clinic Finder",
  "/patient/notifications": "Reminders & Notifications",
  "/nurse": "Nurse Dashboard",
  "/nurse/patients": "Patients",
  "/nurse/collections": "Medication Collections",
  "/nurse/audit-log": "System Audit Log",
  "/proxy": "Proxy Dashboard",
  "/proxy/patients": "Patients Under Care",
  "/admin": "Admin Overview",
  "/admin/register-staff": "Register Nurse / Proxy",
  "/admin/staff": "Manage Staff",
};

export default function AuthenticatedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role } = useAuth();
  const location = useLocation();
  const title = TITLES[location.pathname] || "PhilaLink";

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mounted once here rather than per-page, so state (conversation,
          open/closed) persists as the user moves between routes. Only
          patients get the symptom-triage assistant. */}
      {role === "Patient" && <PhilaniChatbot />}
    </div>
  );
}

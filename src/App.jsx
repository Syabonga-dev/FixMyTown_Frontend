import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { ProtectedRoute, RoleRoute, homePathForRole } from "./routes/ProtectedRoute.jsx";
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout.jsx";

import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import PhoneVerificationPage from "./pages/auth/PhoneVerificationPage.jsx";
import RegistrationSuccessPage from "./pages/auth/RegistrationSuccessPage.jsx";
import NotFound from "./pages/NotFound.jsx";

import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import MedicationsPage from "./pages/patient/MedicationsPage.jsx";
import SymptomCheckerPage from "./pages/patient/SymptomCheckerPage.jsx";
import ClinicFinderPage from "./pages/patient/ClinicFinderPage.jsx";
import NotificationsPage from "./pages/patient/NotificationsPage.jsx";

import NurseDashboard from "./pages/nurse/NurseDashboard.jsx";
import NursePatientsPage from "./pages/nurse/NursePatientsPage.jsx";
import CollectionsPage from "./pages/nurse/CollectionsPage.jsx";
import AuditLogPage from "./pages/nurse/AuditLogPage.jsx";

import ProxyDashboard from "./pages/proxy/ProxyDashboard.jsx";
import ProxyPatientsPage from "./pages/proxy/ProxyPatientsPage.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import RegisterStaffPage from "./pages/admin/RegisterStaffPage.jsx";
import ManageStaffPage from "./pages/admin/ManageStaffPage.jsx";

/** Once logged in, / and /login should bounce straight to the user's own
 *  dashboard rather than showing them the marketing/login pages again. */
function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (!isLoading && isAuthenticated) {
    return <Navigate to={homePathForRole(role)} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────── */}
      <Route
        path="/"
        element={
          <RedirectIfAuthenticated>
            <LandingPage />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <LoginPage />
          </RedirectIfAuthenticated>
        }
      />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/verify" element={<PhoneVerificationPage />} />
      <Route path="/register/success" element={<RegistrationSuccessPage />} />

      {/* ── Authenticated shell (sidebar + topbar + chatbot) ──────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          {/* Patient */}
          <Route element={<RoleRoute allow={["Patient"]} />}>
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/medications" element={<MedicationsPage />} />
            <Route path="/patient/symptom-checker" element={<SymptomCheckerPage />} />
            <Route path="/patient/clinic-finder" element={<ClinicFinderPage />} />
            <Route path="/patient/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Nurse */}
          <Route element={<RoleRoute allow={["Nurse"]} />}>
            <Route path="/nurse" element={<NurseDashboard />} />
            <Route path="/nurse/patients" element={<NursePatientsPage />} />
            <Route path="/nurse/collections" element={<CollectionsPage />} />
            <Route path="/nurse/audit-log" element={<AuditLogPage />} />
          </Route>

          {/* Proxy */}
          <Route element={<RoleRoute allow={["Proxy"]} />}>
            <Route path="/proxy" element={<ProxyDashboard />} />
            <Route path="/proxy/patients" element={<ProxyPatientsPage />} />
          </Route>

          {/* Admin */}
          <Route element={<RoleRoute allow={["Admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/register-staff" element={<RegisterStaffPage />} />
            <Route path="/admin/staff" element={<ManageStaffPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

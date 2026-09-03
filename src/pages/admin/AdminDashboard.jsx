import { Link } from "react-router-dom";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { ErrorState } from "../../components/ui/EmptyState.jsx";
import { useApi } from "../../lib/useApi.js";
import { adminApi } from "../../services/api/admin.js";

const STAT_CARDS = [
  { key: "totalPatients", label: "Total patients", icon: "groups" },
  { key: "totalNurses", label: "Active nurses", icon: "medical_services" },
  { key: "totalProxies", label: "Active proxies", icon: "family_restroom" },
  { key: "pendingVerifications", label: "Pending verifications", icon: "pending_actions" },
];

export default function AdminDashboard() {
  const { data: stats, loading, error, refetch } = useApi(() => adminApi.getSystemStats(), []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-full py-6">
            <Spinner label="Loading overview…" />
          </div>
        ) : error ? (
          <div className="col-span-full">
            <ErrorState description={error.message} onRetry={refetch} />
          </div>
        ) : (
          STAT_CARDS.map((s) => (
            <Card key={s.key} className="p-5">
              <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-md bg-primary-container/10 text-primary">
                {s.icon}
              </span>
              <p className="mt-3 text-2xl font-bold text-on-surface">{stats?.[s.key] ?? "—"}</p>
              <p className="text-xs text-on-surface-variant">{s.label}</p>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader
          title="Register a new Nurse or Proxy"
          subtitle="Patients self-register; staff accounts are created here."
          action={
            <Button as={Link} to="/admin/register-staff" icon="person_add">
              Register staff
            </Button>
          }
        />
        <CardBody className="pt-0">
          <p className="text-sm text-on-surface-variant">
            Nurse and Proxy accounts don't go through the public sign-up flow. Create them here
            with their role, and they'll be able to log in immediately with the credentials you
            set.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

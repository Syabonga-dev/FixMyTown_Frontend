import { Link } from "react-router-dom";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { ErrorState, EmptyState } from "../../components/ui/EmptyState.jsx";
import StatusChip from "../../components/ui/StatusChip.jsx";
import { useApi } from "../../lib/useApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { proxiesApi } from "../../services/api/proxies.js";

export default function ProxyDashboard() {
  const { user } = useAuth();
  const { data: summary, loading: summaryLoading } = useApi(
    () => proxiesApi.getDashboardSummary(),
    []
  );
  const { data: patients, loading, error, refetch } = useApi(
    () => proxiesApi.getManagedPatients(),
    []
  );

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 bg-primary p-6 text-on-primary sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Welcome back
            </p>
            <p className="mt-1 text-2xl font-bold">{user?.fullName || "Proxy"}</p>
            <p className="mt-1 text-sm text-white/80">
              You're managing care for {summaryLoading ? "…" : summary?.managedPatientCount ?? 0}{" "}
              patient{summary?.managedPatientCount === 1 ? "" : "s"}.
            </p>
          </div>
          <Button as={Link} to="/proxy/patients" variant="secondary" icon="family_restroom">
            View patients
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Patients under your care"
          subtitle="Verification status and quick access"
          action={
            <Button as={Link} to="/proxy/patients" size="sm" variant="ghost" icon="arrow_forward">
              View all
            </Button>
          }
        />
        <CardBody className="pt-0">
          {loading ? (
            <div className="py-10">
              <Spinner label="Loading patients…" />
            </div>
          ) : error ? (
            <ErrorState description={error.message} onRetry={refetch} />
          ) : !patients || patients.length === 0 ? (
            <EmptyState
              icon="family_restroom"
              title="No patients linked to your account"
              description="Ask your clinic to link a patient to your proxy profile."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/60 text-xs uppercase tracking-wide text-on-surface-variant">
                    <th className="py-2 pr-4 font-medium">Patient</th>
                    <th className="py-2 pr-4 font-medium">Relationship</th>
                    <th className="py-2 pr-4 font-medium">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {patients.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 pr-4 font-semibold text-on-surface">{p.fullName}</td>
                      <td className="py-3 pr-4 text-on-surface-variant">{p.relationship}</td>
                      <td className="py-3 pr-4">
                        <StatusChip tone={p.verified ? "success-soft" : "warning-soft"}>
                          {p.verified ? "Verified" : "Pending"}
                        </StatusChip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

import { Link } from "react-router-dom";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { ErrorState, EmptyState } from "../../components/ui/EmptyState.jsx";
import StatusChip from "../../components/ui/StatusChip.jsx";
import { useApi } from "../../lib/useApi.js";
import { nursesApi } from "../../services/api/nurses.js";

function statusTone(status) {
  switch (status) {
    case "Collected":
    case "Verified":
      return "success-soft";
    case "Overdue":
    case "Flagged":
      return "error-soft";
    case "Pending":
      return "warning-soft";
    default:
      return "neutral";
  }
}

export default function NurseDashboard() {
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } =
    useApi(() => nursesApi.getDashboardStats(), []);
  const { data: patients, loading: patientsLoading, error: patientsError } = useApi(
    () => nursesApi.getAssignedPatients({ take: 6 }),
    []
  );
  const { data: alerts } = useApi(() => nursesApi.getUrgentAlerts(), []);
  const { data: supplies } = useApi(() => nursesApi.getSupplyLevels(), []);

  const STAT_CARDS = [
    { key: "patientsToday", label: "Patients today", icon: "groups" },
    { key: "collectionsDue", label: "Collections due", icon: "medication" },
    { key: "urgentAlerts", label: "Urgent alerts", icon: "priority_high" },
    { key: "completedThisWeek", label: "Completed this week", icon: "task_alt" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <div className="col-span-full py-6">
            <Spinner label="Loading dashboard…" />
          </div>
        ) : statsError ? (
          <div className="col-span-full">
            <ErrorState description={statsError.message} onRetry={refetchStats} />
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient activity table */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Patient activity"
            subtitle="Recent collections and check-ins"
            action={
              <Button as={Link} to="/nurse/patients" size="sm" variant="ghost" icon="arrow_forward">
                View all
              </Button>
            }
          />
          <CardBody className="pt-0">
            {patientsLoading ? (
              <div className="py-10">
                <Spinner label="Loading patients…" />
              </div>
            ) : patientsError ? (
              <ErrorState description={patientsError.message} />
            ) : !patients || patients.length === 0 ? (
              <EmptyState icon="groups" title="No patients assigned yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/60 text-xs uppercase tracking-wide text-on-surface-variant">
                      <th className="py-2 pr-4 font-medium">Patient</th>
                      <th className="py-2 pr-4 font-medium">Medication</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {patients.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 pr-4 font-semibold text-on-surface">{p.fullName}</td>
                        <td className="py-3 pr-4 text-on-surface-variant">{p.medicationName || "—"}</td>
                        <td className="py-3 pr-4">
                          <StatusChip tone={statusTone(p.status)}>{p.status}</StatusChip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Urgent alerts sidebar */}
        <Card>
          <CardHeader title="Urgent alerts" />
          <CardBody className="pt-0">
            {!alerts || alerts.length === 0 ? (
              <EmptyState icon="notifications_off" title="No urgent alerts" />
            ) : (
              <ul className="space-y-3">
                {alerts.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-md border border-error-container bg-error-container/30 p-3 text-sm"
                  >
                    <p className="font-semibold text-error">{a.title}</p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">{a.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Audit log"
            action={
              <Button as={Link} to="/nurse/audit-log" size="sm" variant="ghost" icon="arrow_forward">
                Full log
              </Button>
            }
          />
          <CardBody className="pt-0">
            <p className="text-sm text-on-surface-variant">
              Every collection, status change, and record access is logged for compliance.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Supply levels" />
          <CardBody className="pt-0">
            {!supplies || supplies.length === 0 ? (
              <EmptyState icon="inventory_2" title="No supply data yet" />
            ) : (
              <ul className="space-y-3">
                {supplies.map((s) => (
                  <li key={s.name}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-on-surface">{s.name}</span>
                      <span className="text-on-surface-variant">{s.percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-container-highest">
                      <div
                        className={`h-2 rounded-full ${
                          s.percent < 25 ? "bg-error" : s.percent < 60 ? "bg-warning" : "bg-success"
                        }`}
                        style={{ width: `${s.percent}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

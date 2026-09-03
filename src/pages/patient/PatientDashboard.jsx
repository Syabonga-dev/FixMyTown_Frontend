import { Link } from "react-router-dom";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { ErrorState, EmptyState } from "../../components/ui/EmptyState.jsx";
import StatusChip from "../../components/ui/StatusChip.jsx";
import { useApi } from "../../lib/useApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { patientsApi } from "../../services/api/patients.js";

const QUICK_LINKS = [
  { to: "/patient/symptom-checker", icon: "psychology_alt", title: "Symptom Checker", desc: "Get AI-guided triage from Philani AI." },
  { to: "/patient/clinic-finder", icon: "location_on", title: "Find a Clinic", desc: "See nearby clinics and live capacity." },
  { to: "/patient/medications", icon: "medication", title: "My Medications", desc: "View your current chronic medication list." },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const { data: nextCollection, loading: loadingNext, error: nextError, refetch: refetchNext } =
    useApi(() => patientsApi.getUpcomingCollection(), []);
  const { data: medications, loading: loadingMeds, error: medsError } = useApi(
    () => patientsApi.getMedications(),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-on-surface">
          Hi {user?.fullName?.split(" ")[0] || "there"} 👋
        </h2>
        <p className="text-sm text-on-surface-variant">
          Here's what's happening with your care today.
        </p>
      </div>

      {/* Next collection hero */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 bg-primary p-6 text-on-primary sm:flex-row sm:items-center sm:justify-between">
          {loadingNext ? (
            <Spinner label="Loading your next collection…" />
          ) : nextError ? (
            <p className="text-sm text-white/90">Couldn't load your next collection right now.</p>
          ) : nextCollection ? (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Next medication collection
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {nextCollection.medicationName || "Chronic medication"}
                </p>
                <p className="mt-1 text-sm text-white/80">
                  {nextCollection.clinicName} · {nextCollection.date}
                </p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                {nextCollection.daysUntil != null
                  ? `In ${nextCollection.daysUntil} day${nextCollection.daysUntil === 1 ? "" : "s"}`
                  : "Upcoming"}
              </span>
            </>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                Next medication collection
              </p>
              <p className="mt-1 text-lg font-semibold text-white/90">
                No upcoming collection scheduled.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick action tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="group rounded-lg border border-outline-variant/60 bg-white p-5 shadow-card transition-shadow hover:shadow-elevated"
          >
            <span className="material-symbols-outlined flex h-11 w-11 items-center justify-center rounded-md bg-primary-container/10 text-primary">
              {q.icon}
            </span>
            <h3 className="mt-3 text-sm font-semibold text-on-surface group-hover:text-primary">
              {q.title}
            </h3>
            <p className="mt-1 text-xs text-on-surface-variant">{q.desc}</p>
          </Link>
        ))}
      </div>

      {/* Medications list */}
      <Card>
        <CardHeader
          title="Current medications"
          subtitle="Your active chronic medication schedule"
          action={
            <Button as={Link} to="/patient/medications" size="sm" variant="ghost" icon="arrow_forward">
              View all
            </Button>
          }
        />
        <CardBody>
          {loadingMeds ? (
            <div className="py-8">
              <Spinner label="Loading medications…" />
            </div>
          ) : medsError ? (
            <ErrorState description={medsError.message} onRetry={refetchNext} />
          ) : !medications || medications.length === 0 ? (
            <EmptyState
              icon="medication"
              title="No medications on file yet"
              description="Once your clinic adds a chronic medication script, it'll show up here."
            />
          ) : (
            <ul className="divide-y divide-outline-variant/50">
              {medications.slice(0, 4).map((med) => (
                <li key={med.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{med.name}</p>
                    <p className="text-xs text-on-surface-variant">{med.dosage} · {med.frequency}</p>
                  </div>
                  <StatusChip tone={med.status === "Active" ? "success-soft" : "warning-soft"}>
                    {med.status || "Active"}
                  </StatusChip>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { ErrorState, EmptyState } from "../../components/ui/EmptyState.jsx";
import StatusChip from "../../components/ui/StatusChip.jsx";
import { useApi } from "../../lib/useApi.js";
import { collectionsApi } from "../../services/api/clinics.js";
import { useToast } from "../../components/ui/Toast.jsx";

function statusTone(status) {
  switch (status) {
    case "Collected":
      return "success-soft";
    case "Overdue":
      return "error-soft";
    case "Pending":
      return "warning-soft";
    default:
      return "neutral";
  }
}

export default function CollectionsPage() {
  const { data: summary } = useApi(() => collectionsApi.getSummary(), []);
  const { data: collections, loading, error, refetch, setData } = useApi(
    () => collectionsApi.list(),
    []
  );
  const toast = useToast();

  const SUMMARY_CARDS = [
    { key: "dueToday", label: "Due today", icon: "today" },
    { key: "overdue", label: "Overdue", icon: "warning" },
    { key: "collectedThisWeek", label: "Collected this week", icon: "task_alt" },
    { key: "totalActive", label: "Total active scripts", icon: "medication" },
  ];

  const markCollected = async (id) => {
    setData((list) => list.map((c) => (c.id === id ? { ...c, status: "Collected" } : c)));
    try {
      await collectionsApi.markCollected(id);
      toast.success("Collection marked as completed.");
    } catch {
      toast.error("Couldn't update this collection.");
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_CARDS.map((s) => (
          <Card key={s.key} className="p-5">
            <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-md bg-primary-container/10 text-primary">
              {s.icon}
            </span>
            <p className="mt-3 text-2xl font-bold text-on-surface">{summary?.[s.key] ?? "—"}</p>
            <p className="text-xs text-on-surface-variant">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Medication collections" subtitle="All scheduled and past collections" />
        <CardBody className="pt-0">
          {loading ? (
            <div className="py-10">
              <Spinner label="Loading collections…" />
            </div>
          ) : error ? (
            <ErrorState description={error.message} onRetry={refetch} />
          ) : !collections || collections.length === 0 ? (
            <EmptyState icon="inventory_2" title="No collections scheduled" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/60 text-xs uppercase tracking-wide text-on-surface-variant">
                    <th className="py-2 pr-4 font-medium">Patient</th>
                    <th className="py-2 pr-4 font-medium">Medication</th>
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {collections.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 pr-4 font-semibold text-on-surface">{c.patientName}</td>
                      <td className="py-3 pr-4 text-on-surface-variant">{c.medicationName}</td>
                      <td className="py-3 pr-4 text-on-surface-variant">{c.date}</td>
                      <td className="py-3 pr-4">
                        <StatusChip tone={statusTone(c.status)}>{c.status}</StatusChip>
                      </td>
                      <td className="py-3 pr-4">
                        {c.status !== "Collected" && (
                          <button
                            onClick={() => markCollected(c.id)}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Mark collected
                          </button>
                        )}
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

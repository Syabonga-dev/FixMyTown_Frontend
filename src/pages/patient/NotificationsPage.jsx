import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { ErrorState, EmptyState } from "../../components/ui/EmptyState.jsx";
import { useApi } from "../../lib/useApi.js";
import { patientsApi } from "../../services/api/patients.js";
import { useToast } from "../../components/ui/Toast.jsx";

const ICONS = {
  Reminder: "notifications_active",
  Collection: "medication",
  System: "info",
};

export default function NotificationsPage() {
  const { data: notifications, loading, error, refetch, setData } = useApi(
    () => patientsApi.getNotifications(),
    []
  );
  const toast = useToast();

  const markRead = async (id) => {
    setData((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await patientsApi.markNotificationRead(id);
    } catch {
      toast.error("Couldn't update that notification.");
      refetch();
    }
  };

  return (
    <Card>
      <CardHeader title="Reminders & notifications" subtitle="Stay on top of your care." />
      <CardBody>
        {loading ? (
          <div className="py-10">
            <Spinner label="Loading notifications…" />
          </div>
        ) : error ? (
          <ErrorState description={error.message} onRetry={refetch} />
        ) : !notifications || notifications.length === 0 ? (
          <EmptyState icon="notifications_off" title="You're all caught up" description="No new reminders right now." />
        ) : (
          <ul className="divide-y divide-outline-variant/50">
            {notifications.map((n) => (
              <li key={n.id} className={`flex items-start gap-3 py-3.5 ${n.read ? "opacity-60" : ""}`}>
                <span className="material-symbols-outlined mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/10 text-primary">
                  {ICONS[n.type] || "notifications"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">{n.title}</p>
                  <p className="text-xs text-on-surface-variant">{n.message}</p>
                  <p className="mt-1 text-[11px] text-outline">{n.time}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="flex-shrink-0 text-xs font-semibold text-primary hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

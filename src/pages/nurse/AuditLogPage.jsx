import { useState } from "react";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { Select } from "../../components/ui/Input.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { ErrorState, EmptyState } from "../../components/ui/EmptyState.jsx";
import { useApi } from "../../lib/useApi.js";
import { nursesApi } from "../../services/api/nurses.js";

const ACTION_ICONS = {
  Login: "login",
  Logout: "logout",
  View: "visibility",
  Update: "edit",
  Create: "add_circle",
  Collection: "medication",
};

export default function AuditLogPage() {
  const [filter, setFilter] = useState("All");
  const { data: entries, loading, error, refetch } = useApi(
    () => nursesApi.getAuditLog(filter !== "All" ? { action: filter } : {}),
    [filter]
  );

  return (
    <Card>
      <CardHeader
        title="System audit log"
        subtitle="Every record access and change, for compliance."
        action={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-44">
            {["All", "Login", "Logout", "View", "Update", "Create", "Collection"].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        }
      />
      <CardBody className="pt-0">
        {loading ? (
          <div className="py-10">
            <Spinner label="Loading audit log…" />
          </div>
        ) : error ? (
          <ErrorState description={error.message} onRetry={refetch} />
        ) : !entries || entries.length === 0 ? (
          <EmptyState icon="fact_check" title="No audit entries found" />
        ) : (
          <ul className="divide-y divide-outline-variant/50">
            {entries.map((e) => (
              <li key={e.id} className="flex items-start gap-3 py-3.5 text-sm">
                <span className="material-symbols-outlined mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
                  {ACTION_ICONS[e.action] || "history"}
                </span>
                <div className="flex-1">
                  <p className="text-on-surface">
                    <span className="font-semibold">{e.actor}</span> {e.description}
                  </p>
                  <p className="text-xs text-on-surface-variant">{e.timestamp}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

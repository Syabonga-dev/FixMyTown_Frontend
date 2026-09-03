import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { ErrorState, EmptyState } from "../../components/ui/EmptyState.jsx";
import StatusChip from "../../components/ui/StatusChip.jsx";
import { useApi } from "../../lib/useApi.js";
import { patientsApi } from "../../services/api/patients.js";

export default function MedicationsPage() {
  const { data: medications, loading, error, refetch } = useApi(
    () => patientsApi.getMedications(),
    []
  );
  const { data: history } = useApi(() => patientsApi.getCollectionHistory(), []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="My medications" subtitle="Your active chronic medication schedule" />
        <CardBody>
          {loading ? (
            <div className="py-10">
              <Spinner label="Loading medications…" />
            </div>
          ) : error ? (
            <ErrorState description={error.message} onRetry={refetch} />
          ) : !medications || medications.length === 0 ? (
            <EmptyState
              icon="medication"
              title="No medications on file"
              description="Your clinic hasn't added a chronic medication script yet."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/60 text-xs uppercase tracking-wide text-on-surface-variant">
                    <th className="py-2 pr-4 font-medium">Medication</th>
                    <th className="py-2 pr-4 font-medium">Dosage</th>
                    <th className="py-2 pr-4 font-medium">Frequency</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {medications.map((med) => (
                    <tr key={med.id}>
                      <td className="py-3 pr-4 font-semibold text-on-surface">{med.name}</td>
                      <td className="py-3 pr-4 text-on-surface-variant">{med.dosage}</td>
                      <td className="py-3 pr-4 text-on-surface-variant">{med.frequency}</td>
                      <td className="py-3 pr-4">
                        <StatusChip tone={med.status === "Active" ? "success-soft" : "warning-soft"}>
                          {med.status || "Active"}
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

      <Card>
        <CardHeader title="Collection history" subtitle="Past medication pickups" />
        <CardBody>
          {!history || history.length === 0 ? (
            <EmptyState icon="history" title="No past collections yet" />
          ) : (
            <ul className="divide-y divide-outline-variant/50">
              {history.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-on-surface">{c.medicationName}</p>
                    <p className="text-xs text-on-surface-variant">{c.clinicName} · {c.date}</p>
                  </div>
                  <StatusChip tone={c.status === "Collected" ? "success-soft" : "neutral"}>
                    {c.status}
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

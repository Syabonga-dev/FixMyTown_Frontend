import { useState } from "react";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { ErrorState, EmptyState } from "../../components/ui/EmptyState.jsx";
import StatusChip from "../../components/ui/StatusChip.jsx";
import { useApi } from "../../lib/useApi.js";
import { nursesApi } from "../../services/api/nurses.js";
import { useToast } from "../../components/ui/Toast.jsx";

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

export default function NursePatientsPage() {
  const [search, setSearch] = useState("");
  const { data: patients, loading, error, refetch, setData } = useApi(
    () => nursesApi.getAssignedPatients(),
    []
  );
  const toast = useToast();

  const filtered = (patients || []).filter((p) =>
    p.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (patientId, status) => {
    const prev = patients;
    setData((list) => list.map((p) => (p.id === patientId ? { ...p, status } : p)));
    try {
      await nursesApi.updatePatientStatus(patientId, status);
      toast.success("Patient status updated.");
    } catch {
      setData(prev);
      toast.error("Couldn't update status. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader
        title="Assigned patients"
        subtitle={`${filtered.length} patient${filtered.length === 1 ? "" : "s"}`}
        action={
          <Input
            placeholder="Search patients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
        }
      />
      <CardBody className="pt-0">
        {loading ? (
          <div className="py-10">
            <Spinner label="Loading patients…" />
          </div>
        ) : error ? (
          <ErrorState description={error.message} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="groups" title="No patients found" description="Try a different search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/60 text-xs uppercase tracking-wide text-on-surface-variant">
                  <th className="py-2 pr-4 font-medium">Patient</th>
                  <th className="py-2 pr-4 font-medium">ID number</th>
                  <th className="py-2 pr-4 font-medium">Medication</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4 font-semibold text-on-surface">{p.fullName}</td>
                    <td className="py-3 pr-4 text-on-surface-variant">{p.idNumber}</td>
                    <td className="py-3 pr-4 text-on-surface-variant">{p.medicationName || "—"}</td>
                    <td className="py-3 pr-4">
                      <StatusChip tone={statusTone(p.status)}>{p.status}</StatusChip>
                    </td>
                    <td className="py-3 pr-4">
                      {p.status !== "Collected" && (
                        <button
                          onClick={() => updateStatus(p.id, "Collected")}
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
  );
}

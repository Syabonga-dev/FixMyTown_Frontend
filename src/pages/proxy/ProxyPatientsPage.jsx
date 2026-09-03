import { useState } from "react";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { ErrorState, EmptyState } from "../../components/ui/EmptyState.jsx";
import StatusChip from "../../components/ui/StatusChip.jsx";
import { useApi } from "../../lib/useApi.js";
import { proxiesApi } from "../../services/api/proxies.js";
import { useToast } from "../../components/ui/Toast.jsx";

export default function ProxyPatientsPage() {
  const { data: patients, loading, error, refetch, setData } = useApi(
    () => proxiesApi.getManagedPatients(),
    []
  );
  const [requestingId, setRequestingId] = useState(null);
  const toast = useToast();

  const requestVerification = async (patientId) => {
    setRequestingId(patientId);
    try {
      await proxiesApi.requestVerification(patientId);
      toast.success("Verification request sent to the clinic.");
      setData((list) =>
        list.map((p) => (p.id === patientId ? { ...p, verificationRequested: true } : p))
      );
    } catch {
      toast.error("Couldn't send the verification request.");
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Patients under your care"
        subtitle="Only information your clinic has authorized you to see is shown here."
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
          <div className="grid gap-4 sm:grid-cols-2">
            {patients.map((p) => (
              <div key={p.id} className="rounded-lg border border-outline-variant/60 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{p.fullName}</p>
                    <p className="text-xs text-on-surface-variant">{p.relationship}</p>
                  </div>
                  <StatusChip tone={p.verified ? "success-soft" : "warning-soft"}>
                    {p.verified ? "Verified" : "Pending"}
                  </StatusChip>
                </div>
                {p.nextCollectionDate && (
                  <p className="mt-3 text-xs text-on-surface-variant">
                    Next collection: <span className="font-medium text-on-surface">{p.nextCollectionDate}</span>
                  </p>
                )}
                {!p.verified && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                    loading={requestingId === p.id}
                    disabled={p.verificationRequested}
                    onClick={() => requestVerification(p.id)}
                  >
                    {p.verificationRequested ? "Verification requested" : "Request verification"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

import { useEffect, useState, useCallback } from "react";
import Card, { CardBody, CardHeader } from "../../components/ui/Card.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { ErrorState, EmptyState } from "../../components/ui/EmptyState.jsx";
import StatusChip from "../../components/ui/StatusChip.jsx";
import ClinicMap from "../../components/maps/ClinicMap.jsx";
import { clinicsApi } from "../../services/api/clinics.js";

const DEFAULT_CENTER = { lat: -33.9608, lng: 25.6022 }; // Gqeberha, Eastern Cape

function capacityTone(pct) {
  if (pct == null) return "neutral";
  if (pct < 60) return "success-soft";
  if (pct < 85) return "warning-soft";
  return "error-soft";
}

export default function ClinicFinderPage() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const fetchClinics = useCallback((coords) => {
    setLoading(true);
    setError(null);
    clinicsApi
      .findNearby({ lat: coords.lat, lng: coords.lng })
      .then((data) => setClinics(data || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchClinics(DEFAULT_CENTER);
  }, [fetchClinics]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(coords);
        fetchClinics(coords);
      },
      () => {
        /* silently keep default center if permission denied */
      }
    );
  };

  const selectedClinic = clinics.find((c) => c.id === selectedId);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="order-2 flex flex-col lg:order-1 lg:col-span-2">
        <CardHeader
          title="Nearby clinics"
          subtitle={`${clinics.length} found`}
          action={
            <button
              onClick={useMyLocation}
              className="material-symbols-outlined rounded-md p-2 text-primary hover:bg-primary-container/10"
              title="Use my location"
            >
              my_location
            </button>
          }
        />
        <CardBody className="flex-1 overflow-y-auto pt-0">
          {loading ? (
            <div className="py-10">
              <Spinner label="Finding clinics near you…" />
            </div>
          ) : error ? (
            <ErrorState description={error.message} onRetry={() => fetchClinics(center)} />
          ) : clinics.length === 0 ? (
            <EmptyState icon="location_off" title="No clinics found nearby" />
          ) : (
            <ul className="space-y-3">
              {clinics.map((clinic) => (
                <li key={clinic.id}>
                  <button
                    onClick={() => setSelectedId(clinic.id)}
                    className={`w-full rounded-md border p-3.5 text-left transition-colors ${
                      selectedId === clinic.id
                        ? "border-primary bg-primary-container/10"
                        : "border-outline-variant/60 bg-white hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-on-surface">{clinic.name}</p>
                      <StatusChip tone={capacityTone(clinic.capacityPercent)}>
                        {clinic.capacityPercent != null ? `${clinic.capacityPercent}% full` : "—"}
                      </StatusChip>
                    </div>
                    <p className="mt-1 text-xs text-on-surface-variant">{clinic.address}</p>
                    {clinic.services?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {clinic.services.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-surface-container-low px-2 py-0.5 text-[11px] text-on-surface-variant"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    {clinic.distanceKm != null && (
                      <p className="mt-2 text-xs font-medium text-primary">
                        {clinic.distanceKm.toFixed(1)} km away
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card className="order-1 h-[420px] overflow-hidden lg:order-2 lg:col-span-3 lg:h-[calc(100vh-9.5rem)]">
        <ClinicMap
          center={center}
          clinics={clinics.map((c) => ({ id: c.id, name: c.name, lat: c.lat, lng: c.lng }))}
          selectedId={selectedId}
          onSelect={(c) => setSelectedId(c.id)}
        />
      </Card>

      {selectedClinic && (
        <div className="fixed bottom-4 left-1/2 z-10 hidden w-[min(360px,90vw)] -translate-x-1/2 rounded-lg border border-outline-variant/60 bg-white p-4 shadow-elevated sm:block lg:hidden">
          <p className="text-sm font-semibold text-on-surface">{selectedClinic.name}</p>
          <p className="text-xs text-on-surface-variant">{selectedClinic.address}</p>
        </div>
      )}
    </div>
  );
}

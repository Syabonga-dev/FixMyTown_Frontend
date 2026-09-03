import { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
let scriptLoadingPromise = null;

/** Loads the Google Maps JS API script exactly once, however many
 *  components mount ClinicMap concurrently. */
function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve(window.google);
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error("missing-key"));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("script-load-failed"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * Renders an interactive Google Map with a marker per clinic.
 *
 * @param {{lat:number,lng:number}} center
 * @param {Array<{id:string,name:string,lat:number,lng:number,address?:string}>} clinics
 * @param {string|null} selectedId
 * @param {(clinic:object)=>void} onSelect
 */
export default function ClinicMap({ center, clinics = [], selectedId, onSelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error-key | error-load

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !mapRef.current) return;
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          styles: MAP_STYLE,
        });
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err.message === "missing-key" ? "error-key" : "error-load");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter when `center` changes (e.g. geolocation resolves).
  useEffect(() => {
    if (status === "ready" && mapInstance.current && center) {
      mapInstance.current.panTo(center);
    }
  }, [center, status]);

  // Sync markers whenever the clinic list changes.
  useEffect(() => {
    if (status !== "ready" || !window.google) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = clinics.map((clinic) => {
      const marker = new window.google.maps.Marker({
        map: mapInstance.current,
        position: { lat: clinic.lat, lng: clinic.lng },
        title: clinic.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: clinic.id === selectedId ? 10 : 7,
          fillColor: "#006a6a",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => onSelect?.(clinic));
      return marker;
    });
  }, [clinics, status, selectedId, onSelect]);

  if (status === "error-key") {
    return (
      <MapFallback
        title="Google Maps API key not configured"
        description="Set VITE_GOOGLE_MAPS_API_KEY in your .env file to enable the live map. Restrict the key to your domain in the Google Cloud Console."
        clinics={clinics}
        onSelect={onSelect}
        selectedId={selectedId}
      />
    );
  }

  if (status === "error-load") {
    return (
      <MapFallback
        title="Couldn't load Google Maps"
        description="Check your connection or that the Maps JavaScript API is enabled for this key."
        clinics={clinics}
        onSelect={onSelect}
        selectedId={selectedId}
      />
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg">
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-container-low">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary">
            progress_activity
          </span>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}

function MapFallback({ title, description, clinics, onSelect, selectedId }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-6 text-center">
      <span className="material-symbols-outlined text-4xl text-outline">map</span>
      <div>
        <p className="text-sm font-semibold text-on-surface">{title}</p>
        <p className="mt-1 max-w-xs text-xs text-on-surface-variant">{description}</p>
      </div>
      {clinics.length > 0 && (
        <div className="w-full max-w-xs space-y-1.5 text-left">
          {clinics.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect?.(c)}
              className={`block w-full rounded-md border px-3 py-2 text-xs ${
                c.id === selectedId
                  ? "border-primary bg-primary-container/10 text-primary"
                  : "border-outline-variant bg-white text-on-surface"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// A muted, teal-tinted map style to match the clinical brand rather than
// Google's default bright palette.
const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f5faf9" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#3d4949" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5faf9" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c7e7e6" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#bcc9c8" }] },
];

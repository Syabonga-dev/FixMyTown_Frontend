import { api } from "./client.js";

export const clinicsApi = {
  /** GET /api/clinics?lat=..&lng=..&radiusKm=.. */
  findNearby: ({ lat, lng, radiusKm = 10 } = {}) => {
    const qs = new URLSearchParams({
      ...(lat != null ? { lat } : {}),
      ...(lng != null ? { lng } : {}),
      radiusKm,
    }).toString();
    return api.get(`/api/clinics?${qs}`);
  },
  getById: (clinicId) => api.get(`/api/clinics/${clinicId}`),
};

export const symptomCheckerApi = {
  /** POST /api/symptom-checker/assess  { symptoms: string[], severity } */
  assess: (payload) => api.post("/api/symptom-checker/assess", payload),
};

export const collectionsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/collections${qs ? `?${qs}` : ""}`);
  },
  getSummary: () => api.get("/api/collections/summary"),
  markCollected: (collectionId) => api.patch(`/api/collections/${collectionId}/collect`, {}),
};

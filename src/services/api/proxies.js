import { api } from "./client.js";

export const proxiesApi = {
  getDashboardSummary: () => api.get("/api/proxies/me/dashboard"),
  getManagedPatients: () => api.get("/api/proxies/me/patients"),
  getPatientDetail: (patientId) => api.get(`/api/proxies/me/patients/${patientId}`),
  requestVerification: (patientId) =>
    api.post(`/api/proxies/me/patients/${patientId}/request-verification`, {}),
};

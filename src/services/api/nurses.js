import { api } from "./client.js";

export const nursesApi = {
  getDashboardStats: () => api.get("/api/nurses/me/dashboard"),
  getAssignedPatients: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/nurses/me/patients${qs ? `?${qs}` : ""}`);
  },
  getUrgentAlerts: () => api.get("/api/nurses/me/alerts"),
  getSupplyLevels: () => api.get("/api/nurses/me/supplies"),
  getAuditLog: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/audit-log${qs ? `?${qs}` : ""}`);
  },
  updatePatientStatus: (patientId, status) =>
    api.patch(`/api/nurses/me/patients/${patientId}/status`, { status }),
  recordCollection: (payload) => api.post("/api/collections", payload),
};

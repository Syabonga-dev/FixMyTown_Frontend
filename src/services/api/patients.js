import { api } from "./client.js";

export const patientsApi = {
  getMe: () => api.get("/api/patients/me"),
  updateMe: (payload) => api.put("/api/patients/me", payload),

  getMedications: () => api.get("/api/patients/me/medications"),
  getUpcomingCollection: () => api.get("/api/patients/me/collections/next"),
  getCollectionHistory: () => api.get("/api/patients/me/collections"),

  getById: (patientId) => api.get(`/api/patients/${patientId}`),
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/patients${qs ? `?${qs}` : ""}`);
  },

  getNotifications: () => api.get("/api/patients/me/notifications"),
  markNotificationRead: (notificationId) =>
    api.patch(`/api/notifications/${notificationId}/read`, {}),
};

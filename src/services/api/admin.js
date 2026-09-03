import { api } from "./client.js";

// Nurse and Proxy users are never created through public self-registration —
// only an authenticated Admin (or an authorized Nurse manager) can provision
// those accounts, which is why these calls require an authenticated session
// with an Admin role on the backend (enforced server-side via [Authorize]).
export const adminApi = {
  /** POST /api/admin/staff  { role: "Nurse" | "Proxy", ...profileFields } */
  createStaff: (payload) => api.post("/api/admin/staff", payload),

  listStaff: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/admin/staff${qs ? `?${qs}` : ""}`);
  },

  deactivateStaff: (userId) => api.patch(`/api/admin/staff/${userId}/deactivate`, {}),
  reactivateStaff: (userId) => api.patch(`/api/admin/staff/${userId}/reactivate`, {}),

  getSystemStats: () => api.get("/api/admin/dashboard"),
};

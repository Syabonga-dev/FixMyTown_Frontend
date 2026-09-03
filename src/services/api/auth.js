import { api } from "./client.js";

// Endpoints assumed on the ASP.NET Core side. Adjust the paths here if your
// controllers use different routes — this is the only file that needs to
// change since every screen calls through these functions.

export const authApi = {
  /** POST /api/auth/login  { idNumber, password, role } -> { token, refreshToken, user } */
  login: (payload) => api.post("/api/auth/login", payload, { auth: false }),

  /** POST /api/auth/register/patient — the only public self-registration route.
   *  Nurse and Proxy accounts are created by an Admin via adminApi.createStaff. */
  registerPatient: (payload) =>
    api.post("/api/auth/register/patient", payload, { auth: false }),

  /** POST /api/auth/verify-phone  { userId, code } */
  verifyPhone: (payload) => api.post("/api/auth/verify-phone", payload, { auth: false }),

  /** POST /api/auth/resend-code  { userId } */
  resendCode: (payload) => api.post("/api/auth/resend-code", payload, { auth: false }),

  /** GET /api/auth/me — hydrate the session on app load */
  me: () => api.get("/api/auth/me"),

  /** POST /api/auth/logout — best-effort server-side session/refresh-token revoke */
  logout: () => api.post("/api/auth/logout", {}),
};

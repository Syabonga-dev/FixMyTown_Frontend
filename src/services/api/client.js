// ─────────────────────────────────────────────────────────────────────────
// Centralized API client for the PhilaLink ASP.NET Core backend.
//
// Every request in the app should go through `apiFetch` (directly or via the
// resource-specific helpers in this folder) rather than calling fetch()
// directly from components. That keeps auth headers, error handling and
// the base URL in exactly one place.
//
// Configure the backend origin with VITE_API_BASE_URL in your .env file
// (see .env.example). ASP.NET Core's default Kestrel dev port is 5174 in
// this project's Swagger doc (http://localhost:5174/swagger/v1/swagger.json),
// but you can point this at any environment (staging, prod) at build time.
// ─────────────────────────────────────────────────────────────────────────

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5174";

const TOKEN_KEY = "philalink_token";
const REFRESH_KEY = "philalink_refresh_token";
const USER_KEY = "philalink_user";

export const tokenStore = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  getUser: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setSession: ({ token, refreshToken, user }) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

/** Thrown for any non-2xx response. Components can check `.status` and
 *  `.errors` (ASP.NET Core ValidationProblemDetails-style field errors). */
export class ApiError extends Error {
  constructor(message, { status, errors, isNetworkError = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors || null;
    this.isNetworkError = isNetworkError;
  }
}

let onUnauthorized = null;
/** Called once from AuthContext so the client can force a logout on 401s
 *  without importing React state into this plain module. */
export function registerUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

let refreshPromise = null;

async function tryRefreshToken() {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return null;

  // Coalesce concurrent 401s into a single refresh call.
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json().catch(() => null);
        if (data?.token) {
          tokenStore.setSession({
            token: data.token,
            refreshToken: data.refreshToken,
            user: data.user,
          });
          return data.token;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * Core request helper.
 *
 * @param {string} path        e.g. "/api/patients/me"
 * @param {object} options
 * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} [options.method]
 * @param {object|FormData} [options.body]
 * @param {boolean} [options.auth]        attach Authorization header (default true)
 * @param {boolean} [options.retry401]    internal flag to prevent infinite refresh loops
 * @param {AbortSignal} [options.signal]
 */
export async function apiFetch(
  path,
  { method = "GET", body, auth = true, retry401 = true, signal, headers = {} } = {}
) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const finalHeaders = { Accept: "application/json", ...headers };
  if (!isFormData && body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (auth) {
    const token = tokenStore.getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError(
      "Can't reach the PhilaLink server. Check your connection and that the backend is running.",
      { isNetworkError: true }
    );
  }

  // Token expired — try one silent refresh, then replay the original request.
  if (res.status === 401 && auth && retry401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      return apiFetch(path, { method, body, auth, retry401: false, signal, headers });
    }
    tokenStore.clear();
    onUnauthorized?.();
    throw new ApiError("Your session has expired. Please log in again.", { status: 401 });
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    // ASP.NET Core's default ProblemDetails / ValidationProblemDetails shape
    const message =
      data?.title || data?.message || data?.error || `Request failed (${res.status})`;
    throw new ApiError(message, { status: res.status, errors: data?.errors });
  }

  return data;
}

export const api = {
  get: (path, opts) => apiFetch(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => apiFetch(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => apiFetch(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => apiFetch(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => apiFetch(path, { ...opts, method: "DELETE" }),
};

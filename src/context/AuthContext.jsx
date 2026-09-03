import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api/auth.js";
import { tokenStore, registerUnauthorizedHandler, ApiError } from "../services/api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStore.getUser());
  const [status, setStatus] = useState("idle"); // idle | loading | authenticated | unauthenticated
  const navigate = useNavigate();
  const hasBootstrapped = useRef(false);

  // Force a clean logout whenever the API client hits an un-refreshable 401.
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null);
      setStatus("unauthenticated");
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  // On first load, if we have a token, re-hydrate the user from the backend
  // (covers the case where localStorage has a stale/edited user blob).
  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    const token = tokenStore.getToken();
    if (!token) {
      setStatus("unauthenticated");
      return;
    }
    setStatus("loading");
    authApi
      .me()
      .then((me) => {
        setUser(me);
        tokenStore.setSession({ user: me });
        setStatus("authenticated");
      })
      .catch(() => {
        tokenStore.clear();
        setUser(null);
        setStatus("unauthenticated");
      });
  }, []);

  const login = useCallback(async ({ idNumber, password, role }) => {
    const data = await authApi.login({ idNumber, password, role });
    tokenStore.setSession({
      token: data.token,
      refreshToken: data.refreshToken,
      user: data.user,
    });
    setUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  const registerPatient = useCallback(async (payload) => {
    // Returns the created (unverified) user; the caller routes to the
    // phone-verification screen next — no session is established yet.
    return authApi.registerPatient(payload);
  }, []);

  const verifyPhone = useCallback(async (payload) => {
    const data = await authApi.verifyPhone(payload);
    if (data?.token) {
      tokenStore.setSession({
        token: data.token,
        refreshToken: data.refreshToken,
        user: data.user,
      });
      setUser(data.user);
      setStatus("authenticated");
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // best-effort — clear the local session regardless of backend result
    }
    tokenStore.clear();
    setUser(null);
    setStatus("unauthenticated");
    navigate("/login", { replace: true });
  }, [navigate]);

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: status === "authenticated" && !!user,
    isLoading: status === "loading" || status === "idle",
    login,
    registerPatient,
    verifyPhone,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { ApiError };

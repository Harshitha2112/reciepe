import { create } from "zustand";
import { loginUser, registerUser, getMe } from "../services/api";

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  // ── Login ─────────────────────────────────────────────
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await loginUser(credentials);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      set({ user: data, token: data.token, loading: false });
      return { success: true, user: data };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  // ── Register ──────────────────────────────────────────
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await registerUser(userData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      set({ user: data, token: data.token, loading: false });
      return { success: true, user: data };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  // ── Logout ────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  // ── Refresh user profile ──────────────────────────────
  refreshUser: async () => {
    try {
      const { data } = await getMe();
      localStorage.setItem("user", JSON.stringify({ ...data, token: get().token }));
      set({ user: { ...data, token: get().token } });
    } catch (_) {}
  },

  // ── Role helpers ──────────────────────────────────────
  isAdmin:    () => get().user?.role === "ADMIN",
  isSubAdmin: () => ["ADMIN", "SUBADMIN"].includes(get().user?.role),
  isLoggedIn: () => !!get().token,

  clearError: () => set({ error: null }),
}));

export default useAuthStore;

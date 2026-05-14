import { create } from "zustand";
import axiosInstance from "../axiosInstance";

export const useAuth = create((set) => ({
  currentUser: null,
  loading: false,
  isAuthenticated: false,
  error: null,

  login: async (userCred) => {
    try {
      set({ loading: true, currentUser: null, isAuthenticated: false, error: null });
      let res = await axiosInstance.post("/auth/login", userCred);
      if (res.status === 200) {
        // ✅ Save token to localStorage
        localStorage.setItem("token", res.data.token);
        set({
          currentUser: res.data?.payload,
          loading: false,
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (err) {
      console.log("err is ", err);
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.message || "Login failed",
      });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.get("/auth/logout");
      // ✅ Remove token from localStorage
      localStorage.removeItem("token");
      set({
        currentUser: null,
        isAuthenticated: false,
        error: null,
        loading: false,
      });
    } catch (err) {
      // ✅ Even if API call fails, clear localStorage
      localStorage.removeItem("token");
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.message || "Logout failed",
      });
    }
  },

  checkAuth: async () => {
    try {
      // ✅ If no token in localStorage, skip API call
      const token = localStorage.getItem("token");
      if (!token) {
        set({ currentUser: null, isAuthenticated: false, loading: false });
        return;
      }
      set({ loading: true });
      const res = await axiosInstance.get("/auth/check-auth");
      set({
        currentUser: res.data.payload,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      // ✅ Clear bad/expired token
      localStorage.removeItem("token");
      set({
        currentUser: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },
}));
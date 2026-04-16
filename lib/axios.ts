// dpl-frontend/lib/axios.ts

import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Read directly from zustand persisted store in localStorage
      const raw = localStorage.getItem("dpl-auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.accessToken;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("dpl-auth");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

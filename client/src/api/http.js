import axios from "axios";
import { clearToken, getToken } from "../utils/tokenStorage";

const getApiBaseUrl = () => {
  const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const configuredApiUrl = import.meta.env.VITE_API_URL;

  if (configuredApiUrl) {
    const configuredApiHost = new URL(configuredApiUrl).hostname;
    const configuredApiIsLocalhost = ["localhost", "127.0.0.1"].includes(configuredApiHost);

    if (isLocalhost || !configuredApiIsLocalhost) {
      return configuredApiUrl;
    }
  }

  return isLocalhost
    ? "http://localhost:5000/api"
    : "https://placement-prep-zq6u.onrender.com/api";
};

const http = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 12000
});

http.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();

      if (!window.location.pathname.includes("/login")) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default http;

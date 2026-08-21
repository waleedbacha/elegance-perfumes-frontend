// frontend/src/services/api.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Track ongoing requests to prevent duplicates
const pendingRequests = new Map();

const getRequestKey = (config) => {
  const { method, url, params, data } = config;
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Prevent duplicate requests
    const requestKey = getRequestKey(config);
    const now = Date.now();

    if (pendingRequests.has(requestKey)) {
      const existing = pendingRequests.get(requestKey);
      if (now - existing.timestamp < 500) {
        const cancelToken = axios.CancelToken.source();
        config.cancelToken = cancelToken.token;
        cancelToken.cancel("Duplicate request cancelled");
        return config;
      }
    }

    pendingRequests.set(requestKey, {
      timestamp: now,
      cancel: config.cancelToken,
    });

    setTimeout(() => {
      for (const [key, value] of pendingRequests) {
        if (now - value.timestamp > 1000) {
          pendingRequests.delete(key);
        }
      }
    }, 1000);

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const requestKey = getRequestKey(response.config);
    pendingRequests.delete(requestKey);
    return response;
  },
  async (error) => {
    if (error.config) {
      const requestKey = getRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }

    // ✅ Handle 429 Rate Limiting
    if (error.response?.status === 429) {
      const retryAfter =
        parseInt(error.response?.headers?.["retry-after"]) || 30;

      // ✅ Return a structured error
      return Promise.reject({
        ...error,
        message:
          error.response?.data?.error?.message ||
          `Too many requests. Please wait ${retryAfter} seconds.`,
        isRateLimit: true,
        retryAfter: retryAfter,
        status: 429,
      });
    }

    // ✅ Handle 401 Unauthorized
    if (error.response?.status === 401 && !error.config?._retry) {
      if (error.config) {
        error.config._retry = true;
      }

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { token } = response.data.data;
          localStorage.setItem("token", token);
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${token}`;
            return api(error.config);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;

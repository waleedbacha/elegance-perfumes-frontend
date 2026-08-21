// frontend/src/services/cacheService.js
import api from "./api";

const cacheService = {
  // ============================================
  // GET CACHE STATISTICS
  // ============================================
  getStats: async () => {
    const response = await api.get("/cache/stats");
    return response.data;
  },

  // ============================================
  // CLEAR ALL CACHES
  // ============================================
  clearAll: async () => {
    const response = await api.delete("/cache/all");
    return response.data;
  },

  // ============================================
  // CLEAR MEMORY CACHE
  // ============================================
  clearMemory: async () => {
    const response = await api.delete("/cache/memory");
    return response.data;
  },

  // ============================================
  // CLEAR REDIS CACHE
  // ============================================
  clearRedis: async () => {
    const response = await api.delete("/cache/redis");
    return response.data;
  },

  // ============================================
  // CLEAR IMAGE CACHE
  // ============================================
  clearImages: async () => {
    const response = await api.delete("/cache/images");
    return response.data;
  },

  // ============================================
  // CLEAR BY PREFIX
  // ============================================
  clearByPrefix: async (prefix) => {
    const response = await api.delete(`/cache/prefix/${prefix}`);
    return response.data;
  },

  // ============================================
  // RUN CLEANUP
  // ============================================
  runCleanup: async () => {
    const response = await api.post("/cache/cleanup");
    return response.data;
  },

  // ============================================
  // CLEAR BROWSER CACHE
  // ============================================
  clearBrowserCache: async () => {
    const response = await api.post("/cache/browser");
    return response.data;
  },
};

export default cacheService;

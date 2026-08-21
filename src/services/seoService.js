import api from "./api";

const seoService = {
  // ============================================
  // GET SETTINGS
  // ============================================
  getSeoSettings: async () => {
    const response = await api.get("/seo/settings");
    return response.data;
  },

  // ============================================
  // UPDATE GLOBAL SETTINGS
  // ============================================
  updateGlobalSettings: async (data) => {
    const response = await api.put("/seo/settings/global", data);
    return response.data;
  },

  // ============================================
  // UPDATE PAGE SETTINGS
  // ============================================
  updatePageSettings: async (page, data) => {
    const response = await api.put(`/seo/settings/page/${page}`, { data });
    return response.data;
  },

  // ============================================
  // UPDATE PRODUCT TEMPLATES
  // ============================================
  updateProductTemplates: async (data) => {
    const response = await api.put("/seo/settings/product-templates", data);
    return response.data;
  },

  // ============================================
  // UPDATE CATEGORY TEMPLATES
  // ============================================
  updateCategoryTemplates: async (data) => {
    const response = await api.put("/seo/settings/category-templates", data);
    return response.data;
  },

  // ============================================
  // UPDATE SITEMAP SETTINGS
  // ============================================
  updateSitemapSettings: async (data) => {
    const response = await api.put("/seo/settings/sitemap", data);
    return response.data;
  },

  // ============================================
  // UPDATE SOCIAL SETTINGS
  // ============================================
  updateSocialSettings: async (data) => {
    const response = await api.put("/seo/settings/social", data);
    return response.data;
  },

  // ============================================
  // CUSTOM PAGES
  // ============================================
  addCustomPage: async (data) => {
    const response = await api.post("/seo/custom-pages", data);
    return response.data;
  },

  updateCustomPage: async (route, data) => {
    const response = await api.put(`/seo/custom-pages/${route}`, data);
    return response.data;
  },

  deleteCustomPage: async (route) => {
    const response = await api.delete(`/seo/custom-pages/${route}`);
    return response.data;
  },

  // ============================================
  // PREVIEW
  // ============================================
  getSeoPreview: async (params) => {
    const response = await api.get("/seo/preview", { params });
    return response.data;
  },

  // ============================================
  // AUDIT
  // ============================================
  runSeoAudit: async () => {
    const response = await api.post("/seo/audit");
    return response.data;
  },

  // ============================================
  // BULK UPDATE
  // ============================================
  bulkUpdateProductSeo: async (data) => {
    const response = await api.put("/seo/bulk-update", data);
    return response.data;
  },

  // ============================================
  // HISTORY
  // ============================================
  getSeoHistory: async () => {
    const response = await api.get("/seo/history");
    return response.data;
  },

  // ============================================
  // RESET
  // ============================================
  resetToDefaults: async () => {
    const response = await api.post("/seo/reset");
    return response.data;
  },

  // frontend/src/services/seoService.js
  // Add these methods

  // ============================================
  // SEO DASHBOARD & ANALYTICS
  // ============================================

  getSeoDashboard: async () => {
    const response = await api.get("/seo/dashboard");
    return response.data;
  },

  getKeywordRankings: async (params = {}) => {
    const response = await api.get("/seo/rankings", { params });
    return response.data;
  },

  getKeywordSuggestions: async (query = "") => {
    const response = await api.get("/seo/keyword-suggestions", {
      params: { query },
    });
    return response.data;
  },

  getKeywordCannibalization: async () => {
    const response = await api.get("/seo/cannibalization");
    return response.data;
  },

  analyzeKeywordDifficulty: async (keyword) => {
    const response = await api.get("/seo/keyword-difficulty", {
      params: { keyword },
    });
    return response.data;
  },
};

export default seoService;

import api from "./api";

const settingService = {
  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  // GET /api/v1/settings/public/:group
  getPublicSettings: async (group) => {
    const response = await api.get(`/settings/public/${group}`);
    console.log(`📤 getPublicSettings raw response:`, response.data);
    return response.data;
  },

  // GET /api/v1/settings/public/single/:key
  getPublicSetting: async (key) => {
    const response = await api.get(`/settings/public/single/${key}`);
    return response.data;
  },

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  // GET /api/v1/settings/admin/all
  getAllSettings: async () => {
    const response = await api.get("/settings/admin/all");
    return response.data;
  },

  // GET /api/v1/settings/admin/:key
  getSetting: async (key) => {
    const response = await api.get(`/settings/admin/${key}`);
    return response.data;
  },

  // POST /api/v1/settings/admin/set
  setSetting: async (data) => {
    const response = await api.post("/settings/admin/set", data);
    return response.data;
  },

  // POST /api/v1/settings/admin/upload-image
  uploadSettingImage: async (key, file) => {
    const formData = new FormData();
    formData.append("key", key);
    formData.append("image", file);

    const response = await api.post("/settings/admin/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // POST /api/v1/settings/admin/bulk
  bulkUpdateSettings: async (settings) => {
    const response = await api.post("/settings/admin/bulk", { settings });
    return response.data;
  },

  // DELETE /api/v1/settings/admin/:key
  deleteSetting: async (key) => {
    const response = await api.delete(`/settings/admin/${key}`);
    return response.data;
  },

  // POST /api/v1/settings/admin/init/category
  initCategorySettings: async () => {
    const response = await api.post("/settings/admin/init/category");
    return response.data;
  },

  // POST /api/v1/settings/admin/init/collection
  initCollectionSettings: async () => {
    const response = await api.post("/settings/admin/init/collection");
    return response.data;
  },

  // Add this method
  // POST /api/v1/settings/admin/init/shop
  initShopSettings: async () => {
    const response = await api.post("/settings/admin/init/shop");
    return response.data;
  },

  initAboutSettings: async () => {
    const response = await api.post("/settings/admin/init/about");
    return response.data;
  },
};

export default settingService;

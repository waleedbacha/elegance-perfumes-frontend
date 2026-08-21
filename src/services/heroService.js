import api from "./api";

const heroService = {
  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  // GET /api/v1/hero
  getHero: async () => {
    const response = await api.get("/hero");
    return response.data;
  },

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  // GET /api/v1/hero/admin/all
  getAllHeroes: async () => {
    const response = await api.get("/hero/admin/all");
    return response.data;
  },

  // GET /api/v1/hero/admin/:id
  getHeroById: async (id) => {
    const response = await api.get(`/hero/admin/${id}`);
    return response.data;
  },

  // POST /api/v1/hero
  createHero: async (formData) => {
    const response = await api.post("/hero", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // PUT /api/v1/hero/admin/:id
  updateHero: async (id, formData) => {
    const response = await api.put(`/hero/admin/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // DELETE /api/v1/hero/admin/:id
  deleteHero: async (id) => {
    const response = await api.delete(`/hero/admin/${id}`);
    return response.data;
  },

  // POST /api/v1/hero/admin/seed
  seedHero: async () => {
    const response = await api.post("/hero/admin/seed");
    return response.data;
  },

  // PUT /api/v1/hero/admin/:id/toggle
  toggleHeroStatus: async (id, isActive) => {
    const response = await api.put(`/hero/admin/${id}/toggle`, { isActive });
    return response.data;
  },
};

export default heroService;

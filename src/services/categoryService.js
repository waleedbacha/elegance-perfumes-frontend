import api from "./api";

const categoryService = {
  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  // GET /api/v1/categories
  getCategories: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  // GET /api/v1/categories/name/:name
  getCategoryByName: async (name) => {
    const response = await api.get(`/categories/name/${name}`);
    return response.data;
  },

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  // GET /api/v1/categories/admin/all
  getAllCategories: async () => {
    const response = await api.get("/categories/admin/all");
    return response.data;
  },

  // GET /api/v1/categories/admin/:id
  getCategory: async (id) => {
    const response = await api.get(`/categories/admin/${id}`);
    return response.data;
  },

  // POST /api/v1/categories - FormData
  createCategory: async (formData) => {
    const response = await api.post("/categories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // PUT /api/v1/categories/admin/:id - FormData
  updateCategory: async (id, formData) => {
    const response = await api.put(`/categories/admin/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // DELETE /api/v1/categories/admin/:id
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/admin/${id}`);
    return response.data;
  },

  // POST /api/v1/categories/admin/reorder
  reorderCategories: async (categories) => {
    const response = await api.post("/categories/admin/reorder", {
      categories,
    });
    return response.data;
  },

  // POST /api/v1/categories/admin/seed
  seedCategories: async () => {
    const response = await api.post("/categories/admin/seed");
    return response.data;
  },
};

export default categoryService;

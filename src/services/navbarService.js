import api from "./api";

const navbarService = {
  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  getNavbar: async () => {
    const response = await api.get("/navbar");
    return response;
  },

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  getAllNavbarItems: async () => {
    const response = await api.get("/navbar/admin/all");
    return response;
  },

  getNavbarItem: async (id) => {
    const response = await api.get(`/navbar/admin/${id}`);
    return response;
  },

  createNavbarItem: async (data) => {
    const response = await api.post("/navbar/admin", data);
    return response; // ✅ Return full response
  },

  updateNavbarItem: async (id, data) => {
    const response = await api.put(`/navbar/admin/${id}`, data);
    return response; // ✅ Return full response
  },

  deleteNavbarItem: async (id) => {
    const response = await api.delete(`/navbar/admin/${id}`);
    return response;
  },

  reorderNavbarItems: async (items) => {
    const response = await api.post("/navbar/admin/reorder", { items });
    return response;
  },

  seedNavbar: async () => {
    const response = await api.post("/navbar/admin/seed");
    return response;
  },

  toggleVisibility: async (id) => {
    const response = await api.put(`/navbar/admin/${id}/toggle-visibility`);
    return response;
  },
};

export default navbarService;

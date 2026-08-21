import api from "./api";

const couponService = {
  // ==========================================
  // PUBLIC COUPON ENDPOINTS
  // ==========================================

  // GET /api/v1/coupons/validate/:code
  validateCoupon: async (code, orderAmount = 0, productIds = []) => {
    const response = await api.get(`/coupons/validate/${code}`, {
      params: { orderAmount, productIds: productIds.join(",") },
    });
    return response.data;
  },

  // ==========================================
  // ADMIN COUPON ENDPOINTS
  // ==========================================

  // POST /api/v1/coupons
  createCoupon: async (couponData) => {
    const response = await api.post("/coupons", couponData);
    return response.data;
  },

  // GET /api/v1/coupons
  getAllCoupons: async (params = {}) => {
    const response = await api.get("/coupons", { params });
    return response.data;
  },

  // GET /api/v1/coupons/:id
  getCoupon: async (id) => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },

  // PUT /api/v1/coupons/:id
  updateCoupon: async (id, couponData) => {
    const response = await api.put(`/coupons/${id}`, couponData);
    return response.data;
  },

  // DELETE /api/v1/coupons/:id
  deleteCoupon: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },

  // PUT /api/v1/coupons/:id/toggle
  toggleCouponStatus: async (id) => {
    const response = await api.put(`/coupons/${id}/toggle`);
    return response.data;
  },

  // GET /api/v1/coupons/analytics
  getCouponAnalytics: async () => {
    const response = await api.get("/coupons/analytics");
    return response.data;
  },

  // POST /api/v1/coupons/bulk-delete
  bulkDeleteCoupons: async (couponIds) => {
    const response = await api.post("/coupons/bulk-delete", { couponIds });
    return response.data;
  },
};

export default couponService;

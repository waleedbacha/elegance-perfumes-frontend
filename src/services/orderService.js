import api from "./api";

const orderService = {
  // ==========================================
  // USER ORDER ENDPOINTS
  // ==========================================

  // POST /api/v1/orders
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  // GET /api/v1/orders
  getOrders: async (params = {}) => {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  // GET /api/v1/orders/:id
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // GET /api/v1/orders/:id/track
  trackOrder: async (id) => {
    const response = await api.get(`/orders/${id}/track`);
    return response.data;
  },

  // PUT /api/v1/orders/:id/cancel
  cancelOrder: async (id, reason) => {
    const response = await api.put(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // ==========================================
  // ADMIN ORDER ENDPOINTS
  // ==========================================

  // ✅ GET /api/v1/orders/admin/all - Fetch ALL orders
  getAllOrders: async (params = {}) => {
    const response = await api.get("/orders/admin/all", { params });
    return response.data;
  },

  // GET /api/v1/orders/admin/:id
  getOrderAdmin: async (id) => {
    const response = await api.get(`/orders/admin/${id}`);
    return response.data;
  },

  // GET /api/v1/orders/admin/stats
  getOrderStats: async () => {
    const response = await api.get("/orders/admin/stats");
    return response.data;
  },

  // ✅ PUT /api/v1/orders/admin/:id/status - Update order status
  updateOrderStatus: async (id, status, note = "") => {
    const response = await api.put(`/orders/admin/${id}/status`, {
      status,
      note,
    });
    return response.data;
  },

  // PUT /api/v1/orders/admin/:id/tracking
  updateTracking: async (id, trackingNumber, provider, url = "") => {
    const response = await api.put(`/orders/admin/${id}/tracking`, {
      trackingNumber,
      provider,
      url,
    });
    return response.data;
  },

  // POST /api/v1/orders/admin/:id/tracking-update
  addTrackingUpdate: async (id, status, location, description) => {
    const response = await api.post(`/orders/admin/${id}/tracking-update`, {
      status,
      location,
      description,
    });
    return response.data;
  },

  // POST /api/v1/orders/admin/:id/invoice
  generateInvoice: async (id) => {
    const response = await api.post(`/orders/admin/${id}/invoice`);
    return response.data;
  },

  // orderService.js - Add these methods

  // POST /api/v1/orders/admin/:id/confirm-payment
  confirmPayment: async (id, amount, note, paymentMethod) => {
    const response = await api.post(`/orders/admin/${id}/confirm-payment`, {
      amount,
      note,
      paymentMethod,
    });
    return response.data;
  },

  // POST /api/v1/orders/admin/:id/mark-payment-failed
  markPaymentFailed: async (id, reason) => {
    const response = await api.post(`/orders/admin/${id}/mark-payment-failed`, {
      reason,
    });
    return response.data;
  },
};

export default orderService;

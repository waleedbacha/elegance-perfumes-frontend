import api from "./api";

const cartService = {
  // ==========================================
  // CART ENDPOINTS
  // ==========================================

  // GET /api/v1/cart
  getCart: async () => {
    const response = await api.get("/cart");
    return response.data;
  },

  // GET /api/v1/cart/summary
  getCartSummary: async () => {
    const response = await api.get("/cart/summary");
    return response.data;
  },

  // POST /api/v1/cart/items
  addToCart: async (productId, size, quantity = 1) => {
    const response = await api.post("/cart/items", {
      productId,
      size,
      quantity,
    });
    return response.data;
  },

  // PUT /api/v1/cart/items
  updateCartItem: async (productId, size, quantity) => {
    const response = await api.put("/cart/items", {
      productId,
      size,
      quantity,
    });
    return response.data;
  },

  // DELETE /api/v1/cart/items/:productId/:size
  removeFromCart: async (productId, size) => {
    const response = await api.delete(`/cart/items/${productId}/${size}`);
    return response.data;
  },

  // DELETE /api/v1/cart
  clearCart: async () => {
    const response = await api.delete("/cart");
    return response.data;
  },

  // POST /api/v1/cart/coupon
  applyCoupon: async (code) => {
    const response = await api.post("/cart/coupon", { code });
    return response.data;
  },

  // DELETE /api/v1/cart/coupon
  removeCoupon: async () => {
    const response = await api.delete("/cart/coupon");
    return response.data;
  },

  // POST /api/v1/cart/merge
  mergeCart: async (sessionId) => {
    const response = await api.post("/cart/merge", { sessionId });
    return response.data;
  },
};

export default cartService;
import api from "./api";

const wishlistService = {
  // ==========================================
  // WISHLIST ENDPOINTS
  // ==========================================

  // GET /api/v1/wishlist
  getWishlist: async () => {
    const response = await api.get("/wishlist");
    return response.data;
  },

  // POST /api/v1/wishlist
  addToWishlist: async (productId) => {
    const response = await api.post("/wishlist", { productId });
    return response.data;
  },

  // DELETE /api/v1/wishlist/:productId
  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  },

  // POST /api/v1/wishlist/toggle
  toggleWishlist: async (productId) => {
    const response = await api.post("/wishlist/toggle", { productId });
    return response.data;
  },

  // GET /api/v1/wishlist/check/:productId
  checkWishlist: async (productId) => {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data;
  },

  // POST /api/v1/wishlist/check
  bulkCheckWishlist: async (productIds) => {
    const response = await api.post("/wishlist/check", { productIds });
    return response.data;
  },

  // GET /api/v1/wishlist/price-drops
  getPriceDrops: async () => {
    const response = await api.get("/wishlist/price-drops");
    return response.data;
  },

  // GET /api/v1/wishlist/stats
  getWishlistStats: async () => {
    const response = await api.get("/wishlist/stats");
    return response.data;
  },

  // PUT /api/v1/wishlist/price-drop
  setPriceDropNotification: async (productId, notify) => {
    const response = await api.put("/wishlist/price-drop", {
      productId,
      notify,
    });
    return response.data;
  },

  // PUT /api/v1/wishlist/back-in-stock
  setBackInStockNotification: async (productId, notify) => {
    const response = await api.put("/wishlist/back-in-stock", {
      productId,
      notify,
    });
    return response.data;
  },
};

export default wishlistService;

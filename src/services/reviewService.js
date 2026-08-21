import api from "./api";

const reviewService = {
  // ==========================================
  // REVIEW ENDPOINTS
  // ==========================================

  // POST /api/v1/reviews - JSON
  createReview: async (reviewData) => {
    const response = await api.post("/reviews", reviewData);
    return response.data;
  },

  // ✅ POST /api/v1/reviews - FormData (with images)
  createReviewWithImages: async (formData) => {
    const response = await api.post("/reviews", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // GET /api/v1/reviews/product/:productId
  getProductReviews: async (productId, params = {}) => {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  },

  // GET /api/v1/reviews/me
  getUserReviews: async (params = {}) => {
    const response = await api.get("/reviews/me", { params });
    return response.data;
  },

  // PUT /api/v1/reviews/:id
  updateReview: async (id, reviewData) => {
    const response = await api.put(`/reviews/${id}`, reviewData);
    return response.data;
  },

  // DELETE /api/v1/reviews/:id
  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },

  // POST /api/v1/reviews/:id/helpful
  markHelpful: async (id) => {
    const response = await api.post(`/reviews/${id}/helpful`);
    return response.data;
  },

  // POST /api/v1/reviews/:id/not-helpful
  markNotHelpful: async (id) => {
    const response = await api.post(`/reviews/${id}/not-helpful`);
    return response.data;
  },

  // ==========================================
  // ADMIN REVIEW ENDPOINTS
  // ==========================================

  // GET /api/v1/reviews/admin/all
  getAllReviews: async (params = {}) => {
    const response = await api.get("/reviews/admin/all", { params });
    return response.data;
  },

  // GET /api/v1/reviews/admin/:id
  getReviewAdmin: async (id) => {
    const response = await api.get(`/reviews/admin/${id}`);
    return response.data;
  },

  // PUT /api/v1/reviews/admin/:id/approve
  approveReview: async (id) => {
    const response = await api.put(`/reviews/admin/${id}/approve`);
    return response.data;
  },

  // PUT /api/v1/reviews/admin/:id/reject
  rejectReview: async (id, reason) => {
    const response = await api.put(`/reviews/admin/${id}/reject`, { reason });
    return response.data;
  },

  // POST /api/v1/reviews/admin/:id/respond
  adminRespond: async (id, response) => {
    const responseData = await api.post(`/reviews/admin/${id}/respond`, {
      response,
    });
    return responseData.data;
  },
};

export default reviewService;

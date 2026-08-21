import api from "./api";

const productService = {
  // ==========================================
  // PUBLIC PRODUCT ENDPOINTS
  // ==========================================

  // GET /api/v1/products
  getProducts: async (params = {}) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  // GET /api/v1/products/:id
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // GET /api/v1/products/slug/:slug
  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  // GET /api/v1/products/featured
  getFeatured: async (limit = 10) => {
    const response = await api.get("/products/featured", { params: { limit } });
    return response.data;
  },

  // GET /api/v1/products/new-arrivals
  getNewArrivals: async (limit = 10) => {
    const response = await api.get("/products/new-arrivals", {
      params: { limit },
    });
    return response.data;
  },

  // GET /api/v1/products/best-sellers
  getBestSellers: async (limit = 10) => {
    const response = await api.get("/products/best-sellers", {
      params: { limit },
    });
    return response.data;
  },

  // GET /api/v1/products/category/:category
  getProductsByCategory: async (category, params = {}) => {
    const response = await api.get(`/products/category/${category}`, {
      params,
    });
    return response.data;
  },

  // GET /api/v1/products/brand/:brand
  getProductsByBrand: async (brand, params = {}) => {
    const response = await api.get(`/products/brand/${brand}`, { params });
    return response.data;
  },

  // ==========================================
  // ADMIN PRODUCT ENDPOINTS (Require Admin Token)
  // ==========================================

  // POST /api/v1/products - JSON
  createProduct: async (productData) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  // POST /api/v1/products - FormData (for images)
  createProductWithImages: async (formData) => {
    const response = await api.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // PUT /api/v1/products/:id - FormData (for images) - ✅ FIXED
  updateProductWithImages: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // PUT /api/v1/products/:id - JSON (no images)
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // DELETE /api/v1/products/:id
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // PUT /api/v1/products/:id/status
  toggleProductStatus: async (id, status) => {
    const response = await api.put(`/products/${id}/status`, { status });
    return response.data;
  },

  // PUT /api/v1/products/:id/stock
  updateProductStock: async (id, stockData) => {
    const response = await api.put(`/products/${id}/stock`, stockData);
    return response.data;
  },

  // POST /api/v1/products/bulk-import
  bulkImportProducts: async (products) => {
    const response = await api.post("/products/bulk-import", { products });
    return response.data;
  },

  // POST /api/v1/products/bulk-upload
  bulkUploadProducts: async (formData) => {
    const response = await api.post("/products/bulk-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // GET /api/v1/products/bulk-upload/template
  downloadTemplate: async () => {
    const response = await api.get("/products/bulk-upload/template", {
      responseType: "blob",
    });
    return response.data;
  },
  // Add this to productService.js

  // POST /api/v1/products/:id/duplicate
  duplicateProduct: async (id) => {
    const response = await api.post(`/products/${id}/duplicate`);
    return response.data;
  },
};

export default productService;

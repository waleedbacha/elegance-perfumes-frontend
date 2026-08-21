import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from "../../services/productService";

// ============================================
// Initial State
// ============================================
const initialState = {
  products: [],
  selectedProduct: null,
  featured: [],
  newArrivals: [],
  bestSellers: [],
  isLoading: false,
  error: null,
  success: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    search: "",
    category: null,
    brand: null,
    minPrice: null,
    maxPrice: null,
    rating: null,
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

// ============================================
// Async Thunks
// ============================================

// Get product
export const getProducts = createAsyncThunk(
  "products/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch products",
      );
    }
  },
);

// GET /api/v1/products/:id
export const getProductById = createAsyncThunk(
  "products/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getProduct(id);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch product",
      );
    }
  },
);

// GET /api/v1/products/slug/:slug
export const getProductBySlug = createAsyncThunk(
  "products/getBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await productService.getProductBySlug(slug);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch product",
      );
    }
  },
);

// GET /api/v1/products/featured
export const getFeaturedProducts = createAsyncThunk(
  "products/getFeatured",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await productService.getFeatured(limit);
      return response.data.products;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch featured products",
      );
    }
  },
);

// GET /api/v1/products/new-arrivals
export const getNewArrivals = createAsyncThunk(
  "products/getNewArrivals",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await productService.getNewArrivals(limit);
      return response.data.products;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch new arrivals",
      );
    }
  },
);

// GET /api/v1/products/best-sellers
export const getBestSellers = createAsyncThunk(
  "products/getBestSellers",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await productService.getBestSellers(limit);
      return response.data.products;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch best sellers",
      );
    }
  },
);

// GET /api/v1/products/category/:category
export const getProductsByCategory = createAsyncThunk(
  "products/getByCategory",
  async ({ category, params = {} }, { rejectWithValue }) => {
    try {
      const response = await productService.getProductsByCategory(
        category,
        params,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch products by category",
      );
    }
  },
);

// GET /api/v1/products/brand/:brand
export const getProductsByBrand = createAsyncThunk(
  "products/getByBrand",
  async ({ brand, params = {} }, { rejectWithValue }) => {
    try {
      const response = await productService.getProductsByBrand(brand, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch products by brand",
      );
    }
  },
);

// ============================================
// ADMIN THUNKS (Require Admin Token)
// ============================================

// POST /api/v1/products
export const createProduct = createAsyncThunk(
  "products/create",
  async (productData, { rejectWithValue }) => {
    try {
      // If productData is FormData, send as is
      if (productData instanceof FormData) {
        const response =
          await productService.createProductWithImages(productData);
        return response.data.product;
      }

      // Otherwise use regular JSON
      const response = await productService.createProduct(productData);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to create product",
      );
    }
  },
);

// PUT /api/v1/products/:id - ✅ FIXED to detect FormData
export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      let response;

      // ✅ Check if productData is FormData (has images)
      if (productData instanceof FormData) {
        response = await productService.updateProductWithImages(
          id,
          productData,
        );
      } else {
        response = await productService.updateProduct(id, productData);
      }

      return response.data.product;
    } catch (error) {
      console.error("❌ Update product error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update product",
      );
    }
  },
);

// DELETE /api/v1/products/:id
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.deleteProduct(id);
      return { id, message: response.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to delete product",
      );
    }
  },
);

// PUT /api/v1/products/:id/status
export const toggleProductStatus = createAsyncThunk(
  "products/toggleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await productService.toggleProductStatus(id, status);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to update product status",
      );
    }
  },
);

// PUT /api/v1/products/:id/stock
export const updateProductStock = createAsyncThunk(
  "products/updateStock",
  async ({ id, stockData }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProductStock(id, stockData);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to update product stock",
      );
    }
  },
);

// BULK UPLOAD products (Admin)
export const bulkUploadProducts = createAsyncThunk(
  "products/bulkUpload",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await productService.bulkUploadProducts(formData);
      // ✅ Return the data properly
      if (response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Failed to bulk upload products";
      return rejectWithValue(message);
    }
  },
);

// DOWNLOAD template (Admin)
export const downloadTemplate = createAsyncThunk(
  "products/downloadTemplate",
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.downloadTemplate();

      // ✅ Create download link with proper blob
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "product-bulk-upload-template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to download template",
      );
    }
  },
);

// ✅ ADDED: Duplicate Product
export const duplicateProduct = createAsyncThunk(
  "products/duplicate",
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.duplicateProduct(id);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to duplicate product",
      );
    }
  },
);

// ============================================
// Slice
// ============================================
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        category: null,
        brand: null,
        minPrice: null,
        maxPrice: null,
        rating: null,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    // ==========================================
    // GET PRODUCTS
    // ==========================================
    builder
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters || state.filters;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // GET PRODUCT BY ID
    // ==========================================
    builder
      .addCase(getProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // GET PRODUCT BY SLUG
    // ==========================================
    builder
      .addCase(getProductBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProductBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(getProductBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // GET FEATURED PRODUCTS
    // ==========================================
    builder
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.featured = action.payload;
      })
      .addCase(getFeaturedProducts.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ==========================================
    // GET NEW ARRIVALS
    // ==========================================
    builder
      .addCase(getNewArrivals.fulfilled, (state, action) => {
        state.newArrivals = action.payload;
      })
      .addCase(getNewArrivals.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ==========================================
    // GET BEST SELLERS
    // ==========================================
    builder
      .addCase(getBestSellers.fulfilled, (state, action) => {
        state.bestSellers = action.payload;
      })
      .addCase(getBestSellers.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ==========================================
    // CREATE PRODUCT (Admin)
    // ==========================================
    builder
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
        state.success = "Product created successfully";
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // UPDATE PRODUCT (Admin)
    // ==========================================
    builder
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.selectedProduct?._id === action.payload._id) {
          state.selectedProduct = action.payload;
        }
        state.success = "Product updated successfully";
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // DELETE PRODUCT (Admin)
    // ==========================================
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter(
          (p) => p._id !== action.payload.id,
        );
        if (state.selectedProduct?._id === action.payload.id) {
          state.selectedProduct = null;
        }
        state.success =
          action.payload.message || "Product deleted successfully";
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // TOGGLE PRODUCT STATUS (Admin)
    // ==========================================
    builder
      .addCase(toggleProductStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.selectedProduct?._id === action.payload._id) {
          state.selectedProduct = action.payload;
        }
        state.success = `Product status updated to ${action.payload.status}`;
      })
      .addCase(toggleProductStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // UPDATE PRODUCT STOCK (Admin)
    // ==========================================
    builder
      .addCase(updateProductStock.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.selectedProduct?._id === action.payload._id) {
          state.selectedProduct = action.payload;
        }
        state.success = "Stock updated successfully";
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // DUPLICATE PRODUCT (Admin)
    // ==========================================
    builder
      .addCase(duplicateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(duplicateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
        state.success = "Product duplicated successfully";
      })
      .addCase(duplicateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ============================================
// Actions
// ============================================
export const {
  clearSelectedProduct,
  setFilters,
  clearFilters,
  clearError,
  clearSuccess,
} = productSlice.actions;

// ============================================
// Selectors
// ============================================
export const selectProducts = (state) => state.products;
export const selectSelectedProduct = (state) => state.products.selectedProduct;
export const selectProductLoading = (state) => state.products.isLoading;
export const selectProductError = (state) => state.products.error;

// ============================================
// Export
// ============================================
export default productSlice.reducer;

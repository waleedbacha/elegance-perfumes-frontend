import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import categoryService from "../../services/categoryService";

// ============================================
// Initial State
// ============================================
const initialState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
  success: null,
};

// ============================================
// Async Thunks
// ============================================

// GET /api/v1/categories
export const getCategories = createAsyncThunk(
  "categories/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories();
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch categories",
      );
    }
  },
);

// GET /api/v1/categories/admin/all (Admin)
export const getAllCategoriesAdmin = createAsyncThunk(
  "categories/admin/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getAllCategories();
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch categories",
      );
    }
  },
);

// GET /api/v1/categories/admin/:id (Admin)
export const getCategoryById = createAsyncThunk(
  "categories/admin/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategory(id);
      return response.data.category;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch category",
      );
    }
  },
);

// POST /api/v1/categories (Admin)
export const createCategory = createAsyncThunk(
  "categories/admin/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await categoryService.createCategory(formData);
      return response.data.category;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to create category",
      );
    }
  },
);

// PUT /api/v1/categories/admin/:id (Admin)
export const updateCategory = createAsyncThunk(
  "categories/admin/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await categoryService.updateCategory(id, formData);
      return response.data.category;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update category",
      );
    }
  },
);

// DELETE /api/v1/categories/admin/:id (Admin)
export const deleteCategory = createAsyncThunk(
  "categories/admin/delete",
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to delete category",
      );
    }
  },
);

// POST /api/v1/categories/admin/reorder (Admin)
export const reorderCategories = createAsyncThunk(
  "categories/admin/reorder",
  async (categories, { rejectWithValue }) => {
    try {
      await categoryService.reorderCategories(categories);
      return categories;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to reorder categories",
      );
    }
  },
);

// POST /api/v1/categories/admin/seed (Admin)
export const seedCategories = createAsyncThunk(
  "categories/admin/seed",
  async (_, { rejectWithValue }) => {
    try {
      await categoryService.seedCategories();
      const response = await categoryService.getCategories();
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to seed categories",
      );
    }
  },
);

// ============================================
// Slice
// ============================================
const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
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
    // GET CATEGORIES
    // ==========================================
    builder
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // GET ALL CATEGORIES (Admin)
    // ==========================================
    builder
      .addCase(getAllCategoriesAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllCategoriesAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(getAllCategoriesAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // GET CATEGORY BY ID (Admin)
    // ==========================================
    builder
      .addCase(getCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(getCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // CREATE CATEGORY (Admin)
    // ==========================================
    builder
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload);
        state.success = "Category created successfully";
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // UPDATE CATEGORY (Admin)
    // ==========================================
    builder
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.categories.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.selectedCategory?._id === action.payload._id) {
          state.selectedCategory = action.payload;
        }
        state.success = "Category updated successfully";
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // DELETE CATEGORY (Admin)
    // ==========================================
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter(
          (c) => c._id !== action.payload.id,
        );
        if (state.selectedCategory?._id === action.payload.id) {
          state.selectedCategory = null;
        }
        state.success = "Category deleted successfully";
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // REORDER CATEGORIES (Admin)
    // ==========================================
    builder
      .addCase(reorderCategories.fulfilled, (state, action) => {
        // Update order in state
        const reordered = action.payload;
        state.categories = state.categories.map((cat) => {
          const found = reordered.find((r) => r.id === cat._id);
          if (found) {
            return { ...cat, order: found.order };
          }
          return cat;
        });
        state.success = "Categories reordered successfully";
      })
      .addCase(reorderCategories.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ==========================================
    // SEED CATEGORIES (Admin)
    // ==========================================
    builder
      .addCase(seedCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(seedCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.success = "Default categories seeded successfully";
      })
      .addCase(seedCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ============================================
// Actions
// ============================================
export const { clearSelectedCategory, clearError, clearSuccess } =
  categorySlice.actions;

// ============================================
// Selectors
// ============================================
export const selectCategories = (state) => state.categories.categories;
export const selectCategoryLoading = (state) => state.categories.isLoading;
export const selectCategoryError = (state) => state.categories.error;

// ============================================
// Export
// ============================================
export default categorySlice.reducer;

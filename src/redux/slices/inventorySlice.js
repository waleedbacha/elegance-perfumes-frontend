import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ============================================
// Async Thunks
// ============================================

// GET /api/v1/inventory
export const getInventory = createAsyncThunk(
  "inventory/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/inventory", { params });
      // ✅ Return both inventory and pagination
      return {
        inventory: response.data.data.inventory,
        pagination: response.data.data.pagination,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch inventory",
      );
    }
  },
);

// GET /api/v1/inventory/summary
export const getInventorySummary = createAsyncThunk(
  "inventory/getSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/inventory/summary");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch inventory summary",
      );
    }
  },
);

// GET /api/v1/inventory/low-stock
export const getLowStock = createAsyncThunk(
  "inventory/getLowStock",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/inventory/low-stock", { params });
      // ✅ Return both items and pagination
      return {
        items: response.data.data.inventory,
        pagination: response.data.data.pagination,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch low stock items",
      );
    }
  },
);

// GET /api/v1/inventory/out-of-stock
export const getOutOfStock = createAsyncThunk(
  "inventory/getOutOfStock",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/inventory/out-of-stock", { params });
      // ✅ Return both items and pagination
      return {
        items: response.data.data.inventory,
        pagination: response.data.data.pagination,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch out of stock items",
      );
    }
  },
);

// PUT /api/v1/inventory/:productId
export const updateInventory = createAsyncThunk(
  "inventory/update",
  async ({ productId, inventoryData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/inventory/${productId}`, inventoryData);
      return response.data.data.inventory;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update inventory",
      );
    }
  },
);

// POST /api/v1/inventory/:productId/add-stock
export const addStock = createAsyncThunk(
  "inventory/addStock",
  async ({ productId, quantity, reason, notes }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/inventory/${productId}/add-stock`, {
        quantity,
        reason,
        notes,
      });
      return response.data.data.inventory;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to add stock",
      );
    }
  },
);

// POST /api/v1/inventory/:productId/deduct-stock
export const deductStock = createAsyncThunk(
  "inventory/deductStock",
  async ({ productId, quantity, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/inventory/${productId}/deduct-stock`, {
        quantity,
        reason,
      });
      return response.data.data.inventory;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to deduct stock",
      );
    }
  },
);

// POST /api/v1/inventory/bulk-update
export const bulkUpdateInventory = createAsyncThunk(
  "inventory/bulkUpdate",
  async (updates, { rejectWithValue }) => {
    try {
      const response = await api.post("/inventory/bulk-update", { updates });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to bulk update inventory",
      );
    }
  },
);

// ============================================
// Slice
// ============================================
const initialState = {
  inventory: [],
  lowStockItems: [],
  outOfStockItems: [],
  summary: null,
  isLoading: false,
  error: null,
  success: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  lowStockPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  outOfStockPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    resetInventory: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventory = action.payload.inventory;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(getInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getInventorySummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(getLowStock.fulfilled, (state, action) => {
        state.lowStockItems = action.payload.items || [];
        state.lowStockPagination =
          action.payload.pagination || state.lowStockPagination;
      })
      .addCase(getOutOfStock.fulfilled, (state, action) => {
        state.outOfStockItems = action.payload.items || [];
        state.outOfStockPagination =
          action.payload.pagination || state.outOfStockPagination;
      })
      .addCase(updateInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.inventory.findIndex(
          (i) =>
            i.product?._id === action.payload.product?._id ||
            i.product === action.payload.product,
        );
        if (index !== -1) {
          state.inventory[index] = action.payload;
        }
        state.success = "Inventory updated successfully";
      })
      .addCase(updateInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addStock.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(addStock.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.inventory.findIndex(
          (i) =>
            i.product?._id === action.payload.product?._id ||
            i.product === action.payload.product,
        );
        if (index !== -1) {
          state.inventory[index] = action.payload;
        }
        state.success = "Stock added successfully";
      })
      .addCase(addStock.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deductStock.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deductStock.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.inventory.findIndex(
          (i) =>
            i.product?._id === action.payload.product?._id ||
            i.product === action.payload.product,
        );
        if (index !== -1) {
          state.inventory[index] = action.payload;
        }
        state.success = "Stock deducted successfully";
      })
      .addCase(deductStock.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetInventory } =
  inventorySlice.actions;
export default inventorySlice.reducer;

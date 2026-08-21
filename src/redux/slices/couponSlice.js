import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ============================================
// Async Thunks
// ============================================

// GET /api/v1/coupons
export const getCoupons = createAsyncThunk(
  "coupons/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/coupons", { params });
      return response.data.data.coupons;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch coupons",
      );
    }
  },
);

// GET /api/v1/coupons/:id
export const getCouponById = createAsyncThunk(
  "coupons/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/coupons/${id}`);
      return response.data.data.coupon;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch coupon",
      );
    }
  },
);

// POST /api/v1/coupons
export const createCoupon = createAsyncThunk(
  "coupons/create",
  async (couponData, { rejectWithValue }) => {
    try {
      const response = await api.post("/coupons", couponData);
      return response.data.data.coupon;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to create coupon",
      );
    }
  },
);

// PUT /api/v1/coupons/:id
export const updateCoupon = createAsyncThunk(
  "coupons/update",
  async ({ id, couponData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/coupons/${id}`, couponData);
      return response.data.data.coupon;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update coupon",
      );
    }
  },
);

// DELETE /api/v1/coupons/:id
export const deleteCoupon = createAsyncThunk(
  "coupons/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/coupons/${id}`);
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to delete coupon",
      );
    }
  },
);

// POST /api/v1/coupons/:id/toggle
export const toggleCouponStatus = createAsyncThunk(
  "coupons/toggle",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/coupons/${id}/toggle`);
      return response.data.data.coupon;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to toggle coupon",
      );
    }
  },
);

// GET /api/v1/coupons/validate/:code
export const validateCoupon = createAsyncThunk(
  "coupons/validate",
  async (code, { rejectWithValue }) => {
    try {
      const response = await api.get(`/coupons/validate/${code}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to validate coupon",
      );
    }
  },
);

// ============================================
// Slice
// ============================================
const initialState = {
  coupons: [],
  selectedCoupon: null,
  isLoading: false,
  error: null,
  success: null,
  validationResult: null,
};

const couponSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {
    clearSelectedCoupon: (state) => {
      state.selectedCoupon = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearValidation: (state) => {
      state.validationResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload;
      })
      .addCase(getCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getCouponById.fulfilled, (state, action) => {
        state.selectedCoupon = action.payload;
      })
      .addCase(createCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons.unshift(action.payload);
        state.success = "Coupon created successfully";
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.coupons.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
        state.success = "Coupon updated successfully";
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = state.coupons.filter(
          (c) => c._id !== action.payload.id,
        );
        state.success = "Coupon deleted successfully";
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(toggleCouponStatus.fulfilled, (state, action) => {
        const index = state.coupons.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.validationResult = action.payload;
      });
  },
});

export const {
  clearSelectedCoupon,
  clearError,
  clearSuccess,
  clearValidation,
} = couponSlice.actions;

export default couponSlice.reducer;

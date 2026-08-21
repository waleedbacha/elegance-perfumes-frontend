import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ============================================
// Async Thunks
// ============================================

// GET /api/v1/banners
export const getBanners = createAsyncThunk(
  "banners/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/banners", { params });
      return response.data.data.banners;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch banners",
      );
    }
  },
);

// GET /api/v1/banners/active
export const getActiveBanners = createAsyncThunk(
  "banners/getActive",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/banners/active", { params });
      return response.data.data.banners;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch active banners",
      );
    }
  },
);

// POST /api/v1/banners
export const createBanner = createAsyncThunk(
  "banners/create",
  async (bannerData, { rejectWithValue }) => {
    try {
      // ✅ If bannerData is FormData, send it directly
      if (bannerData instanceof FormData) {
        const response = await api.post("/banners", bannerData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data.banner;
      }

      // Otherwise, handle as JSON
      const response = await api.post("/banners", bannerData);
      return response.data.data.banner;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to create banner",
      );
    }
  },
);

// PUT /api/v1/banners/:id
export const updateBanner = createAsyncThunk(
  "banners/update",
  async ({ id, bannerData }, { rejectWithValue }) => {
    try {
      // ✅ If bannerData is FormData, send it directly
      if (bannerData instanceof FormData) {
        const response = await api.put(`/banners/${id}`, bannerData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data.banner;
      }

      const response = await api.put(`/banners/${id}`, bannerData);
      return response.data.data.banner;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update banner",
      );
    }
  },
);

// DELETE /api/v1/banners/:id
export const deleteBanner = createAsyncThunk(
  "banners/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/banners/${id}`);
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to delete banner",
      );
    }
  },
);

// bannerSlice.js - Add this thunk

// PUT /api/v1/banners/:id/toggle
export const toggleBannerStatus = createAsyncThunk(
  "banners/toggleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      // ✅ Use the update endpoint with just the status
      const response = await api.put(`/banners/${id}`, { status });
      return response.data.data.banner;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to toggle banner status",
      );
    }
  },
);

// ============================================
// Slice
// ============================================
const initialState = {
  banners: [],
  activeBanners: [],
  isLoading: false,
  error: null,
  success: null,
};

const bannerSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = action.payload;
      })
      .addCase(getBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getActiveBanners.fulfilled, (state, action) => {
        state.activeBanners = action.payload;
      })
      .addCase(createBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners.unshift(action.payload);
        state.success = "Banner created successfully";
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.banners.findIndex(
          (b) => b._id === action.payload._id,
        );
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        state.success = "Banner updated successfully";
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = state.banners.filter(
          (b) => b._id !== action.payload.id,
        );
        state.success = "Banner deleted successfully";
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = bannerSlice.actions;
export default bannerSlice.reducer;

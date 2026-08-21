// frontend/src/redux/slices/cacheSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cacheService from "../../services/cacheService";

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  stats: null,
  isLoading: false,
  error: null,
  success: null,
  clearing: {
    all: false,
    memory: false,
    redis: false,
    images: false,
  },
};

// ============================================
// ASYNC THUNKS
// ============================================

// GET CACHE STATS
export const getCacheStats = createAsyncThunk(
  "cache/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cacheService.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch cache stats",
      );
    }
  },
);

// CLEAR ALL CACHES
export const clearAllCaches = createAsyncThunk(
  "cache/clearAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cacheService.clearAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to clear caches",
      );
    }
  },
);

// CLEAR MEMORY CACHE
export const clearMemoryCache = createAsyncThunk(
  "cache/clearMemory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cacheService.clearMemory();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to clear memory cache",
      );
    }
  },
);

// CLEAR REDIS CACHE
export const clearRedisCache = createAsyncThunk(
  "cache/clearRedis",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cacheService.clearRedis();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to clear Redis cache",
      );
    }
  },
);

// CLEAR IMAGE CACHE
export const clearImageCache = createAsyncThunk(
  "cache/clearImages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cacheService.clearImages();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to clear image cache",
      );
    }
  },
);

// ============================================
// SLICE
// ============================================
const cacheSlice = createSlice({
  name: "cache",
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
      // GET STATS
      .addCase(getCacheStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCacheStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(getCacheStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // CLEAR ALL
      .addCase(clearAllCaches.pending, (state) => {
        state.clearing.all = true;
        state.error = null;
        state.success = null;
      })
      .addCase(clearAllCaches.fulfilled, (state, action) => {
        state.clearing.all = false;
        state.success = action.payload.message || "All caches cleared";
      })
      .addCase(clearAllCaches.rejected, (state, action) => {
        state.clearing.all = false;
        state.error = action.payload;
      })

      // CLEAR MEMORY
      .addCase(clearMemoryCache.pending, (state) => {
        state.clearing.memory = true;
        state.error = null;
        state.success = null;
      })
      .addCase(clearMemoryCache.fulfilled, (state, action) => {
        state.clearing.memory = false;
        state.success = action.payload.message || "Memory cache cleared";
      })
      .addCase(clearMemoryCache.rejected, (state, action) => {
        state.clearing.memory = false;
        state.error = action.payload;
      })

      // CLEAR REDIS
      .addCase(clearRedisCache.pending, (state) => {
        state.clearing.redis = true;
        state.error = null;
        state.success = null;
      })
      .addCase(clearRedisCache.fulfilled, (state, action) => {
        state.clearing.redis = false;
        state.success = action.payload.message || "Redis cache cleared";
      })
      .addCase(clearRedisCache.rejected, (state, action) => {
        state.clearing.redis = false;
        state.error = action.payload;
      })

      // CLEAR IMAGES
      .addCase(clearImageCache.pending, (state) => {
        state.clearing.images = true;
        state.error = null;
        state.success = null;
      })
      .addCase(clearImageCache.fulfilled, (state, action) => {
        state.clearing.images = false;
        state.success = action.payload.message || "Image cache cleared";
      })
      .addCase(clearImageCache.rejected, (state, action) => {
        state.clearing.images = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = cacheSlice.actions;
export default cacheSlice.reducer;

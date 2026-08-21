import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import wishlistService from "../../services/wishlistService";

// ============================================
// Initial State
// ============================================
const initialState = {
  items: [],
  wishlist: null,
  isLoading: false,
  error: null,
  success: null,
  totalItems: 0,
  totalValue: 0,
  priceDrops: [],
};

// ============================================
// Async Thunks
// ============================================

// GET /api/v1/wishlist
export const getWishlist = createAsyncThunk(
  "wishlist/get",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlist();
      return response.data.wishlist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch wishlist",
      );
    }
  },
);

// POST /api/v1/wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.addToWishlist(productId);
      return response.data.wishlist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to add to wishlist",
      );
    }
  },
);

// DELETE /api/v1/wishlist/:productId
export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.removeFromWishlist(productId);
      return response.data.wishlist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to remove from wishlist",
      );
    }
  },
);

// POST /api/v1/wishlist/toggle
export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.toggleWishlist(productId);
      return {
        wishlist: response.data.wishlist,
        inWishlist: response.data.inWishlist,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to toggle wishlist",
      );
    }
  },
);

// GET /api/v1/wishlist/price-drops
export const getPriceDrops = createAsyncThunk(
  "wishlist/getPriceDrops",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getPriceDrops();
      return response.data.priceDrops;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch price drops",
      );
    }
  },
);

// GET /api/v1/wishlist/stats
export const getWishlistStats = createAsyncThunk(
  "wishlist/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlistStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch wishlist stats",
      );
    }
  },
);

// PUT /api/v1/wishlist/price-drop
export const setPriceDropNotification = createAsyncThunk(
  "wishlist/setPriceDrop",
  async ({ productId, notify }, { rejectWithValue }) => {
    try {
      const response = await wishlistService.setPriceDropNotification(
        productId,
        notify,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to update price drop notification",
      );
    }
  },
);

// PUT /api/v1/wishlist/back-in-stock
export const setBackInStockNotification = createAsyncThunk(
  "wishlist/setBackInStock",
  async ({ productId, notify }, { rejectWithValue }) => {
    try {
      const response = await wishlistService.setBackInStockNotification(
        productId,
        notify,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to update back in stock notification",
      );
    }
  },
);

// ============================================
// Slice
// ============================================
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    resetWishlist: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // ==========================================
    // GET WISHLIST
    // ==========================================
    builder
      .addCase(getWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist = action.payload;
        // ✅ Filter out items with null or undefined products
        state.items = action.payload?.items?.filter(
          (item) => item && item.product !== null && item.product !== undefined
        ) || [];
        state.totalItems = state.items.length;
        state.totalValue = action.payload?.totalValue || 0;
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // ADD TO WISHLIST
    // ==========================================
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist = action.payload;
        state.items = action.payload?.items?.filter(
          (item) => item && item.product !== null && item.product !== undefined
        ) || [];
        state.totalItems = state.items.length;
        state.totalValue = action.payload?.totalValue || 0;
        state.success = "Added to wishlist";
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // REMOVE FROM WISHLIST
    // ==========================================
    builder
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist = action.payload;
        state.items = action.payload?.items?.filter(
          (item) => item && item.product !== null && item.product !== undefined
        ) || [];
        state.totalItems = state.items.length;
        state.totalValue = action.payload?.totalValue || 0;
        state.success = "Removed from wishlist";
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // TOGGLE WISHLIST
    // ==========================================
    builder
      .addCase(toggleWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist = action.payload.wishlist;
        state.items = action.payload.wishlist?.items?.filter(
          (item) => item && item.product !== null && item.product !== undefined
        ) || [];
        state.totalItems = state.items.length;
        state.totalValue = action.payload.wishlist?.totalValue || 0;
        state.success = action.payload.inWishlist
          ? "Added to wishlist"
          : "Removed from wishlist";
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // GET PRICE DROPS
    // ==========================================
    builder
      .addCase(getPriceDrops.fulfilled, (state, action) => {
        state.priceDrops = action.payload;
      })
      .addCase(getPriceDrops.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ==========================================
    // GET WISHLIST STATS
    // ==========================================
    builder
      .addCase(getWishlistStats.fulfilled, (state, action) => {
        state.totalItems = action.payload.totalItems || state.totalItems;
        state.totalValue = action.payload.totalValue || state.totalValue;
      })
      .addCase(getWishlistStats.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// ============================================
// Actions
// ============================================
export const { clearError, clearSuccess, resetWishlist } =
  wishlistSlice.actions;

// ============================================
// Selectors
// ============================================
export const selectWishlist = (state) => state.wishlist;
export const selectWishlistItems = (state) => state.wishlist.items;

// ============================================
// Export
// ============================================
export default wishlistSlice.reducer;
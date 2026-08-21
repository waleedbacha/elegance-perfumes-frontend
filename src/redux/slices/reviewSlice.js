import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import reviewService from "../../services/reviewService";

// ============================================
// Initial State
// ============================================
const initialState = {
  reviews: [],
  selectedReview: null,
  isLoading: false,
  error: null,
  success: null,
  stats: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  },
};

// ============================================
// Async Thunks
// ============================================

// ✅ GET /api/v1/reviews/admin/all - Get all reviews (Admin)
export const getAllReviews = createAsyncThunk(
  "reviews/admin/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reviewService.getAllReviews(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch reviews",
      );
    }
  },
);

// ✅ GET /api/v1/reviews/admin/analytics - Get review analytics (Admin)
export const getReviewAnalytics = createAsyncThunk(
  "reviews/admin/getAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await reviewService.getReviewAnalytics();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch analytics",
      );
    }
  },
);

// ✅ GET /api/v1/reviews/admin/:id - Get review details (Admin)
export const getReviewDetails = createAsyncThunk(
  "reviews/admin/getDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await reviewService.getReviewAdmin(id);
      return response.data.review;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch review",
      );
    }
  },
);

// ✅ PUT /api/v1/reviews/admin/:id/approve - Approve review (Admin)
export const approveReview = createAsyncThunk(
  "reviews/admin/approve",
  async (id, { rejectWithValue }) => {
    try {
      const response = await reviewService.approveReview(id);
      return response.data.review;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to approve review",
      );
    }
  },
);

// ✅ PUT /api/v1/reviews/admin/:id/reject - Reject review (Admin)
export const rejectReview = createAsyncThunk(
  "reviews/admin/reject",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await reviewService.rejectReview(id, reason);
      return response.data.review;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to reject review",
      );
    }
  },
);

// ✅ POST /api/v1/reviews/admin/:id/respond - Admin response (Admin)
export const adminRespondToReview = createAsyncThunk(
  "reviews/admin/respond",
  async ({ id, response }, { rejectWithValue }) => {
    try {
      const result = await reviewService.adminRespond(id, response);
      return result.data.review;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to add response",
      );
    }
  },
);

// ✅ DELETE /api/v1/reviews/admin/:id - Delete review (Admin)
export const deleteReviewAdmin = createAsyncThunk(
  "reviews/admin/delete",
  async (id, { rejectWithValue }) => {
    try {
      await reviewService.deleteReview(id);
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to delete review",
      );
    }
  },
);

// ============================================
// Slice
// ============================================
const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearSelectedReview: (state) => {
      state.selectedReview = null;
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
    // GET ALL REVIEWS (Admin)
    // ==========================================
    builder
      .addCase(getAllReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.reviews;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // GET REVIEW ANALYTICS (Admin)
    // ==========================================
    builder
      .addCase(getReviewAnalytics.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getReviewAnalytics.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ==========================================
    // GET REVIEW DETAILS (Admin)
    // ==========================================
    builder
      .addCase(getReviewDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReviewDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedReview = action.payload;
      })
      .addCase(getReviewDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // APPROVE REVIEW (Admin)
    // ==========================================
    builder
      .addCase(approveReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        if (state.selectedReview?._id === action.payload._id) {
          state.selectedReview = action.payload;
        }
        state.success = "Review approved successfully";
      })
      .addCase(approveReview.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ==========================================
    // REJECT REVIEW (Admin)
    // ==========================================
    builder
      .addCase(rejectReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        if (state.selectedReview?._id === action.payload._id) {
          state.selectedReview = action.payload;
        }
        state.success = "Review rejected";
      })
      .addCase(rejectReview.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ==========================================
    // ADMIN RESPOND (Admin)
    // ==========================================
    builder
      .addCase(adminRespondToReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        if (state.selectedReview?._id === action.payload._id) {
          state.selectedReview = action.payload;
        }
        state.success = "Response added successfully";
      })
      .addCase(adminRespondToReview.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ==========================================
    // DELETE REVIEW (Admin)
    // ==========================================
    builder
      .addCase(deleteReviewAdmin.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(
          (r) => r._id !== action.payload.id,
        );
        if (state.selectedReview?._id === action.payload.id) {
          state.selectedReview = null;
        }
        state.success = "Review deleted successfully";
      })
      .addCase(deleteReviewAdmin.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// ============================================
// Actions
// ============================================
export const { clearSelectedReview, clearError, clearSuccess } =
  reviewSlice.actions;

// ============================================
// Selectors
// ============================================
export const selectReviews = (state) => state.reviews;
export const selectReviewLoading = (state) => state.reviews.isLoading;
export const selectReviewStats = (state) => state.reviews.stats;

// ============================================
// Export
// ============================================
export default reviewSlice.reducer;

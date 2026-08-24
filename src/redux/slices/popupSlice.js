// frontend/src/redux/slices/popupSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ============================================
// ASYNC THUNKS
// ============================================

// GET /api/v1/popups/active
export const getActivePopup = createAsyncThunk(
  "popups/getActive",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/popups/active");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch popup",
      );
    }
  },
);

// GET /api/v1/popups
export const getPopups = createAsyncThunk(
  "popups/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/popups", { params });
      return response.data.data.popups;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch popups",
      );
    }
  },
);

// POST /api/v1/popups
export const createPopup = createAsyncThunk(
  "popups/create",
  async (popupData, { rejectWithValue }) => {
    try {
      const response = await api.post("/popups", popupData, {
        headers:
          popupData instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : {},
      });
      return response.data.data.popup;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to create popup",
      );
    }
  },
);

// PUT /api/v1/popups/:id
export const updatePopup = createAsyncThunk(
  "popups/update",
  async ({ id, popupData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/popups/${id}`, popupData, {
        headers:
          popupData instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : {},
      });
      return response.data.data.popup;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update popup",
      );
    }
  },
);

// DELETE /api/v1/popups/:id
export const deletePopup = createAsyncThunk(
  "popups/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/popups/${id}`);
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to delete popup",
      );
    }
  },
);

// PUT /api/v1/popups/:id/toggle
export const togglePopupStatus = createAsyncThunk(
  "popups/toggle",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/popups/${id}/toggle`);
      return response.data.data.popup;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to toggle popup status",
      );
    }
  },
);

// POST /api/v1/popups/:id/click
export const recordPopupClick = createAsyncThunk(
  "popups/recordClick",
  async (id, { rejectWithValue }) => {
    try {
      await api.post(`/popups/${id}/click`);
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to record click",
      );
    }
  },
);

// POST /api/v1/popups/:id/conversion
export const recordPopupConversion = createAsyncThunk(
  "popups/recordConversion",
  async (id, { rejectWithValue }) => {
    try {
      await api.post(`/popups/${id}/conversion`);
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to record conversion",
      );
    }
  },
);

// ============================================
// SLICE
// ============================================
const initialState = {
  popups: [],
  activePopup: null,
  isLoading: false,
  error: null,
  success: null,
};

const popupSlice = createSlice({
  name: "popups",
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
      // GET ACTIVE POPUP
      .addCase(getActivePopup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getActivePopup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activePopup = action.payload;
      })
      .addCase(getActivePopup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // GET ALL POPUPS
      .addCase(getPopups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPopups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.popups = action.payload;
      })
      .addCase(getPopups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // CREATE POPUP
      .addCase(createPopup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createPopup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.popups.unshift(action.payload);
        state.success = "Popup created successfully";
      })
      .addCase(createPopup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // UPDATE POPUP
      .addCase(updatePopup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updatePopup.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.popups.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) state.popups[index] = action.payload;
        state.success = "Popup updated successfully";
      })
      .addCase(updatePopup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // DELETE POPUP
      .addCase(deletePopup.fulfilled, (state, action) => {
        state.popups = state.popups.filter((p) => p._id !== action.payload.id);
        state.success = "Popup deleted successfully";
      })

      // TOGGLE POPUP STATUS
      .addCase(togglePopupStatus.fulfilled, (state, action) => {
        const index = state.popups.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) state.popups[index] = action.payload;
      })

      // RECORD CLICK
      .addCase(recordPopupClick.fulfilled, (state, action) => {
        const index = state.popups.findIndex(
          (p) => p._id === action.payload.id,
        );
        if (index !== -1 && state.popups[index].analytics) {
          state.popups[index].analytics.clicks += 1;
        }
      })

      // RECORD CONVERSION
      .addCase(recordPopupConversion.fulfilled, (state, action) => {
        const index = state.popups.findIndex(
          (p) => p._id === action.payload.id,
        );
        if (index !== -1 && state.popups[index].analytics) {
          state.popups[index].analytics.conversions += 1;
        }
      });
  },
});

export const { clearError, clearSuccess } = popupSlice.actions;
export default popupSlice.reducer;

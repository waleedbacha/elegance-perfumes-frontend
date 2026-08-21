import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import seoService from "../../services/seoService";

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  settings: null,
  preview: null,
  audit: null,
  history: [],
  dashboard: null,
  rankings: null,
  keywordSuggestions: [],
  cannibalization: null,
  keywordAnalysis: null,
  isLoading: false,
  error: null,
  success: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

// GET SETTINGS
export const getSeoSettings = createAsyncThunk(
  "seo/getSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await seoService.getSeoSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch SEO settings",
      );
    }
  },
);

// UPDATE GLOBAL SETTINGS
export const updateGlobalSettings = createAsyncThunk(
  "seo/updateGlobal",
  async (data, { rejectWithValue }) => {
    try {
      const response = await seoService.updateGlobalSettings(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to update global settings",
      );
    }
  },
);

// UPDATE PAGE SETTINGS
export const updatePageSettings = createAsyncThunk(
  "seo/updatePage",
  async ({ page, data }, { rejectWithValue }) => {
    try {
      const response = await seoService.updatePageSettings(page, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to update page settings",
      );
    }
  },
);

// UPDATE PRODUCT TEMPLATES
export const updateProductTemplates = createAsyncThunk(
  "seo/updateProductTemplates",
  async (data, { rejectWithValue }) => {
    try {
      const response = await seoService.updateProductTemplates(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to update product templates",
      );
    }
  },
);

// UPDATE CATEGORY TEMPLATES
export const updateCategoryTemplates = createAsyncThunk(
  "seo/updateCategoryTemplates",
  async (data, { rejectWithValue }) => {
    try {
      const response = await seoService.updateCategoryTemplates(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to update category templates",
      );
    }
  },
);

// UPDATE SITEMAP SETTINGS
export const updateSitemapSettings = createAsyncThunk(
  "seo/updateSitemap",
  async (data, { rejectWithValue }) => {
    try {
      const response = await seoService.updateSitemapSettings(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to update sitemap settings",
      );
    }
  },
);

// UPDATE SOCIAL SETTINGS
export const updateSocialSettings = createAsyncThunk(
  "seo/updateSocial",
  async (data, { rejectWithValue }) => {
    try {
      const response = await seoService.updateSocialSettings(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to update social settings",
      );
    }
  },
);

// ADD CUSTOM PAGE
export const addCustomPage = createAsyncThunk(
  "seo/addCustomPage",
  async (data, { rejectWithValue }) => {
    try {
      const response = await seoService.addCustomPage(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to add custom page",
      );
    }
  },
);

// UPDATE CUSTOM PAGE
export const updateCustomPage = createAsyncThunk(
  "seo/updateCustomPage",
  async ({ route, data }, { rejectWithValue }) => {
    try {
      const response = await seoService.updateCustomPage(route, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update custom page",
      );
    }
  },
);

// DELETE CUSTOM PAGE
export const deleteCustomPage = createAsyncThunk(
  "seo/deleteCustomPage",
  async (route, { rejectWithValue }) => {
    try {
      const response = await seoService.deleteCustomPage(route);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to delete custom page",
      );
    }
  },
);

// GET SEO PREVIEW
export const getSeoPreview = createAsyncThunk(
  "seo/getPreview",
  async (params, { rejectWithValue }) => {
    try {
      const response = await seoService.getSeoPreview(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to get SEO preview",
      );
    }
  },
);

// RUN SEO AUDIT
export const runSeoAudit = createAsyncThunk(
  "seo/runAudit",
  async (_, { rejectWithValue }) => {
    try {
      const response = await seoService.runSeoAudit();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to run SEO audit",
      );
    }
  },
);

// BULK UPDATE PRODUCT SEO
export const bulkUpdateProductSeo = createAsyncThunk(
  "seo/bulkUpdate",
  async (data, { rejectWithValue }) => {
    try {
      const response = await seoService.bulkUpdateProductSeo(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to bulk update products",
      );
    }
  },
);

// GET SEO HISTORY
export const getSeoHistory = createAsyncThunk(
  "seo/getHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await seoService.getSeoHistory();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch SEO history",
      );
    }
  },
);

// RESET TO DEFAULTS
export const resetToDefaults = createAsyncThunk(
  "seo/reset",
  async (_, { rejectWithValue }) => {
    try {
      const response = await seoService.resetToDefaults();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to reset SEO settings",
      );
    }
  },
);

// ============================================
// SEO DASHBOARD & ANALYTICS THUNKS
// ============================================

export const getSeoDashboard = createAsyncThunk(
  "seo/getDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await seoService.getSeoDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch dashboard data",
      );
    }
  },
);

export const getKeywordRankings = createAsyncThunk(
  "seo/getKeywordRankings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await seoService.getKeywordRankings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch keyword rankings",
      );
    }
  },
);

export const getKeywordSuggestions = createAsyncThunk(
  "seo/getKeywordSuggestions",
  async (query = "", { rejectWithValue }) => {
    try {
      const response = await seoService.getKeywordSuggestions(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch keyword suggestions",
      );
    }
  },
);

export const getKeywordCannibalization = createAsyncThunk(
  "seo/getKeywordCannibalization",
  async (_, { rejectWithValue }) => {
    try {
      const response = await seoService.getKeywordCannibalization();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to check cannibalization",
      );
    }
  },
);

export const analyzeKeywordDifficulty = createAsyncThunk(
  "seo/analyzeKeywordDifficulty",
  async (keyword, { rejectWithValue }) => {
    try {
      const response = await seoService.analyzeKeywordDifficulty(keyword);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to analyze keyword difficulty",
      );
    }
  },
);

// ============================================
// SLICE
// ============================================
const seoSlice = createSlice({
  name: "seo",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearPreview: (state) => {
      state.preview = null;
    },
    clearAudit: (state) => {
      state.audit = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET SETTINGS
      .addCase(getSeoSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSeoSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(getSeoSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // UPDATE GLOBAL SETTINGS
      .addCase(updateGlobalSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateGlobalSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.success = "Global settings updated successfully";
      })
      .addCase(updateGlobalSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // UPDATE PAGE SETTINGS
      .addCase(updatePageSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updatePageSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.success = "Page settings updated successfully";
      })
      .addCase(updatePageSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // GET SEO PREVIEW
      .addCase(getSeoPreview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSeoPreview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preview = action.payload;
      })
      .addCase(getSeoPreview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // RUN SEO AUDIT
      .addCase(runSeoAudit.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(runSeoAudit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.audit = action.payload;
        state.success = "SEO audit completed";
      })
      .addCase(runSeoAudit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // GET SEO HISTORY
      .addCase(getSeoHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })

      // RESET
      .addCase(resetToDefaults.fulfilled, (state, action) => {
        state.settings = action.payload;
        state.success = "Settings reset to defaults";
      });
    builder
      .addCase(getSeoDashboard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSeoDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(getSeoDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getKeywordRankings.fulfilled, (state, action) => {
        state.rankings = action.payload;
      })
      .addCase(getKeywordSuggestions.fulfilled, (state, action) => {
        state.keywordSuggestions = action.payload;
      })
      .addCase(getKeywordCannibalization.fulfilled, (state, action) => {
        state.cannibalization = action.payload;
      })
      .addCase(analyzeKeywordDifficulty.fulfilled, (state, action) => {
        state.keywordAnalysis = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearPreview, clearAudit } =
  seoSlice.actions;
export default seoSlice.reducer;

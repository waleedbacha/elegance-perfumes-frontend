import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import heroService from "../../services/heroService";

// ============================================
// Initial State
// ============================================
const initialState = {
  hero: null,
  heroes: [],
  selectedHero: null,
  isLoading: false,
  error: null,
  success: null,
};

// ============================================
// Async Thunks
// ============================================

// GET /api/v1/hero
export const getHero = createAsyncThunk(
  "hero/get",
  async (_, { rejectWithValue }) => {
    try {
      const response = await heroService.getHero();
      return response.data.hero;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch hero",
      );
    }
  },
);

// GET /api/v1/hero/admin/all (Admin)
export const getAllHeroes = createAsyncThunk(
  "hero/admin/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await heroService.getAllHeroes();
      return response.data.heroes;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch heroes",
      );
    }
  },
);

// POST /api/v1/hero (Admin)
export const createHero = createAsyncThunk(
  "hero/admin/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await heroService.createHero(formData);
      return response.data.hero;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to create hero",
      );
    }
  },
);

// PUT /api/v1/hero/admin/:id (Admin)
export const updateHero = createAsyncThunk(
  "hero/admin/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await heroService.updateHero(id, formData);
      return response.data.hero;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update hero",
      );
    }
  },
);

// DELETE /api/v1/hero/admin/:id (Admin)
export const deleteHero = createAsyncThunk(
  "hero/admin/delete",
  async (id, { rejectWithValue }) => {
    try {
      await heroService.deleteHero(id);
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to delete hero",
      );
    }
  },
);

// POST /api/v1/hero/admin/seed (Admin)
export const seedHero = createAsyncThunk(
  "hero/admin/seed",
  async (_, { rejectWithValue }) => {
    try {
      await heroService.seedHero();
      const response = await heroService.getHero();
      return response.data.hero;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to seed hero",
      );
    }
  },
);

// PUT /api/v1/hero/admin/:id/toggle (Admin)
export const toggleHeroStatus = createAsyncThunk(
  "hero/admin/toggle",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await heroService.toggleHeroStatus(id, isActive);
      return response.data.hero;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to toggle hero",
      );
    }
  },
);

// ============================================
// Slice
// ============================================
const heroSlice = createSlice({
  name: "hero",
  initialState,
  reducers: {
    clearSelectedHero: (state) => {
      state.selectedHero = null;
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
    // GET HERO
    // ==========================================
    builder
      .addCase(getHero.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getHero.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hero = action.payload;
      })
      .addCase(getHero.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // GET ALL HEROES (Admin)
    // ==========================================
    builder
      .addCase(getAllHeroes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllHeroes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.heroes = action.payload;
      })
      .addCase(getAllHeroes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // CREATE HERO (Admin)
    // ==========================================
    builder
      .addCase(createHero.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createHero.fulfilled, (state, action) => {
        state.isLoading = false;
        state.heroes.push(action.payload);
        state.success = "Hero created successfully";
      })
      .addCase(createHero.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // UPDATE HERO (Admin)
    // ==========================================
    builder
      .addCase(updateHero.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateHero.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.heroes.findIndex(
          (h) => h._id === action.payload._id,
        );
        if (index !== -1) {
          state.heroes[index] = action.payload;
        }
        if (state.hero?._id === action.payload._id) {
          state.hero = action.payload;
        }
        state.success = "Hero updated successfully";
      })
      .addCase(updateHero.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // DELETE HERO (Admin)
    // ==========================================
    builder
      .addCase(deleteHero.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteHero.fulfilled, (state, action) => {
        state.isLoading = false;
        state.heroes = state.heroes.filter((h) => h._id !== action.payload.id);
        if (state.hero?._id === action.payload.id) {
          state.hero = null;
        }
        state.success = "Hero deleted successfully";
      })
      .addCase(deleteHero.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // SEED HERO (Admin)
    // ==========================================
    builder
      .addCase(seedHero.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(seedHero.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hero = action.payload;
        state.success = "Default hero seeded successfully";
      })
      .addCase(seedHero.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // TOGGLE HERO STATUS (Admin)
    // ==========================================
    builder
      .addCase(toggleHeroStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(toggleHeroStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.heroes.findIndex(
          (h) => h._id === action.payload._id,
        );
        if (index !== -1) {
          state.heroes[index] = action.payload;
        }
        state.success = `Hero ${action.payload.isActive ? "activated" : "deactivated"}`;
      })
      .addCase(toggleHeroStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ============================================
// Actions
// ============================================
export const { clearSelectedHero, clearError, clearSuccess } =
  heroSlice.actions;

// ============================================
// Selectors
// ============================================
export const selectHero = (state) => state.hero.hero;
export const selectHeroes = (state) => state.hero.heroes;
export const selectHeroLoading = (state) => state.hero.isLoading;

// ============================================
// Export
// ============================================
export default heroSlice.reducer;

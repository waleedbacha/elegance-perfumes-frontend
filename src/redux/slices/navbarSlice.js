import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import navbarService from "../../services/navbarService";

// ============================================
// Initial State
// ============================================
const initialState = {
  items: [],
  allItems: [],
  selectedItem: null,
  isLoading: false,
  error: null,
  success: null,
};

// ============================================
// Async Thunks - Public
// ============================================

// GET active navbar items
export const getNavbar = createAsyncThunk(
  "navbar/get",
  async (_, { rejectWithValue }) => {
    try {
      const response = await navbarService.getNavbar();
      return response.data.data.items;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch navbar",
      );
    }
  },
);

// ============================================
// Async Thunks - Admin
// ============================================

// GET all navbar items (Admin)
export const getAllNavbarItems = createAsyncThunk(
  "navbar/admin/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await navbarService.getAllNavbarItems();
      return response.data.data.items;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch navbar items",
      );
    }
  },
);

// GET navbar item by ID (Admin)
export const getNavbarItem = createAsyncThunk(
  "navbar/admin/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await navbarService.getNavbarItem(id);
      return response.data.data.item;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch navbar item",
      );
    }
  },
);

// CREATE navbar item (Admin)
export const createNavbarItem = createAsyncThunk(
  "navbar/admin/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await navbarService.createNavbarItem(data);
      // ✅ Handle different response structures
      if (response.data?.data?.item) {
        return response.data.data.item;
      }
      if (response.data?.item) {
        return response.data.item;
      }
      if (response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to create navbar item",
      );
    }
  },
);

// UPDATE navbar item (Admin)
export const updateNavbarItem = createAsyncThunk(
  "navbar/admin/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await navbarService.updateNavbarItem(id, data);
      // ✅ Handle different response structures
      if (response.data?.data?.item) {
        return response.data.data.item;
      }
      if (response.data?.item) {
        return response.data.item;
      }
      if (response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update navbar item",
      );
    }
  },
);

// DELETE navbar item (Admin)
export const deleteNavbarItem = createAsyncThunk(
  "navbar/admin/delete",
  async (id, { rejectWithValue }) => {
    try {
      await navbarService.deleteNavbarItem(id);
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to delete navbar item",
      );
    }
  },
);

// REORDER navbar items (Admin)
export const reorderNavbarItems = createAsyncThunk(
  "navbar/admin/reorder",
  async (items, { rejectWithValue }) => {
    try {
      await navbarService.reorderNavbarItems(items);
      return items;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to reorder navbar items",
      );
    }
  },
);

// SEED navbar items (Admin)
export const seedNavbar = createAsyncThunk(
  "navbar/admin/seed",
  async (_, { rejectWithValue }) => {
    try {
      await navbarService.seedNavbar();
      // ✅ After seeding, fetch all items to refresh the list
      const response = await navbarService.getAllNavbarItems();

      // Handle different response structures
      let items = [];
      if (response.data?.data?.items) {
        items = response.data.data.items;
      } else if (response.data?.items) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }

      return items;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to seed navbar items",
      );
    }
  },
);

// TOGGLE visibility (Admin)
export const toggleVisibility = createAsyncThunk(
  "navbar/admin/toggleVisibility",
  async (id, { rejectWithValue }) => {
    try {
      const response = await navbarService.toggleVisibility(id);
      return response.data.data.item;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to toggle visibility",
      );
    }
  },
);

// ============================================
// Slice
// ============================================
const navbarSlice = createSlice({
  name: "navbar",
  initialState,
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    // GET NAVBAR (Public)
    builder
      .addCase(getNavbar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNavbar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(getNavbar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // GET ALL (Admin)
    builder
      .addCase(getAllNavbarItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllNavbarItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allItems = action.payload;
      })
      .addCase(getAllNavbarItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // GET BY ID
    builder
      .addCase(getNavbarItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNavbarItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedItem = action.payload;
      })
      .addCase(getNavbarItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // CREATE
    builder
      .addCase(createNavbarItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createNavbarItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allItems.push(action.payload);
        state.success = "Navbar item created successfully";
      })
      .addCase(createNavbarItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // UPDATE
    builder
      .addCase(updateNavbarItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateNavbarItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.allItems.findIndex(
          (item) => item._id === action.payload._id,
        );
        if (index !== -1) {
          state.allItems[index] = action.payload;
        }
        if (state.selectedItem?._id === action.payload._id) {
          state.selectedItem = action.payload;
        }
        state.success = "Navbar item updated successfully";
      })
      .addCase(updateNavbarItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // DELETE
    builder
      .addCase(deleteNavbarItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteNavbarItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allItems = state.allItems.filter(
          (item) => item._id !== action.payload.id,
        );
        if (state.selectedItem?._id === action.payload.id) {
          state.selectedItem = null;
        }
        state.success = "Navbar item deleted successfully";
      })
      .addCase(deleteNavbarItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // REORDER
    builder
      .addCase(reorderNavbarItems.fulfilled, (state, action) => {
        const reordered = action.payload;
        state.allItems = state.allItems.map((item) => {
          const found = reordered.find((r) => r.id === item._id);
          if (found) {
            return { ...item, order: found.order };
          }
          return item;
        });
        state.success = "Navbar items reordered successfully";
      })
      .addCase(reorderNavbarItems.rejected, (state, action) => {
        state.error = action.payload;
      });

    // SEED
    builder
      .addCase(seedNavbar.fulfilled, (state, action) => {
        state.allItems = action.payload;
        state.success = "Default navbar items seeded successfully";
      })
      .addCase(seedNavbar.rejected, (state, action) => {
        state.error = action.payload;
      });

    // TOGGLE VISIBILITY
    builder
      .addCase(toggleVisibility.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleVisibility.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.allItems.findIndex(
          (item) => item._id === action.payload._id,
        );
        if (index !== -1) {
          state.allItems[index] = action.payload;
        }
        state.success = `Navbar item ${action.payload.isVisible ? "shown" : "hidden"}`;
      })
      .addCase(toggleVisibility.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedItem, clearError, clearSuccess } =
  navbarSlice.actions;
export default navbarSlice.reducer;

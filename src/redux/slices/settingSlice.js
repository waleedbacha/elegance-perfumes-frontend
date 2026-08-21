import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import settingService from "../../services/settingService";

// ============================================
// Initial State
// ============================================
const initialState = {
  settings: {},
  isLoading: false,
  error: null,
  success: null,
};

// ============================================
// Async Thunks
// ============================================

// GET public settings by group
export const getPublicSettings = createAsyncThunk(
  "settings/getPublic",
  async (group, { rejectWithValue }) => {
    try {
      const response = await settingService.getPublicSettings(group);
      console.log(`📤 getPublicSettings response for ${group}:`, response);

      // ✅ Extract data properly
      let settingsData = {};
      if (response.data) {
        settingsData = response.data;
      } else if (response.data?.data) {
        settingsData = response.data.data;
      }

      console.log(`📤 Extracted settings data:`, settingsData);
      return { group, data: settingsData };
    } catch (error) {
      let message = "Failed to fetch settings";
      if (error.response?.data?.error?.message) {
        message = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  },
);

// GET all settings (Admin)
export const getAllSettings = createAsyncThunk(
  "settings/admin/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingService.getAllSettings();
      let settingsData = [];
      if (response.data?.data?.settings) {
        settingsData = response.data.data.settings;
      } else if (response.data?.settings) {
        settingsData = response.data.settings;
      } else if (Array.isArray(response.data)) {
        settingsData = response.data;
      }
      return settingsData;
    } catch (error) {
      let message = "Failed to fetch settings";
      if (error.response?.data?.error?.message) {
        message = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  },
);

// SET setting (Admin)
export const setSetting = createAsyncThunk(
  "settings/admin/set",
  async (data, { rejectWithValue }) => {
    try {
      const response = await settingService.setSetting(data);
      let settingData = null;
      if (response.data?.data?.setting) {
        settingData = response.data.data.setting;
      } else if (response.data?.setting) {
        settingData = response.data.setting;
      } else if (response.data?.data) {
        settingData = response.data.data;
      } else {
        settingData = response.data;
      }

      if (!settingData || !settingData.key) {
        settingData = {
          key: data.key,
          value: data.value,
          type: data.type || "string",
          group: data.group || "general",
        };
      }

      return settingData;
    } catch (error) {
      let message = "Failed to save setting";
      if (error.response?.data?.error?.message) {
        message = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  },
);

// UPLOAD setting image (Admin)
export const uploadSettingImage = createAsyncThunk(
  "settings/admin/uploadImage",
  async ({ key, file }, { rejectWithValue }) => {
    try {
      const response = await settingService.uploadSettingImage(key, file);
      return response.data.setting;
    } catch (error) {
      let message = "Failed to upload image";
      if (error.response?.data?.error?.message) {
        message = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  },
);

// BULK UPDATE settings (Admin)
export const bulkUpdateSettings = createAsyncThunk(
  "settings/admin/bulk",
  async (settings, { rejectWithValue }) => {
    try {
      const response = await settingService.bulkUpdateSettings(settings);
      return response.data.data.results;
    } catch (error) {
      let message = "Failed to update settings";
      if (error.response?.data?.error?.message) {
        message = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  },
);

// INIT category settings (Admin)
export const initCategorySettings = createAsyncThunk(
  "settings/admin/initCategory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingService.initCategorySettings();
      return response.data;
    } catch (error) {
      let message = "Failed to initialize category settings";
      if (error.response?.data?.error?.message) {
        message = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  },
);

// INIT collection settings (Admin)
export const initCollectionSettings = createAsyncThunk(
  "settings/admin/initCollection",
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingService.initCollectionSettings();
      return response.data;
    } catch (error) {
      let message = "Failed to initialize collection settings";
      if (error.response?.data?.error?.message) {
        message = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  },
);

// Add this thunk
// INIT shop settings (Admin)
export const initShopSettings = createAsyncThunk(
  "settings/admin/initShop",
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingService.initShopSettings();
      return response.data;
    } catch (error) {
      let message = "Failed to initialize shop settings";
      if (error.response?.data?.error?.message) {
        message = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  },
);

// INIT about settings (Admin)
export const initAboutSettings = createAsyncThunk(
  "settings/admin/initAbout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingService.initAboutSettings();
      return response.data;
    } catch (error) {
      let message = "Failed to initialize about settings";
      if (error.response?.data?.error?.message) {
        message = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      return rejectWithValue(message);
    }
  },
);

// ============================================
// Slice
// ============================================
const settingSlice = createSlice({
  name: "settings",
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
    // GET PUBLIC SETTINGS
    builder
      .addCase(getPublicSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPublicSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        const { group, data } = action.payload;
        console.log(`📥 Merging ${group} settings:`, data);
        // ✅ Directly merge the data into settings
        state.settings = { ...state.settings, ...data };
        console.log(`📥 Updated settings state:`, state.settings);
      })
      .addCase(getPublicSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error(`❌ Failed to fetch settings:`, action.payload);
      });

    // GET ALL SETTINGS (Admin)
    builder
      .addCase(getAllSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        const settingsMap = {};
        if (Array.isArray(action.payload)) {
          action.payload.forEach((setting) => {
            settingsMap[setting.key] = setting.value;
          });
        }
        state.settings = { ...state.settings, ...settingsMap };
        console.log(`📥 Admin settings loaded:`, state.settings);
      })
      .addCase(getAllSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // SET SETTING
    builder
      .addCase(setSetting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(setSetting.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.key) {
          state.settings[action.payload.key] = action.payload.value;
          console.log(
            `✅ Setting updated: ${action.payload.key} =`,
            action.payload.value,
          );
        }
        state.success = "Setting saved successfully";
      })
      .addCase(setSetting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // UPLOAD SETTING IMAGE
    builder
      .addCase(uploadSettingImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(uploadSettingImage.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.key) {
          state.settings[action.payload.key] = action.payload.value;
        }
        state.success = "Image uploaded successfully";
      })
      .addCase(uploadSettingImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // BULK UPDATE
    builder
      .addCase(bulkUpdateSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(bulkUpdateSettings.fulfilled, (state) => {
        state.isLoading = false;
        state.success = "Settings updated successfully";
      })
      .addCase(bulkUpdateSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // INIT CATEGORY SETTINGS
    builder
      .addCase(initCategorySettings.fulfilled, (state) => {
        state.success = "Category settings initialized";
      })
      .addCase(initCategorySettings.rejected, (state, action) => {
        state.error = action.payload;
      });

    // INIT COLLECTION SETTINGS
    builder
      .addCase(initCollectionSettings.fulfilled, (state) => {
        state.success = "Collection settings initialized";
      })
      .addCase(initCollectionSettings.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(initShopSettings.fulfilled, (state) => {
        state.success = "Shop settings initialized";
      })
      .addCase(initShopSettings.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(initAboutSettings.fulfilled, (state) => {
        state.success = "About settings initialized";
      })
      .addCase(initAboutSettings.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = settingSlice.actions;
export default settingSlice.reducer;

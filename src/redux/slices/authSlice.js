// frontend/src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import api from "../../services/api";
import { fetchManager } from "../../utils/fetchManager";

// ============================================
// Initial State
// ============================================
const initialState = {
  user: null,
  users: [],
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  success: null,
  isUsersLoading: false,
  usersError: null,
};

// ============================================
// Async Thunks (API Calls)
// ============================================

// POST /api/v1/auth/register
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Registration failed",
      );
    }
  },
);

// authSlice.js - Update login thunk

// POST /api/v1/auth/login
// POST /api/v1/auth/login - FIXED to handle OAuth
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      let response;

      // ✅ Check if it's an OAuth login
      if (credentials.provider === "google") {
        // Google OAuth login - Send the code
        response = await authService.googleLogin(credentials.code);
      } else if (credentials.provider === "facebook") {
        // Facebook OAuth login
        response = await authService.facebookLogin(
          credentials.accessToken,
          credentials.userID,
        );
      } else {
        // Regular email/password login
        response = await authService.login(credentials);
      }

      return response;
    } catch (error) {
      // Handle errors
      if (error.response?.status === 429) {
        const retryAfter = error.response?.headers?.["retry-after"] || 30;
        return rejectWithValue({
          message:
            error.response?.data?.error?.message ||
            `Too many requests. Please wait ${retryAfter} seconds.`,
          status: 429,
          isRateLimit: true,
          retryAfter: retryAfter,
        });
      }
      return rejectWithValue(
        error.response?.data?.error?.message || "Login failed",
      );
    }
  },
);

// POST /api/v1/auth/logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// GET /api/v1/auth/me
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue({ message: "No token found", status: 401 });
      }
      const response = await authService.getCurrentUser();
      return response;
    } catch (error) {
      const status = error.response?.status;
      console.error("getCurrentUser error:", status, error.message);

      if (status === 429) {
        return rejectWithValue({
          message: "Too many requests. Please try again later.",
          status: 429,
        });
      }

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }

      return rejectWithValue({
        message: error.response?.data?.error?.message || "Failed to get user",
        status: status || 500,
      });
    }
  },
);

// POST /api/v1/auth/forgot-password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to send reset link",
      );
    }
  },
);

// POST /api/v1/auth/reset-password/:token
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password, passwordConfirm }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(
        token,
        password,
        passwordConfirm,
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to reset password",
      );
    }
  },
);

// POST /api/v1/auth/change-password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    { currentPassword, newPassword, newPasswordConfirm },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.changePassword(
        currentPassword,
        newPassword,
        newPasswordConfirm,
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to change password",
      );
    }
  },
);

// PUT /api/v1/auth/me
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(userData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update profile",
      );
    }
  },
);

// DELETE /api/v1/auth/me
export const deleteAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (password, { rejectWithValue }) => {
    try {
      const response = await authService.deleteAccount(password);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to delete account",
      );
    }
  },
);

// POST /api/v1/auth/refresh-token
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await authService.refreshToken(auth.refreshToken);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to refresh token",
      );
    }
  },
);

// ============================================
// ADMIN USER MANAGEMENT THUNKS - FIXED
// ============================================

// GET /api/v1/users - WITH FETCH MANAGER
export const getUsers = createAsyncThunk(
  "auth/getUsers",
  async (params = {}, { rejectWithValue }) => {
    const key = "users";

    // ✅ Check if we can fetch
    if (!fetchManager.canFetch(key)) {
      // Return a resolved promise with existing data
      return rejectWithValue({
        message: "Fetch already in progress or on cooldown",
        skipped: true,
      });
    }

    // ✅ Start fetch
    fetchManager.startFetch(key);

    try {
      console.log("📡 Fetching users...");
      const response = await api.get("/users", { params });
      console.log("✅ Users fetched:", response.data.data.users?.length || 0);

      // ✅ Complete fetch
      fetchManager.completeFetch(key);

      return response.data.data.users;
    } catch (error) {
      console.error("❌ Failed to fetch users:", error.message);

      // ✅ Reset flag on error
      fetchManager.resetFetch(key);

      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch users",
      );
    }
  },
);

// GET /api/v1/users/:id
export const getUserById = createAsyncThunk(
  "auth/getUserById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch user",
      );
    }
  },
);

// PUT /api/v1/users/:id
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update user",
      );
    }
  },
);

// DELETE /api/v1/users/:id
export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      // ✅ The ID should be passed in the URL, not in the body
      const response = await api.delete(`/users/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      console.error("❌ Delete user error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to delete user",
      );
    }
  },
);

// GET /api/v1/users/stats
export const getUserStats = createAsyncThunk(
  "auth/getUserStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/stats");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch user stats",
      );
    }
  },
);

// ============================================
// Slice
// ============================================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearUsersError: (state) => {
      state.usersError = null;
    },
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    },
    // Add to reducers
    loginSuccess: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
    },
  },
  extraReducers: (builder) => {
    // ==========================================
    // REGISTER
    // ==========================================
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.refreshToken = action.payload.data.refreshToken;
        state.success = action.payload.message || "Registration successful";
        localStorage.setItem("token", action.payload.data.token);
        localStorage.setItem("refreshToken", action.payload.data.refreshToken);
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // LOGIN
    // ==========================================
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.refreshToken = action.payload.data.refreshToken;
        state.success = action.payload.message || "Login successful";
        localStorage.setItem("token", action.payload.data.token);
        localStorage.setItem("refreshToken", action.payload.data.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // LOGOUT
    // ==========================================
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.success = "Logged out successfully";
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // GET CURRENT USER
    // ==========================================
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.data?.user) {
          state.user = action.payload.data.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        const error = action.payload;

        if (error?.status === 429) {
          state.error =
            error?.message || "Too many requests. Please try again later.";
          return;
        }

        if (error?.status === 401 || error?.message === "No token found") {
          state.user = null;
          state.isAuthenticated = false;
        } else {
          state.error = error?.message || "Failed to get user";
        }
      });

    // ==========================================
    // FORGOT PASSWORD
    // ==========================================
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success =
          action.payload.message || "Reset link sent to your email";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // RESET PASSWORD
    // ==========================================
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message || "Password reset successfully";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // CHANGE PASSWORD
    // ==========================================
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success =
          action.payload.message || "Password changed successfully";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // UPDATE PROFILE
    // ==========================================
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.success =
          action.payload.message || "Profile updated successfully";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // DELETE ACCOUNT
    // ==========================================
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.success =
          action.payload.message || "Account deleted successfully";
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // REFRESH TOKEN
    // ==========================================
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.data.token;
        state.refreshToken = action.payload.data.refreshToken;
        localStorage.setItem("token", action.payload.data.token);
        localStorage.setItem("refreshToken", action.payload.data.refreshToken);
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      });

    // ==========================================
    // GET USERS (Admin) - FIXED
    // ==========================================
    builder
      .addCase(getUsers.pending, (state) => {
        state.isUsersLoading = true;
        state.usersError = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isUsersLoading = false;
        // ✅ Only update if we actually got data
        if (action.payload) {
          state.users = action.payload;
        }
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isUsersLoading = false;
        const error = action.payload;
        // ✅ Don't set error for skipped/cooldown requests
        if (error?.skipped) {
          return;
        }
        state.usersError = error?.message || "Failed to fetch users";
      });

    // ==========================================
    // UPDATE USER (Admin)
    // ==========================================
    builder
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users?.findIndex(
          (u) => u._id === action.payload._id,
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.user?._id === action.payload._id) {
          state.user = action.payload;
        }
        state.success = "User updated successfully";
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // DELETE USER (Admin)
    // ==========================================
    builder
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users?.filter((u) => u._id !== action.payload.id);
        state.success = "User deleted successfully";
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ============================================
// Actions
// ============================================
export const {
  clearError,
  clearSuccess,
  clearUsersError,
  setCredentials,
  clearCredentials,
  loginSuccess,
} = authSlice.actions;

// ============================================
// Selectors
// ============================================
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectUsers = (state) => state.auth.users;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.success;
export const selectIsUsersLoading = (state) => state.auth.isUsersLoading;
export const selectUsersError = (state) => state.auth.usersError;

// ============================================
// Export
// ============================================
export default authSlice.reducer;

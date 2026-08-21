import api from "./api";

const authService = {
  // ==========================================
  // AUTH ENDPOINTS (Matches backend)
  // ==========================================

  // POST /api/v1/auth/register
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // POST /api/v1/auth/login
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // ✅ Google OAuth Login - Send code
  googleLogin: async (code) => {
    const response = await api.post("/auth/google", { code });
    return response.data;
  },

  // ✅ Facebook OAuth Login
  facebookLogin: async (accessToken, userID) => {
    const response = await api.post("/auth/facebook", { accessToken, userID });
    return response.data;
  },

  // POST /api/v1/auth/logout
  logout: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken });
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    return { success: true };
  },

  // GET /api/v1/auth/me
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // POST /api/v1/auth/refresh-token
  refreshToken: async (refreshToken) => {
    const response = await api.post("/auth/refresh-token", { refreshToken });
    return response.data;
  },

  // POST /api/v1/auth/forgot-password
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // POST /api/v1/auth/reset-password/:token
  resetPassword: async (token, password, passwordConfirm) => {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password,
      passwordConfirm,
    });
    return response.data;
  },

  // POST /api/v1/auth/change-password
  changePassword: async (currentPassword, newPassword, newPasswordConfirm) => {
    const response = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
      newPasswordConfirm,
    });
    return response.data;
  },

  // PUT /api/v1/auth/me
  updateProfile: async (data) => {
    const response = await api.put("/auth/me", data);
    return response.data;
  },

  // DELETE /api/v1/auth/me
  deleteAccount: async (password) => {
    const response = await api.delete("/auth/me", { data: { password } });
    return response.data;
  },

  // GET /api/v1/auth/verify-email/:token
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // POST /api/v1/auth/resend-verification
  resendVerification: async (email) => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  },
};

export default authService;

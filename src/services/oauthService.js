import api from "./api";

const oauthService = {
  // POST /api/v1/auth/google
  googleLogin: async (token) => {
    const response = await api.post("/auth/google", { token });
    return response.data;
  },

  // POST /api/v1/auth/facebook
  facebookLogin: async (accessToken, userID) => {
    const response = await api.post("/auth/facebook", { accessToken, userID });
    return response.data;
  },
};

export default oauthService;

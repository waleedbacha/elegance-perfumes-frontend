import React from "react";
import { useDispatch } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";
import { login } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";

const GoogleLoginButton = ({ children, className = "", disabled = false }) => {
  const dispatch = useDispatch();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log("🔑 Full Google response:", response);

        const code = response.code;
        console.log("📝 Code received:", code);

        const result = await dispatch(
          login({
            provider: "google",
            code: code,
          }),
        ).unwrap();

        if (result.success) {
          toast.success("Google login successful! 🎉");
          window.location.href = "/";
        }
      } catch (error) {
        console.error("❌ Google login error:", error);
        toast.error(
          typeof error === "string"
            ? error
            : error?.message || "Google login failed",
        );
      }
    },
    onError: (error) => {
      console.error("❌ Google OAuth error:", error);
      toast.error("Google login failed. Please try again.");
    },
    flow: "auth-code",
    scope: "openid email profile",
    // ✅ ADD THIS - Required for production
    redirect_uri: "postmessage",
  });

  return (
    <button
      type="button"
      className={className}
      onClick={() => handleGoogleLogin()}
      disabled={disabled}
    >
      {children || "Sign in with Google"}
    </button>
  );
};

export default GoogleLoginButton;

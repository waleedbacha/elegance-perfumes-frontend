import React from "react";
import { useDispatch } from "react-redux";
import { login } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";

const FacebookLoginButton = ({
  children,
  className = "",
  disabled = false,
}) => {
  const dispatch = useDispatch();

  const handleFacebookLogin = () => {
    // ✅ Initialize Facebook SDK
    if (typeof window.FB !== "undefined") {
      window.FB.login(
        function (response) {
          if (response.authResponse) {
            const { accessToken, userID } = response.authResponse;
            handleFacebookResponse(accessToken, userID);
          } else {
            toast.error("Facebook login cancelled");
          }
        },
        { scope: "public_profile,email" },
      );
    } else {
      toast.error("Facebook SDK not loaded. Please try again.");
    }
  };

  const handleFacebookResponse = async (accessToken, userID) => {
    try {
      const result = await dispatch(
        login({
          provider: "facebook",
          accessToken: accessToken,
          userID: userID,
        }),
      ).unwrap();

      if (result.success) {
        toast.success("Facebook login successful! 🎉");
        window.location.href = "/";
      }
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Facebook login failed",
      );
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleFacebookLogin}
      disabled={disabled}
    >
      {children || "Sign in with Facebook"}
    </button>
  );
};

export default FacebookLoginButton;

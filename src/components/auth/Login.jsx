import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { login, clearError, clearSuccess } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";
import GoogleLoginButton from "./GoogleLoginButton";
import FacebookLoginButton from "./FacebookLoginButton";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, success } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  // ✅ Rate limiting state - only show remaining time
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const cooldownTimerRef = React.useRef(null);

  // ==========================================
  // CLEAR MESSAGES ON UNMOUNT
  // ==========================================

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, [dispatch]);

  // ==========================================
  // COOLDOWN TIMER
  // ==========================================

  useEffect(() => {
    if (isRateLimited && cooldownTime > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setCooldownTime((prev) => prev - 1);
      }, 1000);
    } else if (cooldownTime === 0 && isRateLimited) {
      setIsRateLimited(false);
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
      toast.success("You can try logging in again now.");
    }

    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, [isRateLimited, cooldownTime]);

  // ==========================================
  // CHECK FOR RATE LIMIT FROM BACKEND
  // ==========================================

  useEffect(() => {
    // ✅ Check if error contains rate limit message
    const errorMessage =
      typeof error === "string" ? error : error?.message || "";

    if (
      errorMessage.toLowerCase().includes("too many") ||
      errorMessage.toLowerCase().includes("rate limit")
    ) {
      // Try to extract seconds from error message
      const match = errorMessage.match(/(\d+)\s*(?:seconds?|minutes?)/i);
      let seconds = 900; // Default 15 minutes

      if (match) {
        const value = parseInt(match[1]);
        if (errorMessage.toLowerCase().includes("minute")) {
          seconds = value * 60;
        } else {
          seconds = value;
        }
      }

      setIsRateLimited(true);
      setCooldownTime(seconds);
    }
  }, [error]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setTouched({ ...touched, [name]: true });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Check if rate limited
    if (isRateLimited) {
      const minutes = Math.ceil(cooldownTime / 60);
      toast.error(
        `Please wait ${minutes} minute${minutes > 1 ? "s" : ""} before trying again.`,
      );
      return;
    }

    // ✅ Validate email
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      setTouched({ ...touched, email: true });
      return;
    }

    // ✅ Validate password
    if (!formData.password || formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      setTouched({ ...touched, password: true });
      return;
    }

    try {
      const result = await dispatch(
        login({
          email: formData.email,
          password: formData.password,
        }),
      ).unwrap();

      toast.success("Welcome back!");

      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      // ✅ Handle rate limit from API
      if (error?.status === 429 || error?.isRateLimit) {
        const seconds = error?.retryAfter || 900;
        setIsRateLimited(true);
        setCooldownTime(seconds);
        const minutes = Math.ceil(seconds / 60);
        toast.error(
          `Too many requests. Please wait ${minutes} minute${minutes > 1 ? "s" : ""}.`,
        );
      } else {
        // ✅ Show the actual error message
        const errorMessage =
          typeof error === "string"
            ? error
            : error?.message || "Invalid credentials";
        toast.error(errorMessage);
      }
    }
  };

  const getFieldError = (field) => {
    if (!touched[field]) return null;
    if (!formData[field]) return `${field} is required`;
    if (field === "email" && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      return "Please enter a valid email";
    }
    if (field === "password" && formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    return null;
  };

  const getFieldClass = (field) => {
    const error = getFieldError(field);
    if (error) return "error";
    if (touched[field] && formData[field]) return "success";
    return "";
  };

  // ✅ Format cooldown time
  const formatCooldown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="login-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="login-card"
      >
        {/* Header */}
        <div className="card-header">
          <div className="brand-icon">
            <span>✦</span>
          </div>
          <h1>
            Welcome <span className="highlight">Back</span>
          </h1>
          <p>Sign in to your Elegance Perfumes account</p>
        </div>

        {/* ✅ Rate Limit Warning */}
        <AnimatePresence>
          {isRateLimited && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rate-limit-warning"
            >
              <Clock size={18} />
              <span>
                Too many login attempts. Please wait{" "}
                <strong>{formatCooldown(cooldownTime)}</strong> before trying
                again.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Buttons */}
        <div className="social-buttons">
          <GoogleLoginButton className="social-btn google">
            <span>G</span> Google
          </GoogleLoginButton>
          {/* <FacebookLoginButton className="social-btn facebook">
            <span>f</span> Facebook
          </FacebookLoginButton> */}
        </div>

        <div className="divider">
          <span className="line" />
          <span className="text">or continue with email</span>
          <span className="line" />
        </div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && !isRateLimited && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="error-message"
            >
              <AlertCircle size={18} />
              {typeof error === "string"
                ? error
                : error?.message || "An error occurred"}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="success-message"
            >
              <CheckCircle size={18} />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              className={`form-input ${getFieldClass("email")}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isRateLimited}
              required
            />
            {touched.email && getFieldError("email") && (
              <p
                className="text-danger"
                style={{
                  fontSize: "0.75rem",
                  marginTop: "4px",
                  color: "#EF4444",
                }}
              >
                {getFieldError("email")}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`form-input ${getFieldClass("password")}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isRateLimited}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isRateLimited}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.password && getFieldError("password") && (
              <p
                className="text-danger"
                style={{
                  fontSize: "0.75rem",
                  marginTop: "4px",
                  color: "#EF4444",
                }}
              >
                {getFieldError("password")}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isRateLimited}
              />
              <label>Remember me</label>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <div className="form-footer">
            <button
              type="submit"
              className={`login-btn ${isRateLimited ? "disabled" : ""}`}
              disabled={isLoading || isRateLimited}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  &nbsp; Signing In...
                </>
              ) : isRateLimited ? (
                <>
                  <Clock size={18} />
                  &nbsp; Wait {formatCooldown(cooldownTime)}
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        {/* Register Link */}
        <div className="register-link">
          <p>
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

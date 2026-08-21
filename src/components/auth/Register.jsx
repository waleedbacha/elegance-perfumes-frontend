import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  register,
  clearError,
  clearSuccess,
} from "../../redux/slices/authSlice";
import GoogleLoginButton from "./GoogleLoginButton";
import FacebookLoginButton from "./FacebookLoginButton";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, success } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: "",
    class: "",
  });
  const [touched, setTouched] = useState({});

  // ==========================================
  // PASSWORD STRENGTH CHECKER
  // ==========================================

  useEffect(() => {
    const checkPasswordStrength = (password) => {
      let score = 0;
      let text = "";
      let classname = "";

      if (password.length === 0) {
        setPasswordStrength({ score: 0, text: "", class: "" });
        return;
      }

      if (password.length >= 8) score++;
      if (password.length >= 12) score++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
      if (/\d/.test(password)) score++;
      if (/[!@#$%^&*]/.test(password)) score++;

      if (score <= 1) {
        text = "Weak";
        classname = "weak";
      } else if (score <= 3) {
        text = "Medium";
        classname = "medium";
      } else {
        text = "Strong";
        classname = "strong";
      }

      setPasswordStrength({ score, text, class: classname });
    };

    checkPasswordStrength(formData.password);
  }, [formData.password]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const formatPhoneNumber = (value) => {
    // Remove all non-numeric
    let cleaned = value.replace(/\D/g, "");
    // Remove leading 0
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }
    // Add 92 if not present and not empty
    if (cleaned.length > 0 && !cleaned.startsWith("92")) {
      cleaned = `92${cleaned}`;
    }
    // Limit to 12 digits
    if (cleaned.length > 12) {
      cleaned = cleaned.substring(0, 12);
    }
    return cleaned;
  };

  // Update the handleChange function:
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Auto-format phone
    if (name === "phone") {
      newValue = formatPhoneNumber(value);
    }

    setFormData({ ...formData, [name]: newValue });
    setTouched({ ...touched, [name]: true });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.passwordConfirm) {
      // Show error
      return;
    }

    const result = await dispatch(
      register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
      }),
    );

    if (!result.error) {
      // Navigate to home after successful registration
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  };

  const getFieldError = (field) => {
    if (!touched[field]) return null;
    if (!formData[field]) return `${field} is required`;
    if (field === "email" && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      return "Please enter a valid email";
    }
    // Update the getFieldError function for phone validation:
    if (field === "phone") {
      const cleaned = formData.phone.replace(/\D/g, "");
      if (cleaned.length > 0 && cleaned.length < 12) {
        return "Please enter a complete phone number (e.g., 3459270471)";
      }
      if (cleaned.length > 0 && !cleaned.startsWith("92")) {
        return "Phone number must include country code 92";
      }
    }
    if (field === "password" && formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (
      field === "passwordConfirm" &&
      formData.passwordConfirm !== formData.password
    ) {
      return "Passwords do not match";
    }
    return null;
  };

  const getFieldClass = (field) => {
    const error = getFieldError(field);
    if (error) return "error";
    if (touched[field] && formData[field]) return "success";
    return "";
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="register-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="register-card"
      >
        {/* Header */}
        <div className="card-header">
          <div className="brand-icon">
            <span>✨</span>
          </div>
          <h1>
            Create <span className="highlight">Account</span>
          </h1>
          <p>Join the Elegance Perfumes community</p>
        </div>

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
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="error-message"
            >
              <AlertCircle size={18} />
              {error}
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
          {/* Name */}
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <User
                size={18}
                className="input-icon"
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6B7280",
                }}
              />
              <input
                type="text"
                name="name"
                className={`form-input ${getFieldClass("name")}`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
            </div>
            {touched.name && getFieldError("name") && (
              <p
                className="text-danger"
                style={{
                  fontSize: "0.75rem",
                  marginTop: "4px",
                  color: "#EF4444",
                }}
              >
                {getFieldError("name")}
              </p>
            )}
          </div>

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

          <div className="form-group">
            <label className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              className={`form-input ${getFieldClass("phone")}`}
              placeholder="3459270471"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {touched.phone && getFieldError("phone") && (
              <p
                className="text-danger"
                style={{
                  fontSize: "0.75rem",
                  marginTop: "4px",
                  color: "#EF4444",
                }}
              >
                {getFieldError("phone")}
              </p>
            )}
            <small style={{ color: "#6b7280", fontSize: "0.75rem" }}>
              Enter phone without 0 or +92 (e.g., 3459270471)
            </small>
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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
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
            {/* Password Strength */}
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`segment ${i <= passwordStrength.score ? "active " + passwordStrength.class : ""}`}
                    />
                  ))}
                </div>
                <div className="strength-text">
                  <span className={passwordStrength.class}>
                    {passwordStrength.text}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">
              Confirm Password <span className="required">*</span>
            </label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="passwordConfirm"
                className={`form-input ${getFieldClass("passwordConfirm")}`}
                placeholder="Confirm your password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.passwordConfirm && getFieldError("passwordConfirm") && (
              <p
                className="text-danger"
                style={{
                  fontSize: "0.75rem",
                  marginTop: "4px",
                  color: "#EF4444",
                }}
              >
                {getFieldError("passwordConfirm")}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="form-footer">
            <button type="submit" className="register-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner" />
                  &nbsp; Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="login-link">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

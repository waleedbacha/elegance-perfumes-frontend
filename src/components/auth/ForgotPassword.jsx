import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Send } from "lucide-react";
import {
  forgotPassword,
  clearError,
  clearSuccess,
} from "../../redux/slices/authSlice";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { isLoading, error, success } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ==========================================
  // CLEAR MESSAGES ON UNMOUNT
  // ==========================================

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const result = await dispatch(forgotPassword(email));

    if (!result.error) {
      setSubmitted(true);
    }
  };

  const getFieldError = () => {
    if (!touched) return null;
    if (!email) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return "Please enter a valid email";
    }
    return null;
  };

  const getFieldClass = () => {
    const error = getFieldError();
    if (error) return "error";
    if (touched && email) return "success";
    return "";
  };

  // ==========================================
  // RENDER - SUCCESS STATE
  // ==========================================

  if (success || submitted) {
    return (
      <div className="forgot-password-page">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="forgot-password-card"
        >
          <div className="success-state">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="success-icon"
            >
              <span>📧</span>
            </motion.div>
            <h2>Check Your Email</h2>
            <p>
              We've sent a password reset link to{" "}
              <span className="email-highlight">{email}</span>
            </p>
            <p
              style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "8px" }}
            >
              If you don't see the email, check your spam folder.
            </p>
            <Link to="/login" className="back-link">
              ← Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // RENDER - FORM STATE
  // ==========================================

  return (
    <div className="forgot-password-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="forgot-password-card"
      >
        {/* Header */}
        <div className="card-header">
          <div className="brand-icon">
            <span>🔑</span>
          </div>
          <h1>
            Reset <span className="highlight">Password</span>
          </h1>
          <p>
            Enter your email address and we'll send you
            <br />a link to reset your password.
          </p>
        </div>

        {/* Error Message */}
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
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6B7280",
                }}
              />
              <input
                type="email"
                className={`form-input ${getFieldClass()}`}
                style={{ paddingLeft: "40px" }}
                placeholder="Enter your email"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
            </div>
            {touched && getFieldError() && (
              <p
                className="text-danger"
                style={{
                  fontSize: "0.75rem",
                  marginTop: "4px",
                  color: "#EF4444",
                }}
              >
                {getFieldError()}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="form-footer">
            <button type="submit" className="reset-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner" />
                  &nbsp; Sending...
                </>
              ) : (
                <>
                  <Send size={16} style={{ marginRight: "8px" }} />
                  Send Reset Link
                </>
              )}
            </button>
          </div>
        </form>

        {/* Back to Login */}
        <div className="back-to-login">
          <Link to="/login">
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

// frontend/src/pages/AdminLogin.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { login, clearError } from "../../redux/slices/authSlice";
import "../../styles/pages/AdminLogin.css";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading, error } = useSelector(
    (state) => state.auth,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error on input change
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      const result = await dispatch(
        login({
          email: formData.email,
          password: formData.password,
        }),
      ).unwrap();

      if (result?.data?.user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        // Not an admin
        toast.error("Access denied. Admin only.");
        navigate("/");
      }
    } catch (err) {
      // Error handled by slice
    }
  };

  return (
    <div className="admin-login-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={4}>
            <Card className="admin-login-card">
              <Card.Body className="p-4 p-md-5">
                <div className="admin-login-header">
                  <div className="admin-login-logo">
                    <Shield size={32} className="admin-logo-icon" />
                    <span className="admin-logo-text">Admin</span>
                  </div>
                  <h2 className="admin-login-title">Welcome Back</h2>
                  <p className="admin-login-subtitle">
                    Sign in to manage your store
                  </p>
                </div>

                {error && (
                  <Alert variant="danger" className="admin-login-alert">
                    {typeof error === "string"
                      ? error
                      : error?.message || "Login failed"}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="admin-login-label">
                      Email Address
                    </Form.Label>
                    <div className="admin-input-wrapper">
                      <Mail size={18} className="admin-input-icon" />
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@elegance.pk"
                        className="admin-login-input"
                        required
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="admin-login-label">
                      Password
                    </Form.Label>
                    <div className="admin-input-wrapper">
                      <Lock size={18} className="admin-input-icon" />
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="admin-login-input"
                        required
                      />
                      <button
                        type="button"
                        className="admin-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <Form.Check
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        label="Remember me"
                        className="admin-remember-check"
                      />
                      <Link
                        to="/admin/forgot-password"
                        className="admin-forgot-link"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </Form.Group>

                  <Button
                    type="submit"
                    className="admin-login-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Form>

                <div className="admin-login-footer">
                  <p className="admin-login-back">
                    <Link to="/">← Back to Store</Link>
                  </p>
                  <p className="admin-login-help">
                    Need help? Contact{" "}
                    <a href="mailto:elegance.myperfume@gmail.com">
                      elegance.myperfume@gmail.com
                    </a>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;

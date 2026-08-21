// frontend/src/App.js
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

// Pages
import HomePage from "./pages/HomePage";
import CollectionsPage from "./pages/CollectionsPage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import WishlistPage from "./pages/WishlistPage";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

// Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

// Redux
import { getCurrentUser } from "./redux/slices/authSlice";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useSelector(
    (state) => state.auth,
  );
  const [isAppReady, setIsAppReady] = useState(false);

  // Check if current route is admin
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Get Google Client ID from environment
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // SCROLL TO TOP ON ROUTE CHANGE
  useEffect(() => {
    // Scroll to top with smooth animation
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token && !user) {
        await dispatch(getCurrentUser());
      }
      setIsAppReady(true);
    };
    initAuth();
  }, [dispatch, user]);

  if (!isAppReady || (isLoading && !isAuthenticated)) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#0a0a0a",
          color: "#ffffff",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #2a2a2a",
              borderTop: "3px solid #8b0000",
              borderRadius: "50%",
              margin: "0 auto 20px",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "#6b7280" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    // Wrap with GoogleOAuthProvider
    <GoogleOAuthProvider clientId={googleClientId}>
      <Helmet>
        <title>Elegance Perfumes - Luxury Fragrances</title>
        <meta
          name="description"
          content="Discover our curated collection of luxury perfumes."
        />
      </Helmet>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1A1A1A",
            color: "#FFFFFF",
            border: "1px solid #8B0000",
          },
          success: {
            style: {
              background: "#1A1A1A",
              color: "#FFFFFF",
              border: "1px solid #10B981",
            },
          },
          error: {
            style: {
              background: "#1A1A1A",
              color: "#FFFFFF",
              border: "1px solid #EF4444",
            },
          },
        }}
      />

      {/*Only show Navbar & Footer for non-admin routes */}
      {!isAdminRoute && <Navbar />}

      <div
        className={
          isAdminRoute
            ? "admin-app-container"
            : "min-h-screen flex flex-col bg-black-900"
        }
      >
        <main className={isAdminRoute ? "" : "flex-grow pt-16"}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Admin Routes - No Navbar/Footer */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminDashboard />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;

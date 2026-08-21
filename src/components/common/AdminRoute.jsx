// frontend/src/components/common/AdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = () => {
  const { isAuthenticated, user, isLoading } = useSelector(
    (state) => state.auth,
  );

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#0a0a0a",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid #2a2a2a",
            borderTop: "3px solid #8b0000",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user is admin
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // User is admin, render the child routes
  return <Outlet />;
};

export default AdminRoute;

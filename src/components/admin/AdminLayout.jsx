// frontend/src/components/admin/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Eye,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Ticket,
  Boxes,
} from "lucide-react";
import "../../styles/pages/AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth < 992) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin/dashboard",
    },
    {
      id: "products",
      label: "Products",
      icon: <Package size={20} />,
      path: "/admin/products",
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingBag size={20} />,
      path: "/admin/orders",
    },
    {
      id: "users",
      label: "Users",
      icon: <Users size={20} />,
      path: "/admin/users",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: <Boxes size={20} />,
      path: "/admin/inventory",
    },
    {
      id: "coupons",
      label: "Coupons",
      icon: <Ticket size={20} />,
      path: "/admin/coupons",
    },
    {
      id: "banners",
      label: "Banners",
      icon: <Eye size={20} />,
      path: "/admin/banners",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <TrendingUp size={20} />,
      path: "/admin/analytics",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <span className="admin-brand-icon">⚜️</span>
            <span className="admin-brand-text">Admin Panel</span>
          </div>
          {isMobile && (
            <button
              className="admin-sidebar-close"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`admin-nav-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-user-avatar">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.name || "Admin"}</span>
              <span className="admin-user-role">
                {user?.role || "Administrator"}
              </span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Toggle */}
      {isMobile && !sidebarOpen && (
        <button
          className="admin-mobile-toggle"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Main Content */}
      <main className="admin-main-content">
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

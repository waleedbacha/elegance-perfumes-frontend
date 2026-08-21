// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Image } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Star,
  Clock,
  AlertCircle,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  LayoutDashboard,
  Ticket,
  Boxes,
  LogOut,
  Menu,
  X,
  Loader,
  Grid3X3,
  ChevronRight,
  Info,
  HardDrive,
} from "lucide-react";
import toast from "react-hot-toast";
import "../styles/pages/AdminDashboard.css";

import { getUsers, logout } from "../redux/slices/authSlice";
import { getProducts } from "../redux/slices/productSlice";
import { getAllOrders, getOrderStats } from "../redux/slices/orderSlice"; // ✅ Changed to getAllOrders
import { getInventorySummary } from "../redux/slices/inventorySlice"; // ✅ Added for inventory stats

// Import admin components
import ProductManagement from "../components/admin/ProductManagement";
import OrderManagement from "../components/admin/OrderManagement";
import UserManagement from "../components/admin/UserManagement";
import InventoryManagement from "../components/admin/InventoryManagement";
import CouponManagement from "../components/admin/CouponManagement";
import BannerManagement from "../components/admin/BannerManagement";
import AnalyticsDashboard from "../components/admin/AnalyticsDashboard";
import ReviewManagement from "../components/admin/ReviewManagement";
import CategoryManagement from "../components/admin/CategoryManagement";
import HeroManagement from "../components/admin/HeroManagement";
import CategorySettingsManagement from "../components/admin/CategorySettingsManagement";
import CollectionSettingsManagement from "../components/admin/CollectionSettingsManagement";
import ShopSettingsManagement from "../components/admin/ShopSettingsManagement";
import AboutSettingsManagement from "../components/admin/AboutSettingsManagement";
import NavbarManagement from "../components/admin/NavbarManagement";
import SEOManagement from "../components/admin/SEOManagement";
import SEODashboard from "../components/admin/SEODashboard";
import CacheManagement from "../components/admin/CacheManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isLoading, isAuthenticated } = useSelector(
    (state) => state.auth,
  );
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Get active tab from URL
  useEffect(() => {
    const path = location.pathname;
    const tab = path.split("/admin/")[1] || "dashboard";
    setActiveTab(tab);

    // Check if any settings tab is active
    const settingsTabs = [
      "category-settings",
      "collection-settings",
      "coupons",
      "banners",
      "hero",
    ];
    if (settingsTabs.includes(tab)) {
      setSettingsOpen(true);
    }
  }, [location]);

  // Check if user is admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        navigate("/admin/login");
        return;
      }
      if (user.role === "admin") {
        setIsAuthorized(true);
      } else {
        toast.error("Access denied. Admin only.");
        navigate("/");
      }
    }
  }, [user, isLoading, isAuthenticated, navigate]);

  // Check mobile
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

  // Toggle settings dropdown
  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  // Admin navigation items
  const navItems = [
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
      id: "reviews",
      label: "Reviews",
      icon: <Star size={20} />,
      path: "/admin/reviews",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <TrendingUp size={20} />,
      path: "/admin/analytics",
    },
    {
      id: "categories",
      label: "Categories",
      icon: <Grid3X3 size={20} />,
      path: "/admin/categories",
    },
  ];

  // Settings sub-menu items
  const settingsItems = [
    {
      id: "category-settings",
      label: "Category Settings",
      icon: <Settings size={18} />,
      path: "/admin/category-settings",
    },
    {
      id: "collection-settings",
      label: "Collection Settings",
      icon: <Settings size={18} />,
      path: "/admin/collection-settings",
    },
    {
      id: "coupons",
      label: "Coupons",
      icon: <Ticket size={18} />,
      path: "/admin/coupons",
    },
    {
      id: "banners",
      label: "Banners",
      icon: <Eye size={18} />,
      path: "/admin/banners",
    },
    {
      id: "hero",
      label: "Hero Section",
      icon: <Image size={18} />,
      path: "/admin/hero",
    },
    {
      id: "shop-settings",
      label: "Shop Settings",
      icon: <ShoppingBag size={18} />,
      path: "/admin/shop-settings",
    },
    {
      id: "about-settings",
      label: "About Settings",
      icon: <Info size={18} />,
      path: "/admin/about-settings",
    },
    {
      id: "navbar",
      label: "Navbar",
      icon: <Menu size={20} />,
      path: "/admin/navbar",
    },
    {
      id: "seo",
      label: "SEO Management",
      icon: <TrendingUp size={18} />, // or use a dedicated SEO icon
      path: "/admin/seo",
    },
    {
      id: "seo-dashboard",
      label: "SEO Dashboard",
      icon: <TrendingUp size={20} />,
      path: "/admin/seo-dashboard",
    },
    {
      id: "cache",
      label: "Cache Management",
      icon: <HardDrive size={20} />,
      path: "/admin/cache",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "products":
        return <ProductManagement />;
      case "orders":
        return <OrderManagement />;
      case "users":
        return <UserManagement />;
      case "inventory":
        return <InventoryManagement />;
      case "coupons":
        return <CouponManagement />;
      case "banners":
        return <BannerManagement />;
      case "reviews":
        return <ReviewManagement />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "categories":
        return <CategoryManagement />;
      case "hero":
        return <HeroManagement />;
      case "category-settings":
        return <CategorySettingsManagement />;
      case "collection-settings":
        return <CollectionSettingsManagement />;
      case "shop-settings":
        return <ShopSettingsManagement />;
      case "about-settings":
        return <AboutSettingsManagement />;
      case "navbar":
        return <NavbarManagement />;
      case "seo":
        return <SEOManagement />;
      case "seo-dashboard":
        return <SEODashboard />;
      case "cache":
        return <CacheManagement />;
      default:
        return <DashboardContent />;
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setSidebarOpen(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    if (window.confirm("Are you sure you want to logout?")) {
      setIsLoggingOut(true);

      try {
        await dispatch(logout()).unwrap();
        toast.success("Logged out successfully!");
        navigate("/admin/login");
      } catch (error) {
        console.error("Logout error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        sessionStorage.clear();
        toast.success("Logged out successfully!");
        navigate("/admin/login");
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  if (isLoading || !isAuthorized) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="admin-dashboard">
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
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          <div className="admin-nav-group">
            <button
              className={`admin-nav-item admin-nav-dropdown ${settingsOpen ? "open" : ""}`}
              onClick={toggleSettings}
            >
              <Settings size={20} />
              <span>Settings</span>
              <ChevronDown
                size={16}
                className={`admin-nav-arrow ${settingsOpen ? "rotate" : ""}`}
              />
            </button>

            {settingsOpen && (
              <div className="admin-nav-submenu">
                {settingsItems.map((item) => (
                  <button
                    key={item.id}
                    className={`admin-nav-item admin-nav-subitem ${activeTab === item.id ? "active" : ""}`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <ChevronRight size={14} className="submenu-icon" />
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-user-avatar">
              {user.name?.charAt(0) || "A"}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{user.name}</span>
              <span className="admin-user-role">{user.role}</span>
            </div>
          </div>
          <button
            className="admin-logout-btn"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader size={18} className="spin" />
            ) : (
              <LogOut size={18} />
            )}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      {isMobile && !sidebarOpen && (
        <button
          className="admin-mobile-toggle"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
      )}

      <main className="admin-main">
        <div className="admin-content">{renderContent()}</div>
      </main>
    </div>
  );
};

// ============================================
// ✅ FIXED DASHBOARD CONTENT WITH REAL DATA
// ============================================
const DashboardContent = () => {
  const dispatch = useDispatch();

  // ✅ Get real data from Redux store
  const { users, isUsersLoading } = useSelector((state) => state.auth);
  const {
    products,
    isLoading: productsLoading,
    pagination,
  } = useSelector((state) => state.products);
  const {
    orders,
    isLoading: ordersLoading,
    stats: orderStats, // ✅ Use the stats from Redux
  } = useSelector((state) => state.orders);

  // ✅ Get inventory summary
  const { summary: inventorySummary, isLoading: inventoryLoading } =
    useSelector((state) => state.inventory);

  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // ✅ Fetch all real data on mount
  useEffect(() => {
    if (!dataFetched) {
      setDataFetched(true);

      // Fetch users
      if (!users?.length && !isUsersLoading) {
        dispatch(getUsers());
      }

      // Fetch products with pagination to get all
      if (!products?.length && !productsLoading) {
        dispatch(getProducts({ page: 1, limit: 100 })); // ✅ Get all products
      }

      // ✅ Fetch admin orders
      if (!orders?.length && !ordersLoading) {
        dispatch(getAllOrders({ page: 1, limit: 100 })); // ✅ Use getAllOrders
      }

      // ✅ Fetch order stats
      dispatch(getOrderStats());

      // ✅ Fetch inventory summary
      if (!inventorySummary) {
        dispatch(getInventorySummary());
      }
    }
  }, [
    dispatch,
    users,
    products,
    orders,
    isUsersLoading,
    productsLoading,
    ordersLoading,
    dataFetched,
    inventorySummary,
  ]);

  // ✅ Calculate stats from real data
  useEffect(() => {
    if (orders?.length || products?.length) {
      calculateStats();
    } else if (!isUsersLoading && !productsLoading && !ordersLoading) {
      setLoading(false);
    }
  }, [users, products, orders, orderStats, inventorySummary]);

  const calculateStats = () => {
    // ✅ Use orderStats from Redux for accurate totals
    const totalOrders = orderStats?.totalOrders || orders?.length || 0;
    const totalRevenue = orderStats?.totalRevenue || 0;
    const pendingOrders =
      orderStats?.pendingOrders ||
      orders?.filter((o) => o.status === "pending").length ||
      0;

    // ✅ FIX: Use pagination.total for accurate product count
    const totalProducts = pagination?.total || products?.length || 0;
    const lowStock = inventorySummary?.lowStock || 0;
    const outOfStock = inventorySummary?.outOfStock || 0;

    // Get today's orders
    const today = new Date().toDateString();
    const todayOrders =
      orders?.filter((o) => {
        if (!o.createdAt) return false;
        return new Date(o.createdAt).toDateString() === today;
      }) || [];
    const todayRevenue = todayOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0,
    );

    // Get recent orders (last 5)
    const recent = orders?.slice(0, 5) || [];

    // Get top products (by purchasedCount)
    const top =
      products
        ?.filter((p) => p.purchasedCount > 0)
        .sort((a, b) => (b.purchasedCount || 0) - (a.purchasedCount || 0))
        .slice(0, 5) || [];

    setRecentOrders(recent);
    setTopProducts(top);
    setLoading(false);
  };

  // ✅ Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    dispatch(getUsers());
    dispatch(getProducts({ page: 1, limit: 100 }));
    dispatch(getAllOrders({ page: 1, limit: 100 }));
    dispatch(getOrderStats());
    dispatch(getInventorySummary());
    toast.success("Refreshing dashboard...");
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  // ✅ Use real stats
  const totalOrders = orderStats?.totalOrders || 0;
  const totalRevenue = orderStats?.totalRevenue || 0;
  const pendingOrders = orderStats?.pendingOrders || 0;
  const totalUsers = users?.length || 0;
  // ✅ FIX: Use pagination.total for accurate product count
  const totalProducts = pagination?.total || products?.length || 0;
  const lowStock = inventorySummary?.lowStock || 0;
  const outOfStock = inventorySummary?.outOfStock || 0;

  // Today's stats
  const today = new Date().toDateString();
  const todayOrders =
    orders?.filter((o) => {
      if (!o.createdAt) return false;
      return new Date(o.createdAt).toDateString() === today;
    }) || [];
  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0,
  );

  const statCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      subtitle: `${todayOrders.length} today`,
      icon: <ShoppingBag size={24} />,
      color: "#8B0000",
      bg: "rgba(139,0,0,0.1)",
    },
    {
      title: "Revenue",
      value: `PKR ${totalRevenue.toLocaleString()}`,
      subtitle: `PKR ${todayRevenue.toLocaleString()} today`,
      icon: <DollarSign size={24} />,
      color: "#D4AF37",
      bg: "rgba(212,175,55,0.1)",
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: <Users size={24} />,
      color: "#10B981",
      bg: "rgba(16,185,129,0.1)",
    },
    {
      title: "Products",
      value: totalProducts,
      subtitle: `${outOfStock} out of stock`,
      icon: <Package size={24} />,
      color: "#3B82F6",
      bg: "rgba(59,130,246,0.1)",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: <Clock size={24} />,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.1)",
    },
    {
      title: "Low Stock Items",
      value: lowStock,
      icon: <AlertCircle size={24} />,
      color: "#EF4444",
      bg: "rgba(239,68,68,0.1)",
    },
  ];

  if (
    loading ||
    isUsersLoading ||
    productsLoading ||
    ordersLoading ||
    inventoryLoading
  ) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, Admin! Here's your store overview.</p>
        </div>
        <button className="btn-refresh" onClick={handleRefresh}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <Row className="g-4">
        {statCards.map((stat, index) => (
          <Col key={index} xs={12} sm={6} xl={4}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-card-content">
                  <div className="stat-icon" style={{ background: stat.bg }}>
                    <span style={{ color: stat.color }}>{stat.icon}</span>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-title">{stat.title}</span>
                    {stat.subtitle && (
                      <span className="stat-subtitle">{stat.subtitle}</span>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Orders & Top Products */}
      <Row className="g-4 mt-2">
        <Col lg={7}>
          <Card className="dashboard-table-card">
            <Card.Header className="dashboard-card-header">
              <h5>Recent Orders</h5>
              <button
                className="btn-view-all"
                onClick={() => (window.location.href = "/admin/orders")}
              >
                View All →
              </button>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="order-number">
                            #{order.orderNumber || "N/A"}
                          </td>
                          <td>
                            {order.customer?.name || order.user?.name || "N/A"}
                          </td>
                          <td>PKR {order.total?.toLocaleString() || 0}</td>
                          <td>
                            <span
                              className={`status-badge ${order.status || "pending"}`}
                            >
                              {order.status || "Pending"}
                            </span>
                          </td>
                          <td>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center text-secondary py-3"
                        >
                          No recent orders
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="dashboard-table-card">
            <Card.Header className="dashboard-card-header">
              <h5>Top Products</h5>
              <button
                className="btn-view-all"
                onClick={() => (window.location.href = "/admin/products")}
              >
                View All →
              </button>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Sales</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.length > 0 ? (
                      topProducts.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <div className="product-cell">
                              <img
                                src={
                                  product.images?.[0]?.url ||
                                  "https://via.placeholder.com/30"
                                }
                                alt={product.name}
                                className="product-thumb"
                              />
                              <span>{product.name}</span>
                            </div>
                          </td>
                          <td>{product.purchasedCount || 0}</td>
                          <td>
                            <span
                              className={`stock-badge ${(product.totalStock || 0) > 0 ? "in-stock" : "out-stock"}`}
                            >
                              {product.totalStock || 0}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="text-center text-secondary py-3"
                        >
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <Row className="g-3">
          <Col xs={6} sm={4} lg={2}>
            <button
              className="quick-action-btn"
              onClick={() => (window.location.href = "/admin/products")}
            >
              <Plus size={20} />
              <span>Add Product</span>
            </button>
          </Col>
          <Col xs={6} sm={4} lg={2}>
            <button
              className="quick-action-btn"
              onClick={() => (window.location.href = "/admin/orders")}
            >
              <ShoppingBag size={20} />
              <span>View Orders</span>
            </button>
          </Col>
          <Col xs={6} sm={4} lg={2}>
            <button
              className="quick-action-btn"
              onClick={() => (window.location.href = "/admin/users")}
            >
              <Users size={20} />
              <span>Manage Users</span>
            </button>
          </Col>
          <Col xs={6} sm={4} lg={2}>
            <button
              className="quick-action-btn"
              onClick={() => (window.location.href = "/admin/coupons")}
            >
              <DollarSign size={20} />
              <span>Create Coupon</span>
            </button>
          </Col>
          <Col xs={6} sm={4} lg={2}>
            <button
              className="quick-action-btn"
              onClick={() => (window.location.href = "/admin/banners")}
            >
              <Eye size={20} />
              <span>Manage Banners</span>
            </button>
          </Col>
          <Col xs={6} sm={4} lg={2}>
            <button
              className="quick-action-btn"
              onClick={() => (window.location.href = "/admin/inventory")}
            >
              <Boxes size={20} />
              <span>Inventory</span>
            </button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminDashboard;

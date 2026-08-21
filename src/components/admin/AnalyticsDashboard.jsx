import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut, Pie } from "react-chartjs-2";
import { getAllOrders, getOrderStats } from "../../redux/slices/orderSlice";
import { getUsers } from "../../redux/slices/authSlice";
import { getProducts } from "../../redux/slices/productSlice";
import { getInventorySummary } from "../../redux/slices/inventorySlice";
import toast from "react-hot-toast";
import "../../styles/pages/AnalyticsDashboard.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const AnalyticsDashboard = () => {
  const dispatch = useDispatch();
  const {
    orders,
    stats: orderStats,
    isLoading: ordersLoading,
  } = useSelector((state) => state.orders);
  const { users, isUsersLoading } = useSelector((state) => state.auth);
  const { products, isLoading: productsLoading } = useSelector(
    (state) => state.products,
  );
  const { summary: inventorySummary, isLoading: inventoryLoading } =
    useSelector((state) => state.inventory);

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [dataFetched, setDataFetched] = useState(false);

  // ✅ Fetch real data
  useEffect(() => {
    if (!dataFetched) {
      setDataFetched(true);
      dispatch(getAllOrders({ page: 1, limit: 100 })); // ✅ Use getAllOrders
      dispatch(getOrderStats());
      dispatch(getUsers());
      dispatch(getProducts({ page: 1, limit: 100 }));
      dispatch(getInventorySummary());
    }
  }, [dispatch, dataFetched]);

  // ✅ Calculate real KPIs
  const kpis = useMemo(() => {
    // Use orderStats from Redux for accurate totals
    const totalRevenue =
      orderStats?.totalRevenue ||
      orders?.reduce((sum, order) => sum + (order.total || 0), 0) ||
      0;
    const totalOrders = orderStats?.totalOrders || orders?.length || 0;
    const totalUsers = users?.length || 0;
    const totalProducts =
      inventorySummary?.totalProducts || products?.length || 0;
    const pendingOrders =
      orderStats?.pendingOrders ||
      orders?.filter((o) => o.status === "pending").length ||
      0;

    // Calculate growth (compare with previous month)
    const now = new Date();
    const thisMonth =
      orders?.filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }) || [];
    const lastMonth =
      orders?.filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return (
          d.getMonth() === now.getMonth() - 1 &&
          d.getFullYear() === now.getFullYear()
        );
      }) || [];

    const thisMonthRevenue = thisMonth.reduce(
      (sum, o) => sum + (o.total || 0),
      0,
    );
    const lastMonthRevenue = lastMonth.reduce(
      (sum, o) => sum + (o.total || 0),
      0,
    );
    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : thisMonthRevenue > 0
          ? 100
          : 0;

    const orderGrowth =
      lastMonth.length > 0
        ? ((thisMonth.length - lastMonth.length) / lastMonth.length) * 100
        : thisMonth.length > 0
          ? 100
          : 0;

    // Calculate user growth (compare with previous month)
    const userGrowth = 0; // You can implement if you have user creation dates

    // Calculate product growth
    const productGrowth = 0; // You can implement if you have product creation dates

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate total items sold
    const totalItemsSold =
      orders?.reduce((sum, o) => sum + (o.items?.length || 0), 0) || 0;

    // Calculate conversion rate
    const conversionRate =
      users?.length > 0 ? ((totalOrders || 0) / users.length) * 100 : 0;

    return {
      revenue: { total: totalRevenue, growth: revenueGrowth },
      orders: { total: totalOrders, growth: orderGrowth },
      users: { total: totalUsers, growth: userGrowth },
      products: { total: totalProducts, growth: productGrowth },
      pendingOrders,
      avgOrderValue,
      thisMonthOrders: thisMonth.length,
      totalItemsSold,
      conversionRate,
      lowStock: inventorySummary?.lowStock || 0,
      outOfStock: inventorySummary?.outOfStock || 0,
    };
  }, [orders, users, products, orderStats, inventorySummary]);

  // ✅ Prepare chart data for revenue
  const revenueChartData = useMemo(() => {
    const labels = [];
    const revenues = [];

    // Get last 30 days (or 7/90 based on timeRange)
    let days = 30;
    if (timeRange === "7d") days = 7;
    if (timeRange === "90d") days = 90;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      );

      const dailyOrders =
        orders?.filter((o) => {
          if (!o.createdAt) return false;
          const d = new Date(o.createdAt);
          return d.toDateString() === date.toDateString();
        }) || [];

      const dailyRevenue = dailyOrders.reduce(
        (sum, o) => sum + (o.total || 0),
        0,
      );
      revenues.push(dailyRevenue);
    }

    return {
      labels,
      datasets: [
        {
          label: "Revenue (PKR)",
          data: revenues,
          borderColor: "#8B0000",
          backgroundColor: "rgba(139, 0, 0, 0.1)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#8B0000",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    };
  }, [orders, timeRange]);

  // ✅ Prepare chart data for order status
  const orderStatusData = useMemo(() => {
    const statuses = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders?.forEach((order) => {
      const status = order.status || "pending";
      if (statuses[status] !== undefined) {
        statuses[status]++;
      }
    });

    const hasData = Object.values(statuses).some((v) => v > 0);

    return {
      labels: Object.keys(statuses).map(
        (s) => s.charAt(0).toUpperCase() + s.slice(1),
      ),
      datasets: [
        {
          data: Object.values(statuses),
          backgroundColor: [
            "#F59E0B", // pending - yellow
            "#3B82F6", // confirmed - blue
            "#8B5CF6", // processing - purple
            "#06B6D4", // shipped - cyan
            "#10B981", // delivered - green
            "#EF4444", // cancelled - red
          ],
          borderColor: "#1A1A1A",
          borderWidth: 2,
        },
      ],
    };
  }, [orders]);

  // ✅ Prepare top products data
  const topProducts = useMemo(() => {
    const productSales = {};
    orders?.forEach((order) => {
      order.items?.forEach((item) => {
        const name = item.name || "Unknown Product";
        productSales[name] = (productSales[name] || 0) + (item.quantity || 1);
      });
    });

    return Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({ name, sales }));
  }, [orders]);

  // ✅ Chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#9CA3AF",
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "#1A1A1A",
        borderColor: "#2A2A2A",
        borderWidth: 1,
        titleColor: "#FFFFFF",
        bodyColor: "#9CA3AF",
        callbacks: {
          label: function (context) {
            return `PKR ${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#6B7280", maxTicksLimit: 10 },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: {
          color: "#6B7280",
          callback: function (value) {
            return `PKR ${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#9CA3AF",
          font: { size: 11 },
          padding: 20,
        },
      },
    },
    cutout: "70%",
  };

  // ✅ Check if data is loading
  useEffect(() => {
    if (
      !ordersLoading &&
      !isUsersLoading &&
      !productsLoading &&
      !inventoryLoading
    ) {
      setLoading(false);
    }
  }, [ordersLoading, isUsersLoading, productsLoading, inventoryLoading]);

  const handleRefresh = () => {
    setLoading(true);
    dispatch(getAllOrders({ page: 1, limit: 100 }));
    dispatch(getOrderStats());
    dispatch(getUsers());
    dispatch(getProducts({ page: 1, limit: 100 }));
    dispatch(getInventorySummary());
    toast.success("Refreshing analytics...");
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="management-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Real-time store performance and insights</p>
        </div>
        <button className="btn-refresh" onClick={handleRefresh}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <Row className="g-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="analytics-card">
            <Card.Body>
              <div className="analytics-card-header">
                <div className="analytics-icon revenue">
                  <DollarSign size={20} />
                </div>
                <span
                  className={`analytics-growth ${kpis.revenue.growth >= 0 ? "positive" : "negative"}`}
                >
                  {kpis.revenue.growth >= 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {Math.abs(kpis.revenue.growth).toFixed(1)}%
                </span>
              </div>
              <div className="analytics-value">
                PKR {kpis.revenue.total.toLocaleString()}
              </div>
              <div className="analytics-label">Total Revenue</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="analytics-card">
            <Card.Body>
              <div className="analytics-card-header">
                <div className="analytics-icon orders">
                  <ShoppingBag size={20} />
                </div>
                <span
                  className={`analytics-growth ${kpis.orders.growth >= 0 ? "positive" : "negative"}`}
                >
                  {kpis.orders.growth >= 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {Math.abs(kpis.orders.growth).toFixed(1)}%
                </span>
              </div>
              <div className="analytics-value">{kpis.orders.total}</div>
              <div className="analytics-label">Total Orders</div>
              <small className="analytics-sub">
                {kpis.thisMonthOrders} this month
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="analytics-card">
            <Card.Body>
              <div className="analytics-card-header">
                <div className="analytics-icon users">
                  <Users size={20} />
                </div>
                <span className="analytics-growth positive">
                  <TrendingUp size={14} />
                  {kpis.users.growth.toFixed(1)}%
                </span>
              </div>
              <div className="analytics-value">{kpis.users.total}</div>
              <div className="analytics-label">Total Users</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="analytics-card">
            <Card.Body>
              <div className="analytics-card-header">
                <div className="analytics-icon products">
                  <Package size={20} />
                </div>
                <span className="analytics-growth positive">
                  <TrendingUp size={14} />
                  {kpis.products.growth.toFixed(1)}%
                </span>
              </div>
              <div className="analytics-value">{kpis.products.total}</div>
              <div className="analytics-label">Total Products</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Secondary KPIs */}
      <Row className="g-4 mt-1">
        <Col xs={12} sm={6} lg={3}>
          <Card className="analytics-card small">
            <Card.Body>
              <div className="analytics-label">Pending Orders</div>
              <div className="analytics-value" style={{ color: "#F59E0B" }}>
                {kpis.pendingOrders}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="analytics-card small">
            <Card.Body>
              <div className="analytics-label">Avg. Order Value</div>
              <div className="analytics-value" style={{ color: "#D4AF37" }}>
                PKR {kpis.avgOrderValue.toFixed(0)}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="analytics-card small">
            <Card.Body>
              <div className="analytics-label">Products Sold</div>
              <div className="analytics-value" style={{ color: "#3B82F6" }}>
                {kpis.totalItemsSold}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="analytics-card small">
            <Card.Body>
              <div className="analytics-label">Conversion Rate</div>
              <div className="analytics-value" style={{ color: "#10B981" }}>
                {kpis.conversionRate.toFixed(1)}%
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Low Stock & Out of Stock Alert */}
      {(kpis.lowStock > 0 || kpis.outOfStock > 0) && (
        <Row className="g-4 mt-1">
          <Col xs={12}>
            <Card className="analytics-card stock-alert">
              <Card.Body>
                <div className="stock-alert-content">
                  <div className="stock-alert-icon">
                    <AlertCircle size={24} />
                  </div>
                  <div className="stock-alert-info">
                    <span className="stock-alert-title">Stock Alert</span>
                    <span className="stock-alert-message">
                      {kpis.lowStock > 0 &&
                        `${kpis.lowStock} items are low on stock. `}
                      {kpis.outOfStock > 0 &&
                        `${kpis.outOfStock} items are out of stock.`}
                      <a href="/admin/inventory"> Go to Inventory →</a>
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Charts Row */}
      <Row className="g-4 mt-2">
        <Col lg={8}>
          <Card className="analytics-chart-card">
            <Card.Body>
              <div className="chart-header">
                <h6>
                  Revenue Overview (Last{" "}
                  {timeRange === "7d" ? "7" : timeRange === "90d" ? "90" : "30"}{" "}
                  Days)
                </h6>
                <div className="chart-controls">
                  <button
                    className={`chart-btn ${timeRange === "7d" ? "active" : ""}`}
                    onClick={() => setTimeRange("7d")}
                  >
                    7D
                  </button>
                  <button
                    className={`chart-btn ${timeRange === "30d" ? "active" : ""}`}
                    onClick={() => setTimeRange("30d")}
                  >
                    30D
                  </button>
                  <button
                    className={`chart-btn ${timeRange === "90d" ? "active" : ""}`}
                    onClick={() => setTimeRange("90d")}
                  >
                    90D
                  </button>
                </div>
              </div>
              <div className="chart-container">
                <Line
                  data={revenueChartData}
                  options={lineOptions}
                  height={250}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="analytics-chart-card">
            <Card.Body>
              <h6>Order Status Distribution</h6>
              <div className="chart-container" style={{ height: "250px" }}>
                <Doughnut data={orderStatusData} options={doughnutOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row className="g-4 mt-2">
        <Col lg={6}>
          <Card className="analytics-chart-card">
            <Card.Body>
              <h6>Top Selling Products</h6>
              <div className="top-products">
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <div key={index} className="top-product-item">
                      <span className={`top-product-rank rank-${index + 1}`}>
                        {index + 1}
                      </span>
                      <span className="top-product-name">{product.name}</span>
                      <span className="top-product-sales">
                        {product.sales} sales
                      </span>
                      <div className="top-product-bar">
                        <div
                          className="top-product-bar-fill"
                          style={{
                            width: `${(product.sales / topProducts[0]?.sales) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-secondary py-4">
                    No products sold yet
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="analytics-chart-card">
            <Card.Body>
              <h6>Quick Stats</h6>
              <Row className="g-3">
                <Col xs={6}>
                  <div className="quick-stat">
                    <div className="quick-stat-icon">
                      <ShoppingBag size={20} />
                    </div>
                    <div className="quick-stat-info">
                      <span className="quick-stat-value">
                        {kpis.orders.total}
                      </span>
                      <span className="quick-stat-label">Total Orders</span>
                    </div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="quick-stat">
                    <div
                      className="quick-stat-icon"
                      style={{
                        background: "rgba(212, 175, 55, 0.1)",
                        color: "#D4AF37",
                      }}
                    >
                      <DollarSign size={20} />
                    </div>
                    <div className="quick-stat-info">
                      <span className="quick-stat-value">
                        PKR {kpis.revenue.total.toLocaleString()}
                      </span>
                      <span className="quick-stat-label">Total Revenue</span>
                    </div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="quick-stat">
                    <div
                      className="quick-stat-icon"
                      style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "#10B981",
                      }}
                    >
                      <Users size={20} />
                    </div>
                    <div className="quick-stat-info">
                      <span className="quick-stat-value">
                        {kpis.users.total}
                      </span>
                      <span className="quick-stat-label">Total Users</span>
                    </div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="quick-stat">
                    <div
                      className="quick-stat-icon"
                      style={{
                        background: "rgba(59, 130, 246, 0.1)",
                        color: "#3B82F6",
                      }}
                    >
                      <Package size={20} />
                    </div>
                    <div className="quick-stat-info">
                      <span className="quick-stat-value">
                        {kpis.products.total}
                      </span>
                      <span className="quick-stat-label">Total Products</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;

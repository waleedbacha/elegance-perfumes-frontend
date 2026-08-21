import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Badge,
  Modal,
  Alert,
} from "react-bootstrap";
import {
  Eye,
  Search,
  Filter,
  ChevronDown,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileText,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  ChevronUp,
  Zap,
  Award,
  FileSpreadsheet,
  X,
  History,
  User,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrders,
  updateOrderStatus,
  generateInvoice,
  getOrderStats,
  getOrderByIdAdmin,
  confirmPayment, // ✅ Add this
  markPaymentFailed, // ✅ Add this
} from "../../redux/slices/orderSlice";
import toast from "react-hot-toast";
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
import { Bar, Line, Doughnut } from "react-chartjs-2";
import * as XLSX from "xlsx";
import "../../styles/pages/OrderManagement.css";

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

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, pagination, stats } = useSelector(
    (state) => state.orders,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [isExporting, setIsExporting] = useState(false);

  // ✅ Bulk Actions State
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkAction, setBulkAction] = useState("status");
  const [bulkStatus, setBulkStatus] = useState("");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // ✅ Order Timeline State
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // OrderManagement.jsx - Add these new state variables and functions

  // Add to existing state declarations
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  // ✅ Fetch ALL orders using admin endpoint
  const fetchOrders = (
    page = currentPage,
    status = statusFilter,
    search = searchTerm,
    itemsPerPage = limit,
  ) => {
    const params = {
      page,
      limit: itemsPerPage,
      ...(status && { status }),
      ...(search && { search }),
    };
    dispatch(getAllOrders(params));
  };

  useEffect(() => {
    fetchOrders(currentPage, statusFilter, searchTerm, limit);
    dispatch(getOrderStats());
  }, [currentPage, statusFilter, limit]);

  // ✅ Reset selection when filters change
  useEffect(() => {
    setSelectedOrders([]);
    setSelectAll(false);
  }, [statusFilter, searchTerm, currentPage]);

  const handleStatusUpdate = (orderId, status) => {
    if (window.confirm(`Change order status to ${status}?`)) {
      dispatch(updateOrderStatus({ id: orderId, status }));
      toast.success(`Order status updated to ${status}`);
      fetchOrders(currentPage, statusFilter, searchTerm, limit);
      dispatch(getOrderStats());
    }
  };

  const handleRefresh = () => {
    fetchOrders(currentPage, statusFilter, searchTerm, limit);
    dispatch(getOrderStats());
    toast.success("Refreshing orders...");
  };

  // ✅ Handle invoice download
  const handleDownloadInvoice = async (order) => {
    setIsGeneratingInvoice(true);
    try {
      let invoiceUrl = order.invoiceUrl;
      if (!invoiceUrl) {
        const result = await dispatch(generateInvoice(order._id)).unwrap();
        invoiceUrl = result;
        const updatedOrder = { ...order, invoiceUrl };
        setSelectedOrder(updatedOrder);
      }
      if (invoiceUrl) {
        window.open(invoiceUrl, "_blank");
        toast.success("Invoice opened in new tab");
      } else {
        toast.error("Failed to generate invoice");
      }
    } catch (error) {
      toast.error(error || "Failed to generate invoice");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  // ✅ EXPORT TO EXCEL - Complete Data
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      let allOrders = orders;

      if (pagination?.total > orders?.length) {
        const result = await dispatch(
          getAllOrders({
            page: 1,
            limit: pagination?.total || 1000,
            status: statusFilter || undefined,
            search: searchTerm || undefined,
          }),
        ).unwrap();
        allOrders = result.orders || orders;
      }

      const exportData =
        allOrders?.map((order) => ({
          "Order #": order.orderNumber || "N/A",
          "Customer Name": order.customer?.name || order.user?.name || "N/A",
          "Customer Email": order.customer?.email || order.user?.email || "N/A",
          "Customer Phone": order.customer?.phone || order.user?.phone || "N/A",
          "Order Date": order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "N/A",
          "Total (PKR)": order.total || 0,
          "Subtotal (PKR)": order.subtotal || 0,
          "Discount (PKR)": order.discount || 0,
          "Shipping (PKR)": order.shipping || 0,
          Status: order.status || "pending",
          "Payment Status": order.paymentStatus || "pending",
          "Payment Method": order.paymentMethod || "N/A",
          "Items Count": order.items?.length || 0,
          "Shipping City": order.shippingAddress?.city || "N/A",
          "Shipping Area": order.shippingAddress?.area || "N/A",
          "Shipping Address":
            `${order.shippingAddress?.street || ""} ${order.shippingAddress?.area || ""}`.trim() ||
            "N/A",
          "Coupon Code": order.coupon?.code || "N/A",
          "Tracking Number": order.tracking?.number || "N/A",
          "Tracking Provider": order.tracking?.provider || "N/A",
        })) || [];

      const summaryRow = {
        "Order #": "--- SUMMARY ---",
        "Customer Name": "",
        "Customer Email": "",
        "Customer Phone": "",
        "Order Date": "",
        "Total (PKR)": exportData.reduce(
          (sum, row) => sum + (row["Total (PKR)"] || 0),
          0,
        ),
        "Subtotal (PKR)": exportData.reduce(
          (sum, row) => sum + (row["Subtotal (PKR)"] || 0),
          0,
        ),
        "Discount (PKR)": exportData.reduce(
          (sum, row) => sum + (row["Discount (PKR)"] || 0),
          0,
        ),
        "Shipping (PKR)": exportData.reduce(
          (sum, row) => sum + (row["Shipping (PKR)"] || 0),
          0,
        ),
        Status: "",
        "Payment Status": "",
        "Payment Method": "",
        "Items Count": exportData.reduce(
          (sum, row) => sum + (row["Items Count"] || 0),
          0,
        ),
        "Shipping City": "",
        "Shipping Area": "",
        "Shipping Address": "",
        "Coupon Code": "",
        "Tracking Number": "",
        "Tracking Provider": "",
      };

      const finalData = [...exportData, summaryRow];
      const ws = XLSX.utils.json_to_sheet(finalData);

      const colWidths = [
        { wch: 18 },
        { wch: 22 },
        { wch: 28 },
        { wch: 18 },
        { wch: 20 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 14 },
        { wch: 16 },
        { wch: 16 },
        { wch: 12 },
        { wch: 18 },
        { wch: 18 },
        { wch: 30 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
      ];
      ws["!cols"] = colWidths;

      if (!ws["!rows"]) ws["!rows"] = [];
      ws["!rows"][finalData.length - 1] = {
        hpx: 25,
        hidden: false,
        style: { font: { bold: true }, fill: { fgColor: { rgb: "D4AF37" } } },
      };

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orders");

      const itemsData = [];
      allOrders?.forEach((order) => {
        order.items?.forEach((item) => {
          itemsData.push({
            "Order #": order.orderNumber || "N/A",
            Product: item.name || "N/A",
            Brand: item.brand || "N/A",
            Size: item.size || "N/A",
            Quantity: item.quantity || 0,
            "Price (PKR)": item.price || 0,
            "Discount (PKR)": item.discount || 0,
            "Total (PKR)": item.total || 0,
          });
        });
      });

      if (itemsData.length > 0) {
        const wsItems = XLSX.utils.json_to_sheet(itemsData);
        wsItems["!cols"] = [
          { wch: 18 },
          { wch: 25 },
          { wch: 18 },
          { wch: 12 },
          { wch: 10 },
          { wch: 16 },
          { wch: 16 },
          { wch: 16 },
        ];
        XLSX.utils.book_append_sheet(wb, wsItems, "Order Items");
      }

      const fileName = `Orders_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Exported ${exportData.length} orders to Excel!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export orders. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Add these functions after handleExportExcel

  // ✅ Handle Payment Confirmation
  const handleConfirmPayment = async (order) => {
    setPaymentOrder(order);
    setPaymentAmount(order.total?.toString() || "");
    setPaymentNote("");
    setShowPaymentModal(true);
  };

  // ✅ Submit Payment Confirmation
  const submitPaymentConfirmation = async () => {
    if (!paymentOrder) return;

    setIsConfirmingPayment(true);
    try {
      const result = await dispatch(
        confirmPayment({
          id: paymentOrder._id,
          amount: parseFloat(paymentAmount) || paymentOrder.total,
          note: paymentNote || "Payment confirmed manually",
          paymentMethod: paymentOrder.paymentMethod,
        }),
      ).unwrap();

      toast.success(`Payment confirmed for order #${paymentOrder.orderNumber}`);
      setShowPaymentModal(false);
      setPaymentOrder(null);
      fetchOrders(currentPage, statusFilter, searchTerm, limit);
      dispatch(getOrderStats());
    } catch (error) {
      toast.error(error || "Failed to confirm payment");
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  // ✅ Handle Mark Payment Failed
  const handleMarkPaymentFailed = async (order) => {
    const reason = prompt(
      "Enter reason for payment failure (optional):",
      "Customer didn't pay",
    );
    if (reason === null) return; // User cancelled

    try {
      await dispatch(
        markPaymentFailed({
          id: order._id,
          reason: reason || "Payment failed",
        }),
      ).unwrap();
      toast.success(`Payment marked as failed for order #${order.orderNumber}`);
      fetchOrders(currentPage, statusFilter, searchTerm, limit);
      dispatch(getOrderStats());
    } catch (error) {
      toast.error(error || "Failed to mark payment as failed");
    }
  };

  // ✅ BULK ACTIONS HANDLERS
  // Handle individual order selection
  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
    // Reset selectAll if manually unchecking
    if (selectAll) {
      setSelectAll(false);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      const allOrderIds = filteredOrders?.map((order) => order._id) || [];
      setSelectedOrders(allOrderIds);
    }
    setSelectAll(!selectAll);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedOrders([]);
    setSelectAll(false);
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) {
      toast.error("Please select a status");
      return;
    }

    if (selectedOrders.length === 0) {
      toast.error("No orders selected");
      return;
    }

    setIsBulkProcessing(true);
    try {
      const promises = selectedOrders.map((orderId) =>
        dispatch(
          updateOrderStatus({ id: orderId, status: bulkStatus }),
        ).unwrap(),
      );

      await Promise.all(promises);

      toast.success(`Updated ${selectedOrders.length} orders to ${bulkStatus}`);
      setShowBulkActionModal(false);
      setSelectedOrders([]);
      setSelectAll(false);
      setBulkStatus("");
      fetchOrders(currentPage, statusFilter, searchTerm, limit);
      dispatch(getOrderStats());
    } catch (error) {
      toast.error(error || "Failed to update orders");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Handle bulk export
  const handleBulkExport = async () => {
    if (selectedOrders.length === 0) {
      toast.error("No orders selected");
      return;
    }

    setIsBulkProcessing(true);
    try {
      const selectedOrdersData =
        orders?.filter((order) => selectedOrders.includes(order._id)) || [];

      const exportData = selectedOrdersData.map((order) => ({
        "Order #": order.orderNumber || "N/A",
        "Customer Name": order.customer?.name || order.user?.name || "N/A",
        "Customer Email": order.customer?.email || order.user?.email || "N/A",
        "Customer Phone": order.customer?.phone || order.user?.phone || "N/A",
        "Order Date": order.createdAt
          ? new Date(order.createdAt).toLocaleString()
          : "N/A",
        "Total (PKR)": order.total || 0,
        "Subtotal (PKR)": order.subtotal || 0,
        "Discount (PKR)": order.discount || 0,
        "Shipping (PKR)": order.shipping || 0,
        Status: order.status || "pending",
        "Payment Status": order.paymentStatus || "pending",
        "Payment Method": order.paymentMethod || "N/A",
        "Items Count": order.items?.length || 0,
        "Shipping City": order.shippingAddress?.city || "N/A",
        "Shipping Area": order.shippingAddress?.area || "N/A",
        "Shipping Address":
          `${order.shippingAddress?.street || ""} ${order.shippingAddress?.area || ""}`.trim() ||
          "N/A",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Selected Orders");

      ws["!cols"] = [
        { wch: 18 },
        { wch: 22 },
        { wch: 28 },
        { wch: 18 },
        { wch: 20 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 14 },
        { wch: 16 },
        { wch: 16 },
        { wch: 12 },
        { wch: 18 },
        { wch: 18 },
        { wch: 30 },
      ];

      const fileName = `Selected_Orders_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(`Exported ${exportData.length} selected orders!`);
      setSelectedOrders([]);
      setSelectAll(false);
      setShowBulkActionModal(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export selected orders");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Open bulk action modal
  const openBulkActionModal = (action) => {
    if (selectedOrders.length === 0) {
      toast.error("Please select at least one order");
      return;
    }
    setBulkAction(action);
    setShowBulkActionModal(true);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > (pagination?.pages || 1)) return;
    setCurrentPage(page);
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const getPaginationRange = () => {
    const totalPages = pagination?.pages || 1;
    const current = currentPage;
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    return { start, end };
  };

  const { start, end } = getPaginationRange();
  const totalPages = pagination?.pages || 1;

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // ✅ Calculate Analytics Data using stats from Redux (ACCURATE)
  const analyticsData = useMemo(() => {
    const totalOrders = stats?.totalOrders || 0;
    const totalRevenue = stats?.totalRevenue || 0;
    const pendingOrders = stats?.pendingOrders || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statusDistribution = {
      pending:
        stats?.statusCounts?.pending ||
        orders?.filter((o) => o.status === "pending").length ||
        0,
      confirmed:
        stats?.statusCounts?.confirmed ||
        orders?.filter((o) => o.status === "confirmed").length ||
        0,
      processing:
        stats?.statusCounts?.processing ||
        orders?.filter((o) => o.status === "processing").length ||
        0,
      packed:
        stats?.statusCounts?.packed ||
        orders?.filter((o) => o.status === "packed").length ||
        0,
      shipped:
        stats?.statusCounts?.shipped ||
        orders?.filter((o) => o.status === "shipped").length ||
        0,
      delivered:
        stats?.statusCounts?.delivered ||
        orders?.filter((o) => o.status === "delivered").length ||
        0,
      cancelled:
        stats?.statusCounts?.cancelled ||
        orders?.filter((o) => o.status === "cancelled").length ||
        0,
    };

    const revenueGrowth = stats?.revenueGrowth || 0;
    const orderGrowth = stats?.orderGrowth || 0;
    const thisMonthOrders = stats?.thisMonthOrders || 0;
    const allOrders = orders || [];

    const labels = [];
    const revenues = [];
    const orderCounts = [];
    const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      );

      const dailyOrders = allOrders.filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d.toDateString() === date.toDateString();
      });

      const dailyRevenue = dailyOrders.reduce((s, o) => s + (o.total || 0), 0);
      revenues.push(dailyRevenue);
      orderCounts.push(dailyOrders.length);
    }

    const deliveredOrders = statusDistribution.delivered || 0;
    const cancelledOrders = statusDistribution.cancelled || 0;
    const processingOrders =
      (statusDistribution.processing || 0) +
      (statusDistribution.confirmed || 0);

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      processingOrders,
      avgOrderValue,
      revenueGrowth,
      orderGrowth,
      statusDistribution,
      revenueChartData: { labels, revenues },
      orderChartData: { labels, orderCounts },
      thisMonthOrders,
    };
  }, [orders, stats, timeRange]);

  // ✅ Chart configurations
  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#9CA3AF", font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: "#1A1A1A",
        borderColor: "#2A2A2A",
        borderWidth: 1,
        titleColor: "#FFFFFF",
        bodyColor: "#9CA3AF",
        callbacks: {
          label: function (context) {
            if (context.dataset.label?.includes("Revenue")) {
              return `PKR ${context.parsed.y.toLocaleString()}`;
            }
            return `${context.parsed.y} orders`;
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
      y1: {
        position: "right",
        grid: { display: false },
        ticks: {
          color: "#6B7280",
          callback: function (value) {
            return value;
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
        labels: { color: "#9CA3AF", font: { size: 10 }, padding: 12 },
      },
    },
    cutout: "65%",
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        variant: "warning",
        icon: <Clock size={14} />,
        label: "Pending",
      },
      confirmed: {
        variant: "info",
        icon: <AlertCircle size={14} />,
        label: "Confirmed",
      },
      processing: {
        variant: "primary",
        icon: <Package size={14} />,
        label: "Processing",
      },
      packed: {
        variant: "secondary",
        icon: <Package size={14} />,
        label: "Packed",
      },
      shipped: { variant: "info", icon: <Truck size={14} />, label: "Shipped" },
      "out-for-delivery": {
        variant: "warning",
        icon: <Truck size={14} />,
        label: "Out for Delivery",
      },
      delivered: {
        variant: "success",
        icon: <CheckCircle size={14} />,
        label: "Delivered",
      },
      cancelled: {
        variant: "danger",
        icon: <XCircle size={14} />,
        label: "Cancelled",
      },
    };
    const info = statusMap[status] || statusMap.pending;
    return (
      <Badge bg={info.variant} className="status-badge">
        {info.icon}
        {info.label}
      </Badge>
    );
  };

  const getPaymentBadge = (status) => {
    const statusMap = {
      pending: { variant: "warning", label: "Pending" },
      paid: { variant: "success", label: "Paid" },
      failed: { variant: "danger", label: "Failed" },
      refunded: { variant: "secondary", label: "Refunded" },
    };
    const info = statusMap[status] || statusMap.pending;
    return <Badge bg={info.variant}>{info.label}</Badge>;
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "0";
    return amount.toLocaleString();
  };

  // ✅ Fetch Order History/Timeline
  const fetchOrderHistory = async (orderId) => {
    setIsLoadingHistory(true);
    try {
      const result = await dispatch(getOrderByIdAdmin(orderId)).unwrap();
      // Get status history from the order
      const history = result.statusHistory || [];

      // If no history, add a default entry
      if (history.length === 0) {
        history.push({
          status: result.status || "pending",
          timestamp: result.createdAt || new Date(),
          note: "Order created",
          updatedBy: result.user?._id || null,
          performedByName: result.customer?.name || "System",
        });
      }

      setOrderHistory(history);
      setShowTimelineModal(true);
    } catch (error) {
      toast.error("Failed to load order history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    const statusMap = {
      pending: { icon: <Clock size={16} />, color: "#F59E0B" },
      confirmed: { icon: <CheckCircle size={16} />, color: "#3B82F6" },
      processing: { icon: <Package size={16} />, color: "#8B5CF6" },
      packed: { icon: <Package size={16} />, color: "#06B6D4" },
      shipped: { icon: <Truck size={16} />, color: "#10B981" },
      "out-for-delivery": { icon: <Truck size={16} />, color: "#F59E0B" },
      delivered: { icon: <CheckCircle size={16} />, color: "#34D399" },
      cancelled: { icon: <XCircle size={16} />, color: "#EF4444" },
    };
    return statusMap[status] || statusMap.pending;
  };

  // ✅ KPI Cards Configuration
  const kpiCards = [
    {
      title: "Total Revenue",
      value: `PKR ${formatCurrency(analyticsData.totalRevenue)}`,
      subtitle: `${analyticsData.revenueGrowth.toFixed(1)}% from last month`,
      icon: <DollarSign size={20} />,
      color: "#D4AF37",
      bg: "rgba(212,175,55,0.12)",
      trend: analyticsData.revenueGrowth >= 0 ? "up" : "down",
    },
    {
      title: "Total Orders",
      value: analyticsData.totalOrders,
      subtitle: `${analyticsData.orderGrowth.toFixed(1)}% from last month`,
      icon: <ShoppingBag size={20} />,
      color: "#8B0000",
      bg: "rgba(139,0,0,0.12)",
      trend: analyticsData.orderGrowth >= 0 ? "up" : "down",
    },
    {
      title: "Pending Orders",
      value: analyticsData.pendingOrders,
      subtitle: "Awaiting action",
      icon: <Clock size={20} />,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.12)",
      trend: analyticsData.pendingOrders > 0 ? "warning" : "up",
    },
    {
      title: "Avg. Order Value",
      value: `PKR ${formatCurrency(Math.round(analyticsData.avgOrderValue))}`,
      subtitle: `${analyticsData.thisMonthOrders} orders this month`,
      icon: <TrendingUp size={20} />,
      color: "#10B981",
      bg: "rgba(16,185,129,0.12)",
      trend: "up",
    },
  ];

  if (isLoading && !orders?.length) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="order-management">
      <div className="management-header">
        <div>
          <h1>Orders</h1>
          <p>Manage customer orders</p>
          <span className="order-count">
            {pagination?.total || 0} orders found
          </span>
        </div>
        <div className="header-actions">
          <div className="export-buttons">
            <button
              className="btn-export-excel"
              onClick={handleExportExcel}
              disabled={isExporting || !orders?.length}
            >
              {isExporting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet size={18} />
                  Excel
                </>
              )}
            </button>
          </div>
          <button
            className="btn-toggle-analytics"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 size={18} />
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
            <ChevronUp size={16} className={showAnalytics ? "rotate" : ""} />
          </button>
          <Button
            variant="outline-secondary"
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn-refresh"
          >
            <RefreshCw size={18} className={isLoading ? "spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Section */}
      <div className={`analytics-section ${showAnalytics ? "open" : "closed"}`}>
        <Row className="g-3 mb-4">
          {kpiCards.map((kpi, index) => (
            <Col key={index} xs={12} sm={6} lg={3}>
              <div className="kpi-card">
                <div className="kpi-card-content">
                  <div className="kpi-icon-wrapper">
                    <div
                      className="kpi-icon"
                      style={{ background: kpi.bg, color: kpi.color }}
                    >
                      {kpi.icon}
                    </div>
                    <span className={`kpi-trend ${kpi.trend}`}>
                      {kpi.trend === "up" && <TrendingUp size={12} />}
                      {kpi.trend === "down" && <TrendingDown size={12} />}
                      {kpi.trend === "warning" && <AlertCircle size={12} />}
                    </span>
                  </div>
                  <div className="kpi-info">
                    <span className="kpi-value">{kpi.value}</span>
                    <span className="kpi-title">{kpi.title}</span>
                    <span className="kpi-subtitle">{kpi.subtitle}</span>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <Row className="g-3 mb-3">
          <Col lg={8}>
            <div className="analytics-chart-card">
              <div className="chart-header">
                <div className="chart-title">
                  <Activity size={18} />
                  <h6>Revenue & Orders Overview</h6>
                </div>
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
                  data={{
                    labels: analyticsData.revenueChartData.labels,
                    datasets: [
                      {
                        label: "Revenue (PKR)",
                        data: analyticsData.revenueChartData.revenues,
                        borderColor: "#D4AF37",
                        backgroundColor: "rgba(212, 175, 55, 0.08)",
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: "#D4AF37",
                        pointBorderColor: "#fff",
                        pointBorderWidth: 1,
                        yAxisID: "y",
                      },
                      {
                        label: "Orders",
                        data: analyticsData.orderChartData.orderCounts,
                        borderColor: "#8B0000",
                        backgroundColor: "rgba(139, 0, 0, 0.08)",
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: "#8B0000",
                        pointBorderColor: "#fff",
                        pointBorderWidth: 1,
                        yAxisID: "y1",
                      },
                    ],
                  }}
                  options={revenueChartOptions}
                  height={200}
                />
              </div>
            </div>
          </Col>
          <Col lg={4}>
            <div className="analytics-chart-card">
              <div className="chart-header">
                <div className="chart-title">
                  <PieChart size={18} />
                  <h6>Order Status</h6>
                </div>
              </div>
              <div className="chart-container">
                <Doughnut
                  data={{
                    labels: Object.keys(analyticsData.statusDistribution).map(
                      (s) => s.charAt(0).toUpperCase() + s.slice(1),
                    ),
                    datasets: [
                      {
                        data: Object.values(analyticsData.statusDistribution),
                        backgroundColor: [
                          "#F59E0B",
                          "#3B82F6",
                          "#8B5CF6",
                          "#06B6D4",
                          "#10B981",
                          "#34D399",
                          "#EF4444",
                        ],
                        borderColor: "#1A1A1A",
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={doughnutOptions}
                  height={200}
                />
              </div>
            </div>
          </Col>
        </Row>

        <Row className="g-3 mb-3">
          <Col xs={6} md={3}>
            <div className="mini-stat-card">
              <div className="mini-stat-icon" style={{ color: "#8B0000" }}>
                <Package size={16} />
              </div>
              <div className="mini-stat-info">
                <span className="mini-stat-value">
                  {analyticsData.processingOrders}
                </span>
                <span className="mini-stat-label">Processing</span>
              </div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="mini-stat-card">
              <div className="mini-stat-icon" style={{ color: "#10B981" }}>
                <CheckCircle size={16} />
              </div>
              <div className="mini-stat-info">
                <span className="mini-stat-value">
                  {analyticsData.deliveredOrders}
                </span>
                <span className="mini-stat-label">Delivered</span>
              </div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="mini-stat-card">
              <div className="mini-stat-icon" style={{ color: "#EF4444" }}>
                <XCircle size={16} />
              </div>
              <div className="mini-stat-info">
                <span className="mini-stat-value">
                  {analyticsData.cancelledOrders}
                </span>
                <span className="mini-stat-label">Cancelled</span>
              </div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="mini-stat-card">
              <div className="mini-stat-icon" style={{ color: "#D4AF37" }}>
                <Award size={16} />
              </div>
              <div className="mini-stat-info">
                <span className="mini-stat-value">
                  {analyticsData.thisMonthOrders}
                </span>
                <span className="mini-stat-label">This Month</span>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Management Controls */}
      <div className="management-controls">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
              fetchOrders(1, statusFilter, e.target.value, limit);
            }}
            className="search-input"
          />
        </div>
        <div className="filter-wrapper">
          <Filter size={18} />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
              fetchOrders(1, e.target.value, searchTerm, limit);
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="out-for-delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="items-per-page">
          <span>Show:</span>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="limit-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* ✅ Bulk Actions Toolbar */}
      {selectedOrders.length > 0 && (
        <div className="bulk-actions-toolbar">
          <div className="bulk-actions-info">
            <span className="bulk-selected-count">
              {selectedOrders.length} order
              {selectedOrders.length > 1 ? "s" : ""} selected
            </span>
            <button className="bulk-clear-btn" onClick={clearSelection}>
              <X size={16} />
              Clear
            </button>
          </div>
          <div className="bulk-actions-buttons">
            <select
              className="bulk-status-select"
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
            >
              <option value="">Change Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="out-for-delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              className="bulk-apply-btn"
              onClick={() => openBulkActionModal("status")}
              disabled={!bulkStatus}
            >
              Apply Status
            </button>
            <button
              className="bulk-export-btn"
              onClick={() => openBulkActionModal("export")}
            >
              <FileSpreadsheet size={16} />
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <Card className="table-card">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="bulk-checkbox"
                      disabled={!filteredOrders?.length}
                    />
                  </th>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders?.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className={
                        selectedOrders.includes(order._id) ? "selected-row" : ""
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => handleSelectOrder(order._id)}
                          className="bulk-checkbox"
                        />
                      </td>
                      <td className="order-number">{order.orderNumber}</td>
                      <td>{order.customer?.name || "Unknown"}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>PKR {order.total?.toLocaleString()}</td>
                      <td>{getPaymentBadge(order.paymentStatus)}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <button
                            className="action-btn view"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailModal(true);
                            }}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {/* History/Timeline Button */}
                          <button
                            className="action-btn history"
                            onClick={() => fetchOrderHistory(order._id)}
                            title="View Order History"
                          >
                            <History size={16} />
                          </button>

                          <button
                            className="action-btn download"
                            onClick={() => handleDownloadInvoice(order)}
                            title="Download Invoice"
                            disabled={isGeneratingInvoice}
                          >
                            <Download size={16} />
                          </button>

                          {/* ✅ Payment Action Buttons - Only show for pending payments */}
                          {order.paymentStatus === "pending" && (
                            <>
                              <button
                                className="action-btn confirm-payment"
                                onClick={() => handleConfirmPayment(order)}
                                title="Confirm Payment"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                className="action-btn mark-failed"
                                onClick={() => handleMarkPaymentFailed(order)}
                                title="Mark Payment Failed"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}

                          <select
                            className="status-select"
                            value={order.status}
                            onChange={(e) =>
                              handleStatusUpdate(order._id, e.target.value)
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="out-for-delivery">
                              Out for Delivery
                            </option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-secondary">
                      {searchTerm
                        ? "No orders match your search"
                        : "No orders found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
            <div className="pagination-wrapper">
              <div className="pagination-info">
                Showing {(currentPage - 1) * limit + 1} -{" "}
                {Math.min(currentPage * limit, pagination.total)} of{" "}
                {pagination.total} orders
              </div>
              <div className="pagination-controls">
                <button
                  className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  title="First page"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="pagination-pages">
                  {start > 1 && (
                    <>
                      <button
                        className="pagination-page-btn"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </button>
                      {start > 2 && (
                        <span className="pagination-ellipsis">…</span>
                      )}
                    </>
                  )}
                  {Array.from(
                    { length: end - start + 1 },
                    (_, i) => start + i,
                  ).map((page) => (
                    <button
                      key={page}
                      className={`pagination-page-btn ${page === currentPage ? "active" : ""}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  {end < totalPages && (
                    <>
                      {end < totalPages - 1 && (
                        <span className="pagination-ellipsis">…</span>
                      )}
                      <button
                        className="pagination-page-btn"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  className={`pagination-btn ${currentPage === totalPages ? "disabled" : ""}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  className={`pagination-btn ${currentPage === totalPages ? "disabled" : ""}`}
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Last page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ✅ Payment Confirmation Modal */}
      <Modal
        show={showPaymentModal}
        onHide={() => {
          setShowPaymentModal(false);
          setPaymentOrder(null);
          setPaymentAmount("");
          setPaymentNote("");
        }}
        className="admin-modal payment-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="payment-modal-title">
              <DollarSign size={20} />
              Confirm Payment
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {paymentOrder && (
            <>
              <div className="payment-order-info">
                <p>
                  <strong>Order #:</strong> {paymentOrder.orderNumber}
                </p>
                <p>
                  <strong>Customer:</strong>{" "}
                  {paymentOrder.customer?.name || "Unknown"}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  <Badge bg="info">
                    {paymentOrder.paymentMethod?.toUpperCase() || "COD"}
                  </Badge>
                </p>
                <p>
                  <strong>Total Amount:</strong>{" "}
                  <span style={{ color: "#D4AF37", fontWeight: "bold" }}>
                    PKR {paymentOrder.total?.toLocaleString()}
                  </span>
                </p>
              </div>

              <hr />

              <div className="payment-confirmation-form">
                <Form.Group className="mb-3">
                  <Form.Label>Amount Collected</Form.Label>
                  <Form.Control
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount collected"
                    min="0"
                    step="1"
                  />
                  <Form.Text className="text-muted">
                    Leave empty to use the full order amount
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirmation Note</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Add a note about this payment..."
                  />
                  <Form.Text className="text-muted">
                    Optional: Add any relevant notes about the payment
                  </Form.Text>
                </Form.Group>

                <div className="payment-confirmation-info">
                  <Alert variant="warning">
                    <Alert.Heading>Confirm Payment</Alert.Heading>
                    <p>
                      By confirming this payment, you are verifying that cash
                      was collected for this COD order. This action will:
                    </p>
                    <ul className="mb-0">
                      <li>
                        Mark the order as <strong>Paid</strong>
                      </li>
                      <li>Send a confirmation notification to the customer</li>
                      <li>Update the order analytics</li>
                    </ul>
                  </Alert>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowPaymentModal(false);
              setPaymentOrder(null);
              setPaymentAmount("");
              setPaymentNote("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={submitPaymentConfirmation}
            disabled={isConfirmingPayment}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            {isConfirmingPayment ? (
              <>
                <span className="spinner-border spinner-border-sm" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Confirm Payment
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Bulk Action Confirmation Modal */}
      <Modal
        show={showBulkActionModal}
        onHide={() => {
          setShowBulkActionModal(false);
          setBulkStatus("");
        }}
        className="admin-modal bulk-action-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {bulkAction === "status" ? "Bulk Status Update" : "Bulk Export"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bulkAction === "status" ? (
            <>
              <p className="bulk-action-info">
                You are about to update <strong>{selectedOrders.length}</strong>{" "}
                orders to:
              </p>
              <div className="bulk-status-preview">
                <span className="bulk-status-label">Status:</span>
                <span className="bulk-status-value">
                  {bulkStatus?.toUpperCase()}
                </span>
              </div>
              <p className="bulk-action-warning">
                ⚠️ This action cannot be undone. Are you sure you want to
                proceed?
              </p>
            </>
          ) : (
            <>
              <p className="bulk-action-info">
                You are about to export <strong>{selectedOrders.length}</strong>{" "}
                selected orders.
              </p>
              <div className="bulk-export-preview">
                <p>📊 The export will include:</p>
                <ul>
                  <li>Order details (Order #, Customer, Date, Total)</li>
                  <li>Customer information (Name, Email, Phone)</li>
                  <li>Shipping details (Address, City, Area)</li>
                  <li>Payment information (Status, Method)</li>
                  <li>Order status and items count</li>
                </ul>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowBulkActionModal(false);
              setBulkStatus("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={
              bulkAction === "status"
                ? handleBulkStatusUpdate
                : handleBulkExport
            }
            disabled={isBulkProcessing}
          >
            {isBulkProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Processing...
              </>
            ) : bulkAction === "status" ? (
              "Update Status"
            ) : (
              "Export Orders"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Order Timeline/History Modal */}
      <Modal
        show={showTimelineModal}
        onHide={() => {
          setShowTimelineModal(false);
          setOrderHistory([]);
        }}
        size="lg"
        className="admin-modal timeline-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="timeline-modal-title">
              <History size={20} />
              Order Timeline
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoadingHistory ? (
            <div className="timeline-loading">
              <div className="spinner-border spinner-border-sm text-danger" />
              <span>Loading history...</span>
            </div>
          ) : orderHistory.length === 0 ? (
            <div className="timeline-empty">
              <Clock size={48} />
              <p>No history available for this order</p>
            </div>
          ) : (
            <div className="timeline-container">
              {/* Order Created - First Event */}
              <div className="timeline-item first">
                <div className="timeline-dot">
                  <ShoppingBag size={16} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-status">Order Created</span>
                    <span className="timeline-date">
                      <Calendar size={14} />
                      {orderHistory[0]?.timestamp
                        ? new Date(orderHistory[0].timestamp).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="timeline-detail">
                    <span className="timeline-performed-by">
                      <User size={14} />
                      {orderHistory[0]?.performedByName ||
                        orderHistory[0]?.updatedBy?.name ||
                        "System"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Changes */}
              {orderHistory.map((item, index) => {
                // Skip the first item if it's the same as the order creation
                if (index === 0 && item.status === "pending" && !item.note)
                  return null;

                return (
                  <div key={index} className="timeline-item">
                    <div className="timeline-line" />
                    <div
                      className="timeline-dot"
                      style={{
                        backgroundColor: getStatusIcon(item.status).color,
                      }}
                    >
                      {getStatusIcon(item.status).icon}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span
                          className="timeline-status"
                          style={{ color: getStatusIcon(item.status).color }}
                        >
                          {item.status?.toUpperCase() || "Updated"}
                        </span>
                        <span className="timeline-date">
                          <Calendar size={14} />
                          {item.timestamp
                            ? new Date(item.timestamp).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="timeline-detail">
                        <span className="timeline-performed-by">
                          <User size={14} />
                          {item.performedByName ||
                            item.updatedBy?.name ||
                            "System"}
                        </span>
                        {item.note && (
                          <span className="timeline-note">
                            <AlertCircle size={14} />
                            {item.note}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Current Status - Last Event */}
              {orderHistory.length > 0 && (
                <div className="timeline-item last">
                  <div className="timeline-line" />
                  <div
                    className="timeline-dot current"
                    style={{
                      backgroundColor: getStatusIcon(
                        orderHistory[orderHistory.length - 1]?.status,
                      ).color,
                    }}
                  >
                    <CheckCircle size={16} />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-status current-status">
                        Current Status:{" "}
                        {orderHistory[
                          orderHistory.length - 1
                        ]?.status?.toUpperCase() || "Unknown"}
                      </span>
                      <span className="timeline-date">
                        <Clock size={14} />
                        {orderHistory[orderHistory.length - 1]?.timestamp
                          ? new Date(
                              orderHistory[orderHistory.length - 1].timestamp,
                            ).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowTimelineModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        className="admin-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div className="order-detail-content">
              <Row>
                <Col md={6}>
                  <div className="detail-section">
                    <h6>Order Information</h6>
                    <p>
                      <strong>Order #:</strong> {selectedOrder.orderNumber}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {getStatusBadge(selectedOrder.status)}
                    </p>
                    <p>
                      <strong>Payment:</strong>{" "}
                      {getPaymentBadge(selectedOrder.paymentStatus)}
                    </p>
                    <p>
                      <strong>Method:</strong> {selectedOrder.paymentMethod}
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-section">
                    <h6>Customer Information</h6>
                    <p>
                      <strong>Name:</strong> {selectedOrder.customer?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.customer?.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedOrder.customer?.phone}
                    </p>
                  </div>
                </Col>
              </Row>

              <div className="detail-section">
                <h6>Shipping Address</h6>
                <p>{selectedOrder.shippingAddress?.name}</p>
                <p>
                  {selectedOrder.shippingAddress?.street},{" "}
                  {selectedOrder.shippingAddress?.city}
                </p>
                <p>
                  {selectedOrder.shippingAddress?.state} -{" "}
                  {selectedOrder.shippingAddress?.zipCode}
                </p>
                <p>{selectedOrder.shippingAddress?.country}</p>
              </div>

              <div className="detail-section">
                <h6>Order Items</h6>
                <div className="table-responsive">
                  <Table className="items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.size}</td>
                          <td>{item.quantity}</td>
                          <td>
                            {item.discount > 0 ? (
                              <>
                                <span className="original-price">
                                  PKR {item.price}
                                </span>
                                {" → "}
                                <span className="discounted-price">
                                  PKR {item.price - item.discount}
                                </span>
                              </>
                            ) : (
                              <>PKR {item.price}</>
                            )}
                          </td>
                          <td>PKR {item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-end">
                          <strong>Subtotal:</strong>
                        </td>
                        <td>PKR {formatCurrency(selectedOrder.subtotal)}</td>
                      </tr>
                      {selectedOrder.productDiscount > 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-end"
                            style={{ color: "#10b981" }}
                          >
                            <strong>🛍️ Product Discount:</strong>
                          </td>
                          <td style={{ color: "#10b981" }}>
                            - PKR{" "}
                            {formatCurrency(selectedOrder.productDiscount)}
                          </td>
                        </tr>
                      )}
                      {selectedOrder.coupon?.code && (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-end"
                            style={{ color: "#8b0000" }}
                          >
                            <strong>
                              🎫 Coupon Discount ({selectedOrder.coupon.code}):
                            </strong>
                          </td>
                          <td style={{ color: "#8b0000" }}>
                            - PKR {formatCurrency(selectedOrder.couponDiscount)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan="4" className="text-end">
                          <strong>Delivery Fee:</strong>
                        </td>
                        <td>
                          {selectedOrder.shipping === 0
                            ? "FREE"
                            : `PKR ${formatCurrency(selectedOrder.shipping)}`}
                        </td>
                      </tr>
                      <tr className="grand-total-row">
                        <td colSpan="4" className="text-end">
                          <strong
                            style={{ fontSize: "1.1rem", color: "#D4AF37" }}
                          >
                            Grand Total:
                          </strong>
                        </td>
                        <td>
                          <strong
                            style={{
                              color: "#D4AF37",
                              fontSize: "1.3rem",
                              fontWeight: "bold",
                            }}
                          >
                            PKR {formatCurrency(selectedOrder.total)}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedOrder && (
            <Button
              variant="primary"
              onClick={() => handleDownloadInvoice(selectedOrder)}
              disabled={isGeneratingInvoice}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {isGeneratingInvoice ? (
                <>
                  <span className="spinner-border spinner-border-sm" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download Invoice
                </>
              )}
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* ✅ Payment Confirmation Modal */}
      <Modal
        show={showPaymentModal}
        onHide={() => {
          setShowPaymentModal(false);
          setPaymentOrder(null);
          setPaymentAmount("");
          setPaymentNote("");
        }}
        className="admin-modal payment-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="payment-modal-title">
              <DollarSign size={20} />
              Confirm Payment
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {paymentOrder && (
            <>
              <div className="payment-order-info">
                <p>
                  <strong>Order #:</strong> {paymentOrder.orderNumber}
                </p>
                <p>
                  <strong>Customer:</strong>{" "}
                  {paymentOrder.customer?.name || "Unknown"}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  <Badge bg="info">
                    {paymentOrder.paymentMethod?.toUpperCase() || "COD"}
                  </Badge>
                </p>
                <p>
                  <strong>Total Amount:</strong>{" "}
                  <span style={{ color: "#D4AF37", fontWeight: "bold" }}>
                    PKR {paymentOrder.total?.toLocaleString()}
                  </span>
                </p>
              </div>

              <hr />

              <div className="payment-confirmation-form">
                <Form.Group className="mb-3">
                  <Form.Label>Amount Collected</Form.Label>
                  <Form.Control
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount collected"
                    min="0"
                    step="1"
                  />
                  <Form.Text className="text-muted">
                    Leave empty to use the full order amount
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirmation Note</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Add a note about this payment..."
                  />
                  <Form.Text className="text-muted">
                    Optional: Add any relevant notes about the payment
                  </Form.Text>
                </Form.Group>

                <div className="payment-confirmation-info">
                  <Alert variant="warning">
                    <Alert.Heading>Confirm Payment</Alert.Heading>
                    <p>
                      By confirming this payment, you are verifying that cash
                      was collected for this COD order. This action will:
                    </p>
                    <ul className="mb-0">
                      <li>
                        Mark the order as <strong>Paid</strong>
                      </li>
                      <li>Send a confirmation notification to the customer</li>
                      <li>Update the order analytics</li>
                    </ul>
                  </Alert>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowPaymentModal(false);
              setPaymentOrder(null);
              setPaymentAmount("");
              setPaymentNote("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={submitPaymentConfirmation}
            disabled={isConfirmingPayment}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            {isConfirmingPayment ? (
              <>
                <span className="spinner-border spinner-border-sm" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Confirm Payment
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderManagement;

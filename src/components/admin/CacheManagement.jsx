// frontend/src/components/admin/CacheManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Table,
  Spinner,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getCacheStats,
  clearAllCaches,
  clearMemoryCache,
  clearRedisCache,
  clearImageCache,
} from "../../redux/slices/cacheSlice";
import {
  RefreshCw,
  Trash2,
  Database,
  Image,
  Server,
  HardDrive,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import "../../styles/pages/CacheManagement.css";

const CacheManagement = () => {
  const dispatch = useDispatch();
  const { stats, isLoading, clearing, success, error } = useSelector(
    (state) => state.cache,
  );
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch stats on mount
  useEffect(() => {
    dispatch(getCacheStats());
  }, [dispatch]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        dispatch(getCacheStats());
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, dispatch]);

  // Show toast messages
  useEffect(() => {
    if (success) {
      toast.success(success);
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleClearAll = async () => {
    if (window.confirm("⚠️ This will clear ALL caches. Are you sure?")) {
      await dispatch(clearAllCaches());
      dispatch(getCacheStats());
    }
  };

  const handleClearMemory = async () => {
    if (window.confirm("Clear memory cache?")) {
      await dispatch(clearMemoryCache());
      dispatch(getCacheStats());
    }
  };

  const handleClearRedis = async () => {
    if (window.confirm("Clear Redis cache?")) {
      await dispatch(clearRedisCache());
      dispatch(getCacheStats());
    }
  };

  const handleClearImages = async () => {
    if (window.confirm("Clear image cache?")) {
      await dispatch(clearImageCache());
      dispatch(getCacheStats());
    }
  };

  const handleRefresh = () => {
    dispatch(getCacheStats());
    toast.success("Cache stats refreshed");
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderStatusBadge = (status) => {
    if (status) {
      return (
        <Badge bg="success">
          <CheckCircle size={12} /> Connected
        </Badge>
      );
    }
    return (
      <Badge bg="danger">
        <XCircle size={12} /> Disconnected
      </Badge>
    );
  };

  const formatSize = (size) => {
    if (!size) return "0 MB";
    return size;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  // ============================================
  // CACHE CARDS DATA
  // ============================================

  const cacheCards = [
    {
      id: "all",
      title: "Clear All Caches",
      icon: <Zap size={24} />,
      description: "Clear all cache types at once",
      color: "#8B0000",
      bg: "rgba(139,0,0,0.12)",
      action: handleClearAll,
      loading: clearing.all,
    },
    {
      id: "memory",
      title: "Memory Cache",
      icon: <Database size={24} />,
      description: `Current: ${stats?.memory?.keys || 0} items (${stats?.memory?.size || "0 MB"})`,
      color: "#3B82F6",
      bg: "rgba(59,130,246,0.12)",
      action: handleClearMemory,
      loading: clearing.memory,
    },
    {
      id: "redis",
      title: "Redis Cache",
      icon: <Server size={24} />,
      description: `Status: ${stats?.redis?.connected ? "Connected" : "Disconnected"}`,
      color: "#10B981",
      bg: "rgba(16,185,129,0.12)",
      action: handleClearRedis,
      loading: clearing.redis,
      disabled: !stats?.redis?.connected,
    },
    {
      id: "images",
      title: "Image Cache",
      icon: <Image size={24} />,
      description: "Clear Cloudinary/optimized images cache",
      color: "#8B5CF6",
      bg: "rgba(139,92,246,0.12)",
      action: handleClearImages,
      loading: clearing.images,
    },
  ];

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading && !stats) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading cache statistics...</p>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="cache-management">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1>Cache Management</h1>
          <p>Manage and clear all types of caches</p>
        </div>
        <div className="header-actions">
          <Button
            variant="outline-secondary"
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn-refresh"
          >
            <RefreshCw size={18} className={isLoading ? "spin" : ""} />
            Refresh
          </Button>
          <Button
            variant="outline-info"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "active" : ""}
          >
            <Clock size={18} />
            Auto-Refresh {autoRefresh ? "ON" : "OFF"}
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div
                className="stat-icon"
                style={{
                  background: "rgba(59,130,246,0.12)",
                  color: "#3B82F6",
                }}
              >
                <Database size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats?.memory?.keys || 0}</span>
                <span className="stat-label">Memory Items</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div
                className="stat-icon"
                style={{
                  background: "rgba(16,185,129,0.12)",
                  color: "#10B981",
                }}
              >
                <Server size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {stats?.redis?.connected ? "✅" : "❌"}
                </span>
                <span className="stat-label">Redis Status</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div
                className="stat-icon"
                style={{
                  background: "rgba(139,92,246,0.12)",
                  color: "#8B5CF6",
                }}
              >
                <Image size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {stats?.memory?.ttl || 3600}s
                </span>
                <span className="stat-label">Cache TTL</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div
                className="stat-icon"
                style={{ background: "rgba(139,0,0,0.12)", color: "#8B0000" }}
              >
                <HardDrive size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {stats?.memory?.size || "0 MB"}
                </span>
                <span className="stat-label">Cache Size</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cache Cards */}
      <Row className="g-4">
        {cacheCards.map((card) => (
          <Col key={card.id} md={6} lg={3}>
            <Card className="cache-card">
              <Card.Body>
                <div className="cache-card-header">
                  <div
                    className="cache-icon"
                    style={{ background: card.bg, color: card.color }}
                  >
                    {card.icon}
                  </div>
                  {card.disabled && (
                    <Badge bg="secondary" className="ms-2">
                      Disabled
                    </Badge>
                  )}
                </div>
                <h5 className="cache-title">{card.title}</h5>
                <p className="cache-description">{card.description}</p>
                <Button
                  variant="danger"
                  onClick={card.action}
                  disabled={card.loading || card.disabled}
                  className="w-100 mt-2"
                >
                  {card.loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="me-2" />
                      Clear Cache
                    </>
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Cache Details Table */}
      <Card className="cache-details-card mt-4">
        <Card.Header>
          <h5 className="mb-0">Cache Details</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table className="cache-table" hover>
              <thead>
                <tr>
                  <th>Cache Type</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Size</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Memory Cache</strong>
                  </td>
                  <td>{renderStatusBadge(true)}</td>
                  <td>{stats?.memory?.keys || 0}</td>
                  <td>{stats?.memory?.size || "0 MB"}</td>
                  <td>{formatTime(stats?.timestamp)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Redis Cache</strong>
                  </td>
                  <td>{renderStatusBadge(stats?.redis?.connected)}</td>
                  <td>{stats?.redis?.connected ? "Available" : "N/A"}</td>
                  <td>{stats?.redis?.connected ? "N/A" : "N/A"}</td>
                  <td>{formatTime(stats?.timestamp)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Image Cache</strong>
                  </td>
                  <td>
                    <Badge bg="info">Cloudinary</Badge>
                  </td>
                  <td>Optimized</td>
                  <td>N/A</td>
                  <td>{formatTime(stats?.timestamp)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Session Cache</strong>
                  </td>
                  <td>
                    <Badge bg="warning">Active</Badge>
                  </td>
                  <td>Active Sessions</td>
                  <td>N/A</td>
                  <td>{formatTime(stats?.timestamp)}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
        <Card.Footer className="text-muted">
          <small>Last updated: {formatTime(stats?.timestamp)}</small>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default CacheManagement;

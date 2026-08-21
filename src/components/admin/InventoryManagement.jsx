import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Badge, Modal } from "react-bootstrap";
import {
  Search,
  Edit,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getInventory,
  updateInventory,
  getLowStock,
  getOutOfStock,
  getInventorySummary,
} from "../../redux/slices/inventorySlice";
import Pagination from "../common/Pagination";
import toast from "react-hot-toast";
import "../../styles/pages/InventoryManagement.css";

const InventoryManagement = () => {
  const dispatch = useDispatch();
  const {
    inventory,
    lowStockItems,
    outOfStockItems,
    summary,
    isLoading,
    pagination,
    lowStockPagination,
    outOfStockPagination,
  } = useSelector((state) => state.inventory);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stockUpdate, setStockUpdate] = useState({
    quantity: 0,
    operation: "set",
  });
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const searchTimeout = React.useRef(null);

  // ✅ Fetch inventory data with pagination and filters
  const fetchInventory = (
    page = currentPage,
    itemsPerPage = limit,
    search = searchTerm,
  ) => {
    const params = {
      page,
      limit: itemsPerPage,
      ...(search && { search }),
    };
    dispatch(getInventory(params));
  };

  // ✅ Fetch low stock with pagination
  const fetchLowStock = (page = 1, itemsPerPage = limit) => {
    const params = {
      page,
      limit: itemsPerPage,
    };
    dispatch(getLowStock(params));
  };

  // ✅ Fetch out of stock with pagination
  const fetchOutOfStock = (page = 1, itemsPerPage = limit) => {
    const params = {
      page,
      limit: itemsPerPage,
    };
    dispatch(getOutOfStock(params));
  };

  useEffect(() => {
    fetchInventory(currentPage, limit);
    dispatch(getInventorySummary());
    fetchLowStock(1, limit);
    fetchOutOfStock(1, limit);
  }, [currentPage, limit]);

  // ✅ Handle search with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);

    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchInventory(1, limit, value);
    }, 500);
  };

  // ✅ Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ✅ Handle refresh
  const handleRefresh = () => {
    fetchInventory(currentPage, limit, searchTerm);
    fetchLowStock(1, limit);
    fetchOutOfStock(1, limit);
    dispatch(getInventorySummary());
    toast.success("Refreshing inventory...");
  };

  const handleUpdateStock = (e) => {
    e.preventDefault();

    const inventoryData = {
      quantity: parseInt(stockUpdate.quantity),
      operation: stockUpdate.operation,
    };

    dispatch(
      updateInventory({
        productId: selectedInventory.product?._id || selectedInventory.product,
        inventoryData: inventoryData,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Stock updated successfully!");
        setShowEditModal(false);
        fetchInventory(currentPage, limit, searchTerm);
        fetchLowStock(1, limit);
        fetchOutOfStock(1, limit);
        dispatch(getInventorySummary());
      })
      .catch((err) => {
        toast.error(err || "Failed to update stock");
      });
  };

  // ✅ Get inventory based on active tab
  const getDisplayItems = () => {
    switch (activeTab) {
      case "low-stock":
        return lowStockItems || [];
      case "out-of-stock":
        return outOfStockItems || [];
      default:
        return inventory || [];
    }
  };

  // ✅ Get pagination data based on active tab
  const getPaginationData = () => {
    switch (activeTab) {
      case "low-stock":
        return lowStockPagination;
      case "out-of-stock":
        return outOfStockPagination;
      default:
        return pagination;
    }
  };

  const getStockStatus = (stock, threshold = 5) => {
    if (stock === 0) return { variant: "danger", label: "Out of Stock" };
    if (stock <= threshold) return { variant: "warning", label: "Low Stock" };
    return { variant: "success", label: "In Stock" };
  };

  // ✅ Get product from inventory item
  const getProduct = (item) => {
    return item.product || item;
  };

  // ✅ Get stock from inventory item
  const getStock = (item) => {
    return item.availableQuantity || item.quantity || 0;
  };

  const displayItems = getDisplayItems();
  const paginationData = getPaginationData();

  // ✅ Pagination
  const totalPages = paginationData?.pages || 1;
  const totalItems = paginationData?.total || 0;

  const getPaginationRange = () => {
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

  // ✅ Format number with commas
  const formatNumber = (num) => {
    return num?.toLocaleString() || 0;
  };

  if (isLoading && !inventory?.length) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="inventory-management">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1>Inventory</h1>
          <p>Manage product stock</p>
          {summary && (
            <div className="inventory-stats-summary">
              <span>📦 Total Products: {summary.totalProducts || 0}</span>
              <span className="stat-low">
                ⚠️ Low Stock: {summary.lowStock || 0}
              </span>
              <span className="stat-out">
                🚫 Out of Stock: {summary.outOfStock || 0}
              </span>
              <span className="stat-total">
                📊 Total Stock: {formatNumber(summary.totalStock)}
              </span>
              <span className="stat-available">
                ✅ Available: {formatNumber(summary.totalAvailable)}
              </span>
              <span className="stat-reserved">
                🔒 Reserved: {formatNumber(summary.totalReserved)}
              </span>
            </div>
          )}
        </div>
        <Button
          variant="outline-secondary"
          onClick={handleRefresh}
          disabled={isLoading}
          className="refresh-btn"
        >
          <RefreshCw size={18} className={isLoading ? "spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="inventory-tabs">
        <button
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("all");
            setCurrentPage(1);
          }}
        >
          All Items ({summary?.totalProducts || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === "low-stock" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("low-stock");
            setCurrentPage(1);
            fetchLowStock(1, limit);
          }}
        >
          Low Stock ({summary?.lowStock || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === "out-of-stock" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("out-of-stock");
            setCurrentPage(1);
            fetchOutOfStock(1, limit);
          }}
        >
          Out of Stock ({summary?.outOfStock || 0})
        </button>
      </div>

      {/* Controls */}
      <div className="management-controls">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="items-per-page">
          <span>Show:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="limit-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="table-card">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Stock</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.length > 0 ? (
                  displayItems.map((item) => {
                    const product = getProduct(item);
                    const stock = getStock(item);
                    const stockStatus = getStockStatus(
                      stock,
                      item.lowStockThreshold || 5,
                    );
                    return (
                      <tr key={item._id || product?._id}>
                        <td>
                          <div className="product-cell">
                            <img
                              src={
                                product?.images?.[0]?.url ||
                                "https://via.placeholder.com/40"
                              }
                              alt={product?.name || "Product"}
                              className="product-thumb"
                            />
                            <div className="product-info">
                              <span className="product-name">
                                {product?.name || "Unknown"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="brand-name">
                          {product?.brand || "N/A"}
                        </td>
                        <td className="stock-value">{formatNumber(stock)}</td>
                        <td className="reserved-value">
                          {formatNumber(item.reservedQuantity || 0)}
                        </td>
                        <td className="available-value">
                          {formatNumber(item.availableQuantity || stock)}
                        </td>
                        <td>
                          <Badge bg={stockStatus.variant}>
                            {stockStatus.label}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="action-buttons">
                            <button
                              className="action-btn edit"
                              onClick={() => {
                                setSelectedInventory(item);
                                setStockUpdate({
                                  quantity: stock,
                                  operation: "set",
                                });
                                setShowEditModal(true);
                              }}
                              title="Update Stock"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 no-data">
                      {searchTerm
                        ? "No inventory matches your search"
                        : activeTab === "low-stock"
                          ? "No low stock items"
                          : activeTab === "out-of-stock"
                            ? "No out of stock items"
                            : "No inventory found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {paginationData && paginationData.total > 0 && (
            <div className="pagination-wrapper">
              <div className="pagination-info">
                Showing {(currentPage - 1) * limit + 1} -{" "}
                {Math.min(currentPage * limit, totalItems)} of {totalItems}{" "}
                items
              </div>
              <div className="pagination-controls">
                <button
                  className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
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
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  className={`pagination-btn ${currentPage === totalPages ? "disabled" : ""}`}
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Edit Stock Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        className="admin-modal inventory-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Stock</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateStock}>
          <Modal.Body>
            <p className="modal-text">
              Product:{" "}
              <strong>
                {selectedInventory?.product?.name || "Unknown Product"}
              </strong>
            </p>
            <p className="modal-text">
              Current Stock:{" "}
              <strong>
                {selectedInventory?.quantity ||
                  selectedInventory?.availableQuantity ||
                  0}
              </strong>
            </p>

            <Form.Group className="mb-3">
              <Form.Label className="modal-label">Operation</Form.Label>
              <Form.Select
                value={stockUpdate.operation}
                onChange={(e) =>
                  setStockUpdate({ ...stockUpdate, operation: e.target.value })
                }
                className="modal-select"
              >
                <option value="set">Set to</option>
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="modal-label">Quantity</Form.Label>
              <Form.Control
                type="number"
                value={stockUpdate.quantity}
                onChange={(e) =>
                  setStockUpdate({
                    ...stockUpdate,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                required
                className="modal-input"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Update Stock
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryManagement;

// frontend/src/components/admin/ProductManagement.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Modal,
  Badge,
} from "react-bootstrap";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Upload,
  Image,
  X,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Package,
  DollarSign,
  Star,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  duplicateProduct,
} from "../../redux/slices/productSlice";
import {
  getInventory,
  getInventorySummary,
  getLowStock,
  getOutOfStock,
} from "../../redux/slices/inventorySlice";
import Pagination from "../common/Pagination";
import toast from "react-hot-toast";
import BulkUpload from "./BulkUpload";
import * as XLSX from "xlsx";
import "../../styles/pages/ProductManagement.css";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { products, isLoading, pagination } = useSelector(
    (state) => state.products,
  );

  // ✅ State
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // ✅ Bulk Actions State
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkAction, setBulkAction] = useState("status");
  const [bulkStatus, setBulkStatus] = useState("");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // ✅ Form State
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "men",
    description: "",
    sizes: [],
    notes: { top: [], middle: [], base: [] },
    status: "active",
    isFeatured: false,
    isNew: false,
    metaTitle: "",
    metaDescription: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const searchTimeout = useRef(null);

  // ✅ Fetch products with pagination and filters - FIXED
  // In fetchProducts function, add a parameter to exclude discontinued
  const fetchProducts = (
    page = currentPage,
    itemsPerPage = limit,
    search = searchTerm,
    status = statusFilter,
    category = categoryFilter,
  ) => {
    const params = {
      page,
      limit: itemsPerPage,
      ...(search && { search }),
      ...(status && status !== "all" && { status }),
      ...(category && category !== "all" && { category }),
    };

    // If status is "all", exclude discontinued products from the list
    // but keep them in the database
    if (status === "all") {
      params.excludeStatus = "discontinued";
    }

    dispatch(getProducts(params));
  };

  useEffect(() => {
    fetchProducts(currentPage, limit, searchTerm, statusFilter, categoryFilter);
  }, [currentPage, limit, statusFilter, categoryFilter]);

  // ✅ Reset selection when filters change
  useEffect(() => {
    setSelectedProducts([]);
    setSelectAll(false);
  }, [statusFilter, categoryFilter, searchTerm, currentPage]);

  // ✅ Handle search with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchProducts(1, limit, value, statusFilter, categoryFilter);
    }, 500);
  };

  // ✅ Handle status filter change
  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // ✅ Handle category filter change
  const handleCategoryFilterChange = (e) => {
    const value = e.target.value;
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  // ✅ Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ✅ Handle refresh
  const handleRefresh = () => {
    fetchProducts(currentPage, limit, searchTerm, statusFilter, categoryFilter);
    toast.success("Refreshing products...");
  };

  // ✅ Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle notes change
  const handleNotesChange = (type, value) => {
    const notesArray = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      notes: { ...prev.notes, [type]: notesArray },
    }));
  };

  // ✅ Handle size changes with auto-discount calculation
  const handleSizesChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    const size = { ...newSizes[index], [field]: value };

    if (field === "comparePrice" || field === "price") {
      const price = parseFloat(size.price) || 0;
      const comparePrice = parseFloat(size.comparePrice) || 0;
      if (comparePrice > 0 && comparePrice > price) {
        size.discount = Math.round(
          ((comparePrice - price) / comparePrice) * 100,
        );
      } else {
        size.discount = 0;
      }
    }

    newSizes[index] = size;
    setFormData({ ...formData, sizes: newSizes });
  };

  // ✅ Add/Remove size fields
  const addSizeField = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [
        ...prev.sizes,
        { size: "50ml", stock: 0, price: "", comparePrice: "", discount: 0 },
      ],
    }));
  };

  const removeSizeField = (index) => {
    if (formData.sizes.length === 1) {
      toast.error("You must have at least one size");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  // ✅ Image handling
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImages.length + previewImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setSelectedFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const removeNewImage = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.brand ||
      !formData.description ||
      formData.sizes.length === 0
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.description.length < 50) {
      toast.error("Description must be at least 50 characters");
      return;
    }

    const hasPrice = formData.sizes.some((s) => parseFloat(s.price) > 0);
    if (!hasPrice) {
      toast.error("At least one size must have a price");
      return;
    }

    setUploading(true);

    try {
      const cleanSizes = formData.sizes.map((size) => {
        const price = parseFloat(size.price) || 0;
        const comparePrice = parseFloat(size.comparePrice) || 0;
        let discount = parseFloat(size.discount) || 0;

        if (comparePrice > 0 && comparePrice > price && discount === 0) {
          discount = Math.round(((comparePrice - price) / comparePrice) * 100);
        }

        return {
          size: size.size || "50ml",
          stock: parseInt(size.stock) || 0,
          price: price,
          comparePrice: comparePrice > 0 ? comparePrice : undefined,
          discount: discount,
        };
      });

      const defaultSize =
        cleanSizes.find((s) => s.size === "50ml") || cleanSizes[0];

      const productData = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        description: formData.description,
        price: defaultSize?.price || 0,
        comparePrice: defaultSize?.comparePrice || undefined,
        discount: defaultSize?.discount || 0,
        sizes: cleanSizes,
        totalStock: cleanSizes.reduce(
          (sum, size) => sum + (size.stock || 0),
          0,
        ),
        notes: {
          top: formData.notes?.top || [],
          middle: formData.notes?.middle || [],
          base: formData.notes?.base || [],
        },
        status: formData.status || "active",
        shortDescription: formData.shortDescription || "",
        isFeatured: formData.isFeatured || false,
        isNew: formData.isNew || true,
        metaTitle: formData.metaTitle || "",
        metaDescription: formData.metaDescription || "",
      };

      if (editingProduct) {
        productData.keepImages = existingImages.map((img) => img.url);
      }

      const formDataToSend = new FormData();
      formDataToSend.append("data", JSON.stringify(productData));

      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => formDataToSend.append("images", file));
      }

      if (editingProduct) {
        await dispatch(
          updateProduct({
            id: editingProduct._id,
            productData: formDataToSend,
          }),
        ).unwrap();
        toast.success("Product updated successfully!");
      } else {
        await dispatch(createProduct(formDataToSend)).unwrap();
        toast.success("Product created successfully!");
      }

      handleCloseModal();
      setCurrentPage(1);
      fetchProducts(1, limit, searchTerm, statusFilter, categoryFilter);
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error(error?.message || "Failed to save product");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Duplicate Product
  const handleDuplicateProduct = async (product) => {
    if (!window.confirm(`Duplicate "${product.name}"?`)) return;
    try {
      await dispatch(duplicateProduct(product._id)).unwrap();
      toast.success("Product duplicated successfully!");
      fetchProducts(
        currentPage,
        limit,
        searchTerm,
        statusFilter,
        categoryFilter,
      );
    } catch (error) {
      toast.error(error || "Failed to duplicate product");
    }
  };

  // ✅ Quick Toggle Status
  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await dispatch(
        updateProduct({ id: productId, productData: { status: newStatus } }),
      ).unwrap();
      toast.success(
        `Product ${newStatus === "active" ? "activated" : "deactivated"}`,
      );
      fetchProducts(
        currentPage,
        limit,
        searchTerm,
        statusFilter,
        categoryFilter,
      );
    } catch (error) {
      toast.error(error || "Failed to update status");
    }
  };

  // ✅ Bulk Actions
  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId))
        return prev.filter((id) => id !== productId);
      return [...prev, productId];
    });
    if (selectAll) setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      const allIds = filteredProducts?.map((p) => p._id) || [];
      setSelectedProducts(allIds);
    }
    setSelectAll(!selectAll);
  };

  const clearSelection = () => {
    setSelectedProducts([]);
    setSelectAll(false);
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) {
      toast.error("Please select a status");
      return;
    }

    setIsBulkProcessing(true);
    try {
      const promises = selectedProducts.map((id) =>
        dispatch(
          updateProduct({ id, productData: { status: bulkStatus } }),
        ).unwrap(),
      );
      await Promise.all(promises);
      toast.success(
        `Updated ${selectedProducts.length} products to ${bulkStatus}`,
      );
      setShowBulkActionModal(false);
      setSelectedProducts([]);
      setSelectAll(false);
      fetchProducts(
        currentPage,
        limit,
        searchTerm,
        statusFilter,
        categoryFilter,
      );
    } catch (error) {
      toast.error(error || "Failed to update products");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedProducts.length} products?`)) return;
    setIsBulkProcessing(true);
    try {
      const promises = selectedProducts.map((id) =>
        dispatch(deleteProduct(id)).unwrap(),
      );
      await Promise.all(promises);
      toast.success(`Deleted ${selectedProducts.length} products`);
      setShowBulkActionModal(false);
      setSelectedProducts([]);
      setSelectAll(false);
      fetchProducts(
        currentPage,
        limit,
        searchTerm,
        statusFilter,
        categoryFilter,
      );
    } catch (error) {
      toast.error(error || "Failed to delete products");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // ✅ Export Products
  const handleExportProducts = async () => {
    setIsExporting(true);
    try {
      const allProducts = products || [];

      const exportData = allProducts.map((product) => ({
        "Product Name": product.name || "N/A",
        Brand: product.brand || "N/A",
        Category: product.category || "N/A",
        "Price (PKR)": product.price || 0,
        "Compare Price": product.comparePrice || "N/A",
        "Discount (%)": product.discount || 0,
        "Total Stock": product.totalStock || 0,
        Status: product.status || "N/A",
        Featured: product.isFeatured ? "Yes" : "No",
        "New Arrival": product.isNew ? "Yes" : "No",
        Created: product.createdAt
          ? new Date(product.createdAt).toLocaleDateString()
          : "N/A",
        Sizes:
          product.sizes?.map((s) => `${s.size}(${s.stock})`).join(", ") ||
          "N/A",
        "Top Notes": product.notes?.top?.join(", ") || "N/A",
        "Middle Notes": product.notes?.middle?.join(", ") || "N/A",
        "Base Notes": product.notes?.base?.join(", ") || "N/A",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");

      ws["!cols"] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 12 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
        { wch: 14 },
        { wch: 30 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
      ];

      const fileName = `Products_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Exported ${exportData.length} products!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export products");
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ handleEdit
  const handleEdit = (product) => {
    setEditingProduct(product);
    setExistingImages(
      product.images?.map((img) => ({
        url: img.url,
        publicId: img.publicId,
      })) || [],
    );

    const sizes =
      product.sizes?.length > 0
        ? product.sizes.map((s) => ({
            size: s.size || "50ml",
            stock: s.stock || 0,
            price: s.price || 0,
            comparePrice: s.comparePrice || "",
            discount: s.discount || 0,
          }))
        : [
            {
              size: "50ml",
              stock: 0,
              price: "",
              comparePrice: "",
              discount: 0,
            },
          ];

    setFormData({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "men",
      description: product.description || "",
      sizes: sizes,
      notes: product.notes || { top: [], middle: [], base: [] },
      status: product.status || "active",
      isFeatured: product.isFeatured || false,
      isNew: product.isNew || false,
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
    });
    setPreviewImages([]);
    setSelectedFiles([]);
    setShowModal(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(productId))
        .unwrap()
        .then(() => {
          toast.success("Product deleted successfully!");
          fetchProducts(
            currentPage,
            limit,
            searchTerm,
            statusFilter,
            categoryFilter,
          );
        })
        .catch((err) => toast.error(err || "Failed to delete product"));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      brand: "",
      category: "men",
      description: "",
      sizes: [],
      notes: { top: [], middle: [], base: [] },
      status: "active",
      isFeatured: false,
      isNew: false,
      metaTitle: "",
      metaDescription: "",
    });
    setSelectedFiles([]);
    setPreviewImages([]);
    setExistingImages([]);
    setUploading(false);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: {
        variant: "success",
        label: "Active",
        icon: <CheckCircle size={12} />,
      },
      inactive: {
        variant: "secondary",
        label: "Inactive",
        icon: <XCircle size={12} />,
      },
      draft: { variant: "warning", label: "Draft", icon: <Clock size={12} /> },
      "out-of-stock": {
        variant: "danger",
        label: "Out of Stock",
        icon: <AlertCircle size={12} />,
      },
      discontinued: {
        variant: "dark",
        label: "Discontinued",
        icon: <XCircle size={12} />,
      },
    };
    const info = statusMap[status] || statusMap.draft;
    return (
      <Badge bg={info.variant} className="status-badge">
        {info.icon}
        {info.label}
      </Badge>
    );
  };

  // ✅ Calculate stats from pagination and products
  const totalProducts = pagination?.total || 0;
  const activeProducts =
    products?.filter((p) => p.status === "active").length || 0;
  const outOfStockProducts =
    products?.filter((p) => p.status === "out-of-stock" || p.totalStock === 0)
      .length || 0;
  const featuredProducts = products?.filter((p) => p.isFeatured).length || 0;

  const filteredProducts = products;

  // ✅ KPI Cards
  const kpiCards = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: <Package size={18} />,
      color: "#8B0000",
    },
    {
      label: "Active",
      value: activeProducts,
      icon: <CheckCircle size={18} />,
      color: "#10B981",
    },
    {
      label: "Out of Stock",
      value: outOfStockProducts,
      icon: <AlertCircle size={18} />,
      color: "#EF4444",
    },
    {
      label: "Featured",
      value: featuredProducts,
      icon: <Star size={18} />,
      color: "#D4AF37",
    },
  ];

  if (isLoading && !products?.length) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="product-management">
      <div className="management-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog</p>
          <span className="product-count">{totalProducts} products found</span>
        </div>
        <div className="header-actions">
          {/* ✅ Export Button */}
          <button
            className="btn-export-excel"
            onClick={handleExportProducts}
            disabled={isExporting || !products?.length}
          >
            {isExporting ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" />
                Exporting...
              </>
            ) : (
              <>
                <FileSpreadsheet size={18} />
                Export
              </>
            )}
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
          <Button
            className="btn-add-product"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} />
            Add Product
          </Button>
        </div>
      </div>

      {/* ✅ KPI Cards */}
      <div className="product-kpi-cards">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <div className="kpi-icon" style={{ color: kpi.color }}>
              {kpi.icon}
            </div>
            <div className="kpi-info">
              <span className="kpi-value">{kpi.value}</span>
              <span className="kpi-label">{kpi.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Product Tabs */}
      <div className="product-tabs">
        <button
          className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Products List
        </button>
        <button
          className={`tab-btn ${activeTab === "bulk" ? "active" : ""}`}
          onClick={() => setActiveTab("bulk")}
        >
          <FileSpreadsheet size={16} className="me-1" />
          Bulk Upload
        </button>
      </div>

      {/* ✅ Tab Content */}
      {activeTab === "list" ? (
        <>
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
            <div className="filter-wrapper">
              <Filter size={18} />
              <select
                className="filter-select"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
            <div className="filter-wrapper">
              <select
                className="filter-select"
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
              >
                <option value="all">All Categories</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
                <option value="niche">Niche</option>
              </select>
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
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* ✅ Bulk Actions Toolbar */}
          {selectedProducts.length > 0 && (
            <div className="bulk-actions-toolbar">
              <div className="bulk-actions-info">
                <span className="bulk-selected-count">
                  {selectedProducts.length} product
                  {selectedProducts.length > 1 ? "s" : ""} selected
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
                <button
                  className="bulk-apply-btn"
                  onClick={() => {
                    setBulkAction("status");
                    setShowBulkActionModal(true);
                  }}
                  disabled={!bulkStatus}
                >
                  Apply Status
                </button>
                <button
                  className="bulk-delete-btn"
                  onClick={() => {
                    setBulkAction("delete");
                    setShowBulkActionModal(true);
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          )}

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
                          disabled={!filteredProducts?.length}
                        />
                      </th>
                      <th>Product</th>
                      <th>Brand</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts?.length > 0 ? (
                      filteredProducts.map((product) => (
                        <tr
                          key={product._id}
                          className={
                            selectedProducts.includes(product._id)
                              ? "selected-row"
                              : ""
                          }
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product._id)}
                              onChange={() => handleSelectProduct(product._id)}
                              className="bulk-checkbox"
                            />
                          </td>
                          <td>
                            <div className="product-name-cell">
                              <img
                                src={
                                  product.images?.[0]?.url ||
                                  "https://via.placeholder.com/40"
                                }
                                alt={product.name}
                                className="product-thumb"
                              />
                              <span>{product.name}</span>
                              {product.isFeatured && (
                                <Badge bg="warning" className="featured-badge">
                                  ⭐ Featured
                                </Badge>
                              )}
                              {product.isNew && (
                                <Badge bg="info" className="new-badge">
                                  🆕 New
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td>{product.brand}</td>
                          <td className="capitalize">{product.category}</td>
                          <td>PKR {product.price?.toLocaleString()}</td>
                          <td>
                            <span
                              className={
                                product.totalStock <= 5
                                  ? "stock-low"
                                  : "stock-normal"
                              }
                            >
                              {product.totalStock || 0}
                            </span>
                          </td>
                          <td>{getStatusBadge(product.status)}</td>
                          <td className="text-center">
                            <div className="action-buttons">
                              <button
                                className="action-btn view"
                                onClick={() =>
                                  window.open(
                                    `/product/${product._id}`,
                                    "_blank",
                                  )
                                }
                                title="View"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="action-btn edit"
                                onClick={() => handleEdit(product)}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="action-btn duplicate"
                                onClick={() => handleDuplicateProduct(product)}
                                title="Duplicate"
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                className={`action-btn toggle ${product.status === "active" ? "active" : "inactive"}`}
                                onClick={() =>
                                  handleToggleStatus(
                                    product._id,
                                    product.status,
                                  )
                                }
                                title={
                                  product.status === "active"
                                    ? "Deactivate"
                                    : "Activate"
                                }
                              >
                                {product.status === "active" ? (
                                  <CheckCircle size={16} />
                                ) : (
                                  <XCircle size={16} />
                                )}
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => handleDelete(product._id)}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center py-4 text-secondary"
                        >
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {pagination && pagination.total > 0 && (
                <Pagination
                  currentPage={pagination.page || currentPage}
                  totalPages={pagination.pages || 1}
                  totalItems={pagination.total || 0}
                  itemsPerPage={pagination.limit || limit}
                  onPageChange={handlePageChange}
                  showItemsInfo={true}
                  showPageNumbers={true}
                  maxVisiblePages={5}
                />
              )}
            </Card.Body>
          </Card>
        </>
      ) : (
        <BulkUpload />
      )}

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
            {bulkAction === "status" ? "Bulk Status Update" : "Bulk Delete"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bulkAction === "status" ? (
            <>
              <p className="bulk-action-info">
                You are about to update{" "}
                <strong>{selectedProducts.length}</strong> products to:
              </p>
              <div className="bulk-status-preview">
                <span className="bulk-status-label">Status:</span>
                <span className="bulk-status-value">
                  {bulkStatus?.toUpperCase()}
                </span>
              </div>
              <p className="bulk-action-warning">
                ⚠️ This action cannot be undone. Are you sure?
              </p>
            </>
          ) : (
            <>
              <p className="bulk-action-info">
                You are about to delete{" "}
                <strong>{selectedProducts.length}</strong> products.
              </p>
              <p className="bulk-action-warning" style={{ color: "#EF4444" }}>
                ⚠️ This action is permanent and cannot be undone!
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowBulkActionModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={
              bulkAction === "status"
                ? handleBulkStatusUpdate
                : handleBulkDelete
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
              "Delete Products"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        centered
        className="admin-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? "Edit Product" : "Add Product"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Basic Info */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand *</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Category & Status */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                    <option value="niche">Niche</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Featured & New */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="isFeatured"
                    label="⭐ Featured Product"
                    checked={formData.isFeatured || false}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                  />
                  <Form.Text className="text-muted">
                    Appears in the featured section on homepage
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="isNew"
                    label="🆕 New Arrival"
                    checked={formData.isNew || false}
                    onChange={(e) =>
                      setFormData({ ...formData, isNew: e.target.checked })
                    }
                  />
                  <Form.Text className="text-muted">
                    Shows "New" badge on the product card
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label>Description * (min 50 characters)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description..."
                required
              />
              <Form.Text className="text-muted">
                {formData.description.length}/50 characters minimum
              </Form.Text>
            </Form.Group>

            {/* SEO Fields */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Meta Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle || ""}
                    onChange={handleInputChange}
                    placeholder="SEO Title (max 60 chars)"
                    maxLength={60}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Meta Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="metaDescription"
                    value={formData.metaDescription || ""}
                    onChange={handleInputChange}
                    placeholder="SEO Description (max 160 chars)"
                    maxLength={160}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Sizes & Pricing */}
            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <Form.Label className="fw-bold mb-0">
                    📦 Sizes & Pricing
                  </Form.Label>
                  <Form.Text className="text-muted d-block">
                    Each size has its own price, compare price, stock, and
                    discount
                  </Form.Text>
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={addSizeField}
                >
                  <Plus size={14} /> Add Size
                </Button>
              </div>

              {formData.sizes.length === 0 ? (
                <div className="text-center py-3 text-muted">
                  No sizes added. Click "Add Size" to add one.
                </div>
              ) : (
                formData.sizes.map((size, index) => (
                  <Row key={index} className="mb-2 align-items-center">
                    <Col xs={5} md={2}>
                      <Form.Control
                        as="select"
                        value={size.size}
                        onChange={(e) =>
                          handleSizesChange(index, "size", e.target.value)
                        }
                      >
                        <option value="15ml">15ml</option>
                        <option value="30ml">30ml</option>
                        <option value="50ml">50ml</option>
                        <option value="100ml">100ml</option>
                        <option value="150ml">150ml</option>
                        <option value="200ml">200ml</option>
                      </Form.Control>
                    </Col>
                    <Col xs={3} md={1.5}>
                      <Form.Control
                        type="number"
                        placeholder="Stock"
                        value={size.stock}
                        onChange={(e) =>
                          handleSizesChange(
                            index,
                            "stock",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        min="0"
                      />
                    </Col>
                    <Col xs={4} md={2.5}>
                      <Form.Control
                        type="number"
                        placeholder="Price"
                        value={size.price}
                        onChange={(e) =>
                          handleSizesChange(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        min="0"
                      />
                    </Col>
                    <Col xs={5} md={2.5}>
                      <Form.Control
                        type="number"
                        placeholder="Compare Price"
                        value={size.comparePrice || ""}
                        onChange={(e) =>
                          handleSizesChange(
                            index,
                            "comparePrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        min="0"
                      />
                    </Col>
                    <Col xs={4} md={1.5}>
                      <Form.Control
                        type="text"
                        value={size.discount ? `${size.discount}%` : "Auto"}
                        disabled
                        style={{
                          backgroundColor: "#1a1a1a",
                          color: size.discount > 0 ? "#10b981" : "#6b7280",
                          fontWeight: size.discount > 0 ? "600" : "400",
                          textAlign: "center",
                          cursor: "default",
                        }}
                      />
                    </Col>
                    <Col xs={3} md={1}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeSizeField(index)}
                        style={{ width: "100%" }}
                      >
                        <X size={16} />
                      </Button>
                    </Col>
                  </Row>
                ))
              )}
              <Form.Text className="text-muted mt-2 d-block">
                💡 Discount auto-calculates when Compare Price is higher than
                Price
              </Form.Text>
            </Form.Group>

            {/* Notes */}
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Top Notes</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Bergamot, Lemon"
                    value={formData.notes.top.join(", ")}
                    onChange={(e) => handleNotesChange("top", e.target.value)}
                  />
                  <Form.Text className="text-muted">Comma separated</Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Middle Notes</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Rose, Jasmine"
                    value={formData.notes.middle.join(", ")}
                    onChange={(e) =>
                      handleNotesChange("middle", e.target.value)
                    }
                  />
                  <Form.Text className="text-muted">Comma separated</Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Base Notes</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Vanilla, Oud"
                    value={formData.notes.base.join(", ")}
                    onChange={(e) => handleNotesChange("base", e.target.value)}
                  />
                  <Form.Text className="text-muted">Comma separated</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Product Images */}
            <Form.Group className="mb-3">
              <Form.Label>Product Images</Form.Label>

              {editingProduct && existingImages.length > 0 && (
                <div className="image-previews existing-images">
                  <p className="text-muted small mb-2">Current Images:</p>
                  <div className="existing-images-grid">
                    {existingImages.map((img, index) => (
                      <div
                        key={`existing-${index}`}
                        className="preview-item existing"
                      >
                        <img src={img.url} alt={`Product ${index + 1}`} />
                        <button
                          className="preview-remove"
                          onClick={() => removeExistingImage(index)}
                          title="Remove this image"
                          type="button"
                        >
                          <X size={14} />
                        </button>
                        <span className="existing-label">Existing</span>
                      </div>
                    ))}
                  </div>
                  <Form.Text className="text-muted">
                    Click ✕ to remove existing images. They will be deleted from
                    Cloudinary.
                  </Form.Text>
                </div>
              )}

              {previewImages.length > 0 && (
                <div className="image-previews new-images">
                  <p className="text-muted small mb-2">New Images to Upload:</p>
                  <div className="new-images-grid">
                    {previewImages.map((url, index) => (
                      <div key={`new-${index}`} className="preview-item new">
                        <img src={url} alt={`Preview ${index + 1}`} />
                        <button
                          className="preview-remove"
                          onClick={() => removeNewImage(index)}
                          title="Remove this image"
                          type="button"
                        >
                          <X size={14} />
                        </button>
                        <span className="new-label">New</span>
                      </div>
                    ))}
                  </div>
                  <Form.Text className="text-muted">
                    Click ✕ to remove images before saving.
                  </Form.Text>
                </div>
              )}

              <div className="image-upload-area">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="image-upload-input"
                  id="productImages"
                  name="images"
                />
                <label htmlFor="productImages" className="image-upload-label">
                  <Upload size={24} />
                  <span>Click to upload images</span>
                  <small>Max 5 images (JPG, PNG, WebP)</small>
                </label>
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={uploading}>
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </>
              ) : editingProduct ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;

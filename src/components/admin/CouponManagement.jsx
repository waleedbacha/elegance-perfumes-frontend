import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Badge,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  DollarSign,
  Calendar,
  Users,
  RefreshCw,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../../redux/slices/couponSlice";
import Pagination from "../common/Pagination";
import toast from "react-hot-toast";
import "../../styles/pages/CouponManagement.css";

const CouponManagement = () => {
  const dispatch = useDispatch();
  const searchTimeout = useRef(null);
  const { coupons, isLoading } = useSelector((state) => state.coupons);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
    isActive: true,
  });

  // ✅ Fetch coupons with pagination
  const fetchCoupons = (
    page = currentPage,
    itemsPerPage = limit,
    search = searchTerm,
  ) => {
    const params = {
      page,
      limit: itemsPerPage,
      ...(search && { search }),
    };
    dispatch(getCoupons(params));
  };

  useEffect(() => {
    fetchCoupons(currentPage, limit);
  }, [currentPage, limit]);

  // ✅ Handle search with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      fetchCoupons(1, limit, value);
    }, 500);
  };

  // ✅ Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ✅ Handle refresh
  const handleRefresh = () => {
    fetchCoupons(currentPage, limit, searchTerm);
    toast.success("Refreshing coupons...");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.discountValue) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    const couponData = {
      ...formData,
      discountValue: parseFloat(formData.discountValue),
      minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
      usageLimit: parseInt(formData.usageLimit) || 1,
    };

    if (editingCoupon) {
      // ✅ FIXED: Use 'couponData' instead of 'data'
      dispatch(updateCoupon({ id: editingCoupon._id, couponData }))
        .unwrap()
        .then(() => {
          toast.success("Coupon updated successfully!");
          handleCloseModal();
          fetchCoupons(currentPage, limit, searchTerm);
        })
        .catch((err) => {
          toast.error(err || "Failed to update coupon");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      dispatch(createCoupon(couponData))
        .unwrap()
        .then(() => {
          toast.success("Coupon created successfully!");
          handleCloseModal();
          fetchCoupons(currentPage, limit, searchTerm);
        })
        .catch((err) => {
          toast.error(err || "Failed to create coupon");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      dispatch(deleteCoupon(id))
        .unwrap()
        .then(() => {
          toast.success("Coupon deleted successfully!");
          fetchCoupons(currentPage, limit, searchTerm);
        })
        .catch((err) => {
          toast.error(err || "Failed to delete coupon");
        });
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || "",
      validFrom: coupon.validFrom?.split("T")[0] || "",
      validUntil: coupon.validUntil?.split("T")[0] || "",
      usageLimit: coupon.usageLimit || "",
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setFormData({
      code: "",
      name: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      validFrom: "",
      validUntil: "",
      usageLimit: "",
      isActive: true,
    });
    setIsSubmitting(false);
  };

  const filteredCoupons = coupons?.filter(
    (coupon) =>
      coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge bg="success">Active</Badge>
    ) : (
      <Badge bg="secondary">Inactive</Badge>
    );
  };

  if (isLoading && !coupons?.length) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="coupon-management">
      <div className="management-header">
        <div>
          <h1>Coupons</h1>
          <p>Manage discount coupons</p>
          <span className="coupon-count">
            {coupons?.length || 0} coupons found
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="outline-secondary"
            onClick={handleRefresh}
            disabled={isLoading}
            style={{
              borderColor: "#2a2a2a",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RefreshCw size={18} className={isLoading ? "spin" : ""} />
            Refresh
          </Button>
          <Button className="btn-add-coupon" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Coupon
          </Button>
        </div>
      </div>

      <div className="management-controls">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>
          {filteredCoupons?.length || 0} coupons found
        </div>
      </div>

      <Card className="table-card">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Uses</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons?.length > 0 ? (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td className="coupon-code">
                        <Badge bg="dark" className="code-badge">
                          {coupon.code}
                        </Badge>
                      </td>
                      <td>{coupon.name}</td>
                      <td>
                        <strong>
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `PKR ${coupon.discountValue.toLocaleString()}`}
                        </strong>
                      </td>
                      <td>
                        {coupon.minOrderAmount
                          ? `PKR ${coupon.minOrderAmount.toLocaleString()}`
                          : "—"}
                      </td>
                      <td>
                        {coupon.usedCount || 0} / {coupon.usageLimit || "∞"}
                      </td>
                      <td>{getStatusBadge(coupon.isActive)}</td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <button
                            className="action-btn edit"
                            onClick={() => handleEdit(coupon)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(coupon._id)}
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
                    <td colSpan="7" className="text-center py-4 text-secondary">
                      {searchTerm
                        ? "No coupons match your search"
                        : "No coupons found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* ✅ Pagination */}
          {coupons && coupons.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil((coupons.length || 0) / limit)}
              totalItems={coupons.length || 0}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
              showItemsInfo={true}
              showPageNumbers={true}
              maxVisiblePages={5}
            />
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        className="admin-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCoupon ? "Edit Coupon" : "Add Coupon"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Coupon Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., SUMMER20"
                    required
                    disabled={!!editingCoupon}
                  />
                  {editingCoupon && (
                    <Form.Text className="text-muted">
                      Coupon code cannot be changed after creation
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Summer Sale 20%"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount Type</Form.Label>
                  <Form.Select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount Value *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: e.target.value,
                      })
                    }
                    placeholder={
                      formData.discountType === "percentage" ? "20" : "500"
                    }
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Min Order Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: e.target.value,
                      })
                    }
                    placeholder="1000"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Usage Limit</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    placeholder="Unlimited"
                    min="1"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valid From</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valid Until</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Active"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {editingCoupon ? "Updating..." : "Creating..."}
                </>
              ) : editingCoupon ? (
                "Update Coupon"
              ) : (
                "Create Coupon"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponManagement;

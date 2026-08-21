import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Tabs,
  Tab,
  Button,
  Form,
  Modal,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Settings,
  Edit2,
  Trash2,
  Plus,
  Shield,
  Award,
  ShoppingBag,
  Heart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

// Redux
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  deleteAccount,
  clearError,
  clearSuccess,
} from "../redux/slices/authSlice";
import { getOrders, cancelOrder } from "../redux/slices/orderSlice";
import { getWishlist } from "../redux/slices/wishlistSlice";

// Services
import api from "../services/api";

// Styles
import "../styles/pages/ProfilePage.css";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State
  const { user, isLoading, error, success } = useSelector(
    (state) => state.auth,
  );
  const { orders, isLoading: ordersLoading } = useSelector(
    (state) => state.orders,
  );
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  // Local State
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Form States
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const [addressData, setAddressData] = useState({
    name: "",
    phone: "",
    street: "",
    area: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Pakistan",
    landmark: "",
    isDefault: false,
    type: "home",
  });

  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Load Data
  useEffect(() => {
    dispatch(getCurrentUser());
    dispatch(getOrders());
    dispatch(getWishlist());
  }, [dispatch]);

  // Set profile form data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
      });
    }
  }, [user]);

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
    }
    if (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "An error occurred",
      );
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare data - only send fields that have changed
      const updateData = {};

      if (profileData.name !== user?.name && profileData.name.trim() !== "") {
        updateData.name = profileData.name.trim();
      }

      if (
        profileData.phone !== user?.phone &&
        profileData.phone.trim() !== ""
      ) {
        updateData.phone = profileData.phone.trim();
      }

      // Handle dateOfBirth - send null if empty
      if (profileData.dateOfBirth !== user?.dateOfBirth) {
        if (profileData.dateOfBirth === "" || !profileData.dateOfBirth) {
          updateData.dateOfBirth = null;
        } else {
          updateData.dateOfBirth = profileData.dateOfBirth;
        }
      }

      // Handle gender - send empty string if "prefer-not-to-say" or empty
      if (profileData.gender !== user?.gender) {
        if (
          profileData.gender === "" ||
          profileData.gender === "prefer-not-to-say"
        ) {
          updateData.gender = "";
        } else {
          updateData.gender = profileData.gender;
        }
      }

      // Only send if there are changes
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        setEditMode(false);
        setLoading(false);
        return;
      }

      await dispatch(updateProfile(updateData)).unwrap();
      toast.success("Profile updated successfully!");
      setEditMode(false);
      // Refresh user data
      dispatch(getCurrentUser());
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await dispatch(changePassword(passwordData)).unwrap();
      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
    } catch (error) {
      toast.error(error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!passwordData.currentPassword) {
      toast.error("Please enter your password to confirm");
      return;
    }
    setLoading(true);
    try {
      await dispatch(deleteAccount(passwordData.currentPassword)).unwrap();
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error) {
      toast.error(error || "Failed to delete account");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAddress) {
        await api.put(`/users/addresses/${editingAddress._id}`, addressData);
        toast.success("Address updated successfully!");
      } else {
        await api.post("/users/addresses", addressData);
        toast.success("Address added successfully!");
      }
      setShowAddressModal(false);
      setEditingAddress(null);
      setAddressData({
        name: "",
        phone: "",
        street: "",
        area: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Pakistan",
        landmark: "",
        isDefault: false,
        type: "home",
      });
      dispatch(getCurrentUser());
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || "Failed to save address",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;
    setLoading(true);
    try {
      await api.delete(`/users/addresses/${addressId}`);
      toast.success("Address deleted successfully!");
      dispatch(getCurrentUser());
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || "Failed to delete address",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    setLoading(true);
    try {
      await api.put(`/users/addresses/${addressId}`, { isDefault: true });
      toast.success("Default address updated!");
      dispatch(getCurrentUser());
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
          "Failed to update default address",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await dispatch(cancelOrder(orderId)).unwrap();
      toast.success("Order cancelled successfully!");
      dispatch(getOrders());
    } catch (error) {
      toast.error(error || "Failed to cancel order");
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      confirmed: "info",
      processing: "primary",
      packed: "secondary",
      shipped: "info",
      "out-for-delivery": "warning",
      delivered: "success",
      cancelled: "danger",
      refunded: "secondary",
    };
    const labels = {
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      packed: "Packed",
      shipped: "Shipped",
      "out-for-delivery": "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      refunded: "Refunded",
    };
    return {
      variant: variants[status] || "secondary",
      label: labels[status] || status,
    };
  };

  // ==========================================
  // RENDER FUNCTIONS
  // ==========================================

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Row className="g-4">
        {/* User Stats Cards */}
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon">
                <ShoppingBag size={24} />
              </div>
              <h6 className="stat-value">{user?.orderCount || 0}</h6>
              <p className="stat-label">Total Orders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon">
                <Award size={24} />
              </div>
              <h6 className="stat-value">{user?.loyaltyPoints || 0}</h6>
              <p className="stat-label">Loyalty Points</p>
              <Badge bg="gold" className="tier-badge">
                {user?.loyaltyTier || "Bronze"}
              </Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon">
                <Heart size={24} />
              </div>
              <h6 className="stat-value">{wishlistItems?.length || 0}</h6>
              <p className="stat-label">Wishlist Items</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon">
                <Package size={24} />
              </div>
              <h6 className="stat-value">
                {orders?.filter((o) => o.status === "delivered").length || 0}
              </h6>
              <p className="stat-label">Delivered Orders</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Row className="mt-4">
        <Col>
          <Card className="recent-orders-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-light">Recent Orders</h5>
              <Button
                variant="link"
                className="text-decoration-none text-danger"
                onClick={() => setActiveTab("orders")}
              >
                View All →
              </Button>
            </Card.Header>
            <Card.Body>
              {orders?.slice(0, 3).map((order) => (
                <div key={order._id} className="order-compact-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-0 fw-bold text-light">
                        #{order.orderNumber}
                      </p>
                      <small className="text-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="text-end">
                      <Badge bg={getStatusBadge(order.status).variant}>
                        {getStatusBadge(order.status).label}
                      </Badge>
                      <p className="mb-0 mt-1 text-light fw-bold">
                        Rs. {order.total?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {(!orders || orders.length === 0) && (
                <p className="text-muted text-center">No orders yet</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Default Address */}
      {user?.defaultAddress && (
        <Row className="mt-4">
          <Col>
            <Card className="default-address-card">
              <Card.Header>
                <h5 className="mb-0 text-light">Default Address</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-1 text-light">
                  <strong>{user.defaultAddress.name}</strong>
                </p>
                <p className="mb-1 text-light">{user.defaultAddress.street}</p>
                {user.defaultAddress.area && (
                  <p className="mb-1 text-light">{user.defaultAddress.area}</p>
                )}
                <p className="mb-0 text-light">
                  {user.defaultAddress.city}, {user.defaultAddress.state}{" "}
                  {user.defaultAddress.zipCode}
                </p>
                <p className="mb-0 text-muted">{user.defaultAddress.country}</p>
                <p className="mt-2">
                  <Badge bg="secondary">{user.defaultAddress.type}</Badge>
                  <Badge bg="success" className="ms-2">
                    Default
                  </Badge>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </motion.div>
  );

  const renderPersonalInfo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="profile-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-light">Personal Information</h5>
          {!editMode && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setEditMode(true)}
            >
              <Edit2 size={16} className="me-1" />
              Edit
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleProfileUpdate}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    disabled={!editMode}
                    className={
                      editMode
                        ? "form-control-dark"
                        : "form-control-dark-disabled"
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    disabled={!editMode}
                    className={
                      editMode
                        ? "form-control-dark"
                        : "form-control-dark-disabled"
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="form-control-dark-disabled"
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    value={profileData.dateOfBirth?.split("T")[0] || ""}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        dateOfBirth: e.target.value,
                      })
                    }
                    disabled={!editMode}
                    className={
                      editMode
                        ? "form-control-dark"
                        : "form-control-dark-disabled"
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Gender</Form.Label>
                  <Form.Select
                    value={profileData.gender || ""}
                    onChange={(e) =>
                      setProfileData({ ...profileData, gender: e.target.value })
                    }
                    disabled={!editMode}
                    className={
                      editMode
                        ? "form-control-dark"
                        : "form-control-dark-disabled"
                    }
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Account Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={user?.role || "customer"}
                    disabled
                    className="form-control-dark-disabled text-capitalize"
                  />
                </Form.Group>
              </Col>
            </Row>

            {editMode && (
              <div className="d-flex gap-2 mt-3">
                <Button type="submit" variant="danger" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : "Save Changes"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditMode(false);
                    setProfileData({
                      name: user?.name || "",
                      phone: user?.phone || "",
                      dateOfBirth: user?.dateOfBirth || "",
                      gender: user?.gender || "",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>
    </motion.div>
  );

  const renderAddresses = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="profile-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-light">My Addresses</h5>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setEditingAddress(null);
              setAddressData({
                name: "",
                phone: "",
                street: "",
                area: "",
                city: "",
                state: "",
                zipCode: "",
                country: "Pakistan",
                landmark: "",
                isDefault: false,
                type: "home",
              });
              setShowAddressModal(true);
            }}
          >
            <Plus size={16} className="me-1" />
            Add Address
          </Button>
        </Card.Header>
        <Card.Body>
          {user?.addresses?.length > 0 ? (
            <Row>
              {user.addresses.map((address) => (
                <Col md={6} key={address._id} className="mb-3">
                  <Card className="address-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1 text-light">{address.name}</h6>
                          <p className="text-muted small mb-2">
                            {address.phone}
                          </p>
                        </div>
                        {address.isDefault && (
                          <Badge bg="success" className="default-badge">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="address-details">
                        <p className="mb-1">{address.street}</p>
                        {address.area && <p className="mb-1">{address.area}</p>}
                        <p className="mb-1">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="mb-2">{address.country}</p>
                      </div>
                      <div className="d-flex gap-2 mt-2">
                        <Badge bg="secondary" className="address-type-badge">
                          {address.type}
                        </Badge>
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-transparent d-flex gap-2 flex-wrap">
                      {!address.isDefault && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleSetDefaultAddress(address._id)}
                          disabled={loading}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setEditingAddress(address);
                          setAddressData(address);
                          setShowAddressModal(true);
                        }}
                        disabled={loading}
                      >
                        <Edit2 size={14} className="me-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteAddress(address._id)}
                        disabled={loading}
                      >
                        <Trash2 size={14} className="me-1" />
                        Delete
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-4">
              <MapPin size={48} className="text-muted mb-3" />
              <p className="text-muted">No addresses added yet</p>
              <Button
                variant="danger"
                onClick={() => {
                  setEditingAddress(null);
                  setAddressData({
                    name: "",
                    phone: "",
                    street: "",
                    area: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "Pakistan",
                    landmark: "",
                    isDefault: false,
                    type: "home",
                  });
                  setShowAddressModal(true);
                }}
              >
                Add Your First Address
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </motion.div>
  );

  const renderOrders = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="profile-card">
        <Card.Header>
          <h5 className="mb-0 text-light">Order History</h5>
        </Card.Header>
        <Card.Body>
          {ordersLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="danger" />
            </div>
          ) : orders?.length > 0 ? (
            orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const isExpanded = expandedOrderId === order._id;
              return (
                <Card key={order._id} className="order-card mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start flex-wrap">
                      <div>
                        <h6 className="mb-1 text-light">
                          Order #{order.orderNumber}
                        </h6>
                        <small className="text-muted">
                          {new Date(order.createdAt).toLocaleDateString()} at{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </small>
                      </div>
                      <div className="text-end">
                        <Badge bg={statusInfo.variant} className="mb-1">
                          {statusInfo.label}
                        </Badge>
                        <h6 className="mb-0 mt-1 text-light">
                          Rs. {order.total?.toLocaleString()}
                        </h6>
                        {order.items && (
                          <small className="text-muted">
                            {order.items.length} items
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none text-danger"
                        onClick={() => toggleOrderExpand(order._id)}
                      >
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                        {isExpanded ? " Hide Details" : " View Details"}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3">
                        <hr className="border-secondary" />
                        <Row>
                          <Col md={6}>
                            <h6 className="text-light">Items</h6>
                            {order.items?.map((item, idx) => (
                              <div
                                key={idx}
                                className="order-item d-flex gap-3 mb-2"
                              >
                                <div>
                                  <p className="mb-0 text-light fw-bold">
                                    {item.name}
                                  </p>
                                  <small className="text-muted">
                                    Size: {item.size} × {item.quantity}
                                  </small>
                                </div>
                                <span className="ms-auto text-light">
                                  Rs. {item.total?.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </Col>
                          <Col md={6}>
                            <h6 className="text-light">Order Summary</h6>
                            <div className="order-summary">
                              <div className="d-flex justify-content-between">
                                <span className="text-light">Subtotal</span>
                                <span className="text-light">
                                  Rs. {order.subtotal?.toLocaleString()}
                                </span>
                              </div>
                              {order.productDiscount > 0 && (
                                <div className="d-flex justify-content-between text-success">
                                  <span>Product Discount</span>
                                  <span>
                                    -Rs.{" "}
                                    {order.productDiscount?.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {order.couponDiscount > 0 && (
                                <div className="d-flex justify-content-between text-success">
                                  <span>Coupon Discount</span>
                                  <span>
                                    -Rs.{" "}
                                    {order.couponDiscount?.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              <div className="d-flex justify-content-between">
                                <span className="text-light">Delivery Fee</span>
                                <span className="text-light">
                                  Rs. {order.shipping?.toLocaleString()}
                                </span>
                              </div>
                              <hr className="border-secondary" />
                              <div className="d-flex justify-content-between fw-bold">
                                <span className="text-light">Total</span>
                                <span className="text-light">
                                  Rs. {order.total?.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {order.coupon && (
                              <div className="mt-2">
                                <Badge bg="info">
                                  Coupon: {order.coupon.code}
                                </Badge>
                              </div>
                            )}

                            <div className="mt-2">
                              <small className="text-muted">
                                Payment: {order.paymentMethod || "N/A"}
                              </small>
                              <small className="text-muted ms-3">
                                Status: {order.paymentStatus || "N/A"}
                              </small>
                            </div>
                          </Col>
                        </Row>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div className="mt-3">
                            <h6 className="text-light">Shipping Address</h6>
                            <p className="mb-0 text-light">
                              {order.shippingAddress.name}
                            </p>
                            <p className="mb-0 text-light">
                              {order.shippingAddress.street}
                            </p>
                            {order.shippingAddress.area && (
                              <p className="mb-0 text-light">
                                {order.shippingAddress.area}
                              </p>
                            )}
                            <p className="mb-0 text-light">
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.state}{" "}
                              {order.shippingAddress.zipCode}
                            </p>
                            <p className="mb-0 text-light">
                              {order.shippingAddress.country}
                            </p>
                            <p className="mb-0 text-light">
                              Phone: {order.shippingAddress.phone}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-3 d-flex gap-2 flex-wrap">
                          {order.status !== "cancelled" &&
                            order.status !== "delivered" && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleCancelOrder(order._id)}
                                disabled={loading}
                              >
                                Cancel Order
                              </Button>
                            )}
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/orders/${order._id}`)}
                          >
                            View Details
                          </Button>
                          {order.invoiceUrl && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              href={order.invoiceUrl}
                              target="_blank"
                            >
                              Download Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-4">
              <Package size={48} className="text-muted mb-3" />
              <p className="text-muted">No orders yet</p>
              <Button variant="danger" onClick={() => navigate("/shop")}>
                Start Shopping
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </motion.div>
  );

  const renderAccountSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Row className="g-4">
        {/* Change Password */}
        <Col md={6}>
          <Card className="profile-card">
            <Card.Header>
              <h5 className="mb-0 text-light">
                <Shield size={18} className="me-2" />
                Change Password
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">
                    Current Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter current password"
                    className="form-control-dark"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password (min 8 characters)"
                    className="form-control-dark"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">
                    Confirm New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    className="form-control-dark"
                    value={passwordData.newPasswordConfirm}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPasswordConfirm: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Button
                  variant="danger"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Delete Account */}
        <Col md={6}>
          <Card className="danger-zone">
            <Card.Header className="text-danger">
              <h5 className="mb-0 text-danger">Danger Zone</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                <Trash2 size={16} className="me-2" />
                Delete Account
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (isLoading && !user) {
    return (
      <div className="profile-loading">
        <Spinner animation="border" variant="danger" />
        <p className="mt-3 text-muted">Loading profile...</p>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <Container fluid className="profile-page py-4">
      <Row>
        <Col lg={12}>
          {/* Profile Header - FIXED VISIBILITY */}
          <Card className="profile-header mb-4">
            <Card.Body className="d-flex align-items-center">
              <div className="profile-avatar">
                {user?.profilePicture?.url ? (
                  <img
                    src={user.profilePicture.url}
                    alt={user.name}
                    className="avatar-img"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <User size={40} />
                  </div>
                )}
              </div>
              <div className="profile-info ms-4">
                {/* Name - White and bold */}
                <h3
                  className="mb-1"
                  style={{ color: "#ffffff", fontWeight: "600" }}
                >
                  {user?.name}
                </h3>

                {/* Email - Light gray */}
                <p className="mb-1" style={{ color: "#d1d5db" }}>
                  <Mail
                    size={14}
                    className="me-2"
                    style={{ color: "#8b0000" }}
                  />
                  {user?.email}
                </p>

                {/* Phone - Light gray */}
                <p className="mb-0" style={{ color: "#d1d5db" }}>
                  <Phone
                    size={14}
                    className="me-2"
                    style={{ color: "#8b0000" }}
                  />
                  {user?.phone}
                </p>

                <div className="mt-2">
                  <Badge
                    bg="secondary"
                    className="me-2 text-capitalize"
                    style={{ backgroundColor: "#4b5563", color: "#ffffff" }}
                  >
                    {user?.role}
                  </Badge>
                  <Badge
                    style={{ backgroundColor: "#ffd700", color: "#000000" }}
                  >
                    {user?.loyaltyTier || "Bronze"}
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Tabs */}
          <Card className="profile-tabs-card">
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="profile-tabs"
                variant="pills"
              >
                <Tab
                  eventKey="overview"
                  title={
                    <span className="tab-title">
                      <User size={16} className="me-2" />
                      Overview
                    </span>
                  }
                >
                  <div className="p-4">{renderOverview()}</div>
                </Tab>

                <Tab
                  eventKey="personal"
                  title={
                    <span className="tab-title">
                      <Edit2 size={16} className="me-2" />
                      Personal Info
                    </span>
                  }
                >
                  <div className="p-4">{renderPersonalInfo()}</div>
                </Tab>

                <Tab
                  eventKey="addresses"
                  title={
                    <span className="tab-title">
                      <MapPin size={16} className="me-2" />
                      Addresses
                    </span>
                  }
                >
                  <div className="p-4">{renderAddresses()}</div>
                </Tab>

                <Tab
                  eventKey="orders"
                  title={
                    <span className="tab-title">
                      <Package size={16} className="me-2" />
                      Orders
                    </span>
                  }
                >
                  <div className="p-4">{renderOrders()}</div>
                </Tab>

                <Tab
                  eventKey="settings"
                  title={
                    <span className="tab-title">
                      <Settings size={16} className="me-2" />
                      Settings
                    </span>
                  }
                >
                  <div className="p-4">{renderAccountSettings()}</div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ========================================== */}
      {/* MODALS */}
      {/* ========================================== */}

      {/* Address Modal */}
      <Modal
        show={showAddressModal}
        onHide={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
        }}
        size="lg"
        centered
        className="profile-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-light">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddressSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    className="form-control-dark"
                    value={addressData.name}
                    onChange={(e) =>
                      setAddressData({ ...addressData, name: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Phone *</Form.Label>
                  <Form.Control
                    type="tel"
                    className="form-control-dark"
                    value={addressData.phone}
                    onChange={(e) =>
                      setAddressData({ ...addressData, phone: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="text-light">Street Address *</Form.Label>
              <Form.Control
                type="text"
                className="form-control-dark"
                value={addressData.street}
                onChange={(e) =>
                  setAddressData({ ...addressData, street: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-light">Area / Colony</Form.Label>
              <Form.Control
                type="text"
                className="form-control-dark"
                value={addressData.area}
                onChange={(e) =>
                  setAddressData({ ...addressData, area: e.target.value })
                }
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">City *</Form.Label>
                  <Form.Control
                    type="text"
                    className="form-control-dark"
                    value={addressData.city}
                    onChange={(e) =>
                      setAddressData({ ...addressData, city: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">State *</Form.Label>
                  <Form.Control
                    type="text"
                    className="form-control-dark"
                    value={addressData.state}
                    onChange={(e) =>
                      setAddressData({ ...addressData, state: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">ZIP Code *</Form.Label>
                  <Form.Control
                    type="text"
                    className="form-control-dark"
                    value={addressData.zipCode}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        zipCode: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Country</Form.Label>
                  <Form.Control
                    type="text"
                    className="form-control-dark"
                    value={addressData.country}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        country: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Landmark</Form.Label>
                  <Form.Control
                    type="text"
                    className="form-control-dark"
                    value={addressData.landmark}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        landmark: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Address Type</Form.Label>
                  <Form.Select
                    className="form-control-dark"
                    value={addressData.type}
                    onChange={(e) =>
                      setAddressData({ ...addressData, type: e.target.value })
                    }
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Set as default address"
                    className="text-light"
                    checked={addressData.isDefault}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        isDefault: e.target.checked,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddressModal(false);
                setEditingAddress(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={loading}>
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : editingAddress ? (
                "Update Address"
              ) : (
                "Add Address"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        show={showPasswordModal}
        onHide={() => {
          setShowPasswordModal(false);
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            newPasswordConfirm: "",
          });
        }}
        centered
        className="profile-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-light">Change Password</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordChange}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="text-light">Current Password</Form.Label>
              <Form.Control
                type="password"
                className="form-control-dark"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="text-light">
                New Password (min 8 characters)
              </Form.Label>
              <Form.Control
                type="password"
                className="form-control-dark"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
                minLength={8}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="text-light">
                Confirm New Password
              </Form.Label>
              <Form.Control
                type="password"
                className="form-control-dark"
                value={passwordData.newPasswordConfirm}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPasswordConfirm: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  newPasswordConfirm: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={loading}>
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                "Change Password"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className="profile-modal"
      >
        <Modal.Header closeButton className="text-danger">
          <Modal.Title className="text-danger">Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>Warning:</strong> This action cannot be undone. All your
            data including orders, wishlist, and profile information will be
            permanently deleted.
          </Alert>
          <Form.Group>
            <Form.Label className="text-light">
              Enter your password to confirm
            </Form.Label>
            <Form.Control
              type="password"
              className="form-control-dark"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              placeholder="Enter your password"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={!passwordData.currentPassword || loading}
          >
            {loading ? (
              <Spinner size="sm" animation="border" />
            ) : (
              "Delete Account"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProfilePage;

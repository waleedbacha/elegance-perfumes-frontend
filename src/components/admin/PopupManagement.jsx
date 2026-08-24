// frontend/src/components/admin/PopupManagement.jsx

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Badge,
  Modal,
  Row,
  Col,
  Tabs,
  Tab,
} from "react-bootstrap";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Power,
  PowerOff,
  Image,
  Calendar,
  Users,
  Percent,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPopups,
  createPopup,
  updatePopup,
  deletePopup,
  togglePopupStatus,
} from "../../redux/slices/popupSlice";
import toast from "react-hot-toast";
import "../../styles/pages/PopupManagement.css";

const PopupManagement = () => {
  const dispatch = useDispatch();
  const { popups, isLoading } = useSelector((state) => state.popups);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    subtitle: "",
    description: "",
    triggerDelay: 5000,
    triggerType: "delay",
    status: "active",
    useImage: false,
    primaryButton: {
      text: "Shop Now",
      url: "/shop",
      openInNewTab: false,
    },
    secondaryButton: {
      text: "Maybe Later",
      show: true,
    },
    coupon: {
      code: "",
      autoGenerate: true,
      discountValue: 10,
      discountType: "percentage",
      minOrderAmount: 0,
      usageLimit: 100,
      expiresInDays: 30,
    },
    targeting: {
      newUsersOnly: true,
      returningUsers: false,
      userSegments: ["all"],
      pages: ["homepage", "shop", "collections"],
    },
    frequency: "once",
    dismissible: true,
    showCloseButton: true,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    scheduleType: "always",
    priority: 0,
    style: {
      backgroundColor: "#1a1a1a",
      textColor: "#ffffff",
      accentColor: "#8b0000",
      buttonColor: "#8b0000",
      buttonTextColor: "#ffffff",
      borderRadius: "16px",
      size: "medium",
      position: "center",
    },
  });

  useEffect(() => {
    dispatch(getPopups());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.title) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const popupData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (
          key === "primaryButton" ||
          key === "secondaryButton" ||
          key === "coupon" ||
          key === "targeting" ||
          key === "style"
        ) {
          popupData.append(key, JSON.stringify(formData[key]));
        } else if (
          formData[key] !== undefined &&
          formData[key] !== null &&
          formData[key] !== ""
        ) {
          popupData.append(key, formData[key]);
        }
      });

      if (selectedImage) {
        popupData.append("image", selectedImage);
      }

      let result;
      if (editingPopup) {
        result = await dispatch(
          updatePopup({ id: editingPopup._id, popupData }),
        ).unwrap();
        toast.success("Popup updated successfully!");
      } else {
        result = await dispatch(createPopup(popupData)).unwrap();
        toast.success("Popup created successfully!");
      }

      handleCloseModal();
      dispatch(getPopups());
    } catch (error) {
      console.error("❌ Popup error:", error);
      toast.error(error || "Failed to save popup");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this popup?")) {
      dispatch(deletePopup(id))
        .unwrap()
        .then(() => {
          toast.success("Popup deleted successfully!");
          dispatch(getPopups());
        })
        .catch((err) => {
          toast.error(err || "Failed to delete popup");
        });
    }
  };

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setTogglingId(id);
    dispatch(togglePopupStatus({ id, status: newStatus }))
      .unwrap()
      .then(() => {
        toast.success(
          `Popup ${newStatus === "active" ? "activated" : "deactivated"}!`,
        );
        dispatch(getPopups());
      })
      .catch((err) => {
        toast.error(err || "Failed to toggle status");
      })
      .finally(() => {
        setTogglingId(null);
      });
  };

  const handleEdit = (popup) => {
    setEditingPopup(popup);
    setFormData({
      name: popup.name || "",
      title: popup.title || "",
      subtitle: popup.subtitle || "",
      description: popup.description || "",
      triggerDelay: popup.triggerDelay || 5000,
      triggerType: popup.triggerType || "delay",
      status: popup.status || "active",
      useImage: popup.useImage || false,
      primaryButton: popup.primaryButton || {
        text: "Shop Now",
        url: "/shop",
        openInNewTab: false,
      },
      secondaryButton: popup.secondaryButton || {
        text: "Maybe Later",
        show: true,
      },
      coupon: popup.coupon || {
        code: "",
        autoGenerate: true,
        discountValue: 10,
        discountType: "percentage",
        minOrderAmount: 0,
        usageLimit: 100,
        expiresInDays: 30,
      },
      targeting: popup.targeting || {
        newUsersOnly: true,
        returningUsers: false,
        userSegments: ["all"],
        pages: ["homepage", "shop", "collections"],
      },
      frequency: popup.frequency || "once",
      dismissible: popup.dismissible !== undefined ? popup.dismissible : true,
      showCloseButton:
        popup.showCloseButton !== undefined ? popup.showCloseButton : true,
      startDate:
        popup.startDate?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      endDate: popup.endDate?.split("T")[0] || "",
      scheduleType: popup.scheduleType || "always",
      priority: popup.priority || 0,
      style: popup.style || {
        backgroundColor: "#1a1a1a",
        textColor: "#ffffff",
        accentColor: "#8b0000",
        buttonColor: "#8b0000",
        buttonTextColor: "#ffffff",
        borderRadius: "16px",
        size: "medium",
        position: "center",
      },
    });
    setImagePreview(popup.image?.url || null);
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPopup(null);
    setSelectedImage(null);
    setImagePreview(null);
    setIsSubmitting(false);
    setActiveTab("basic");
    setFormData({
      name: "",
      title: "",
      subtitle: "",
      description: "",
      triggerDelay: 5000,
      triggerType: "delay",
      status: "active",
      useImage: false,
      primaryButton: { text: "Shop Now", url: "/shop", openInNewTab: false },
      secondaryButton: { text: "Maybe Later", show: true },
      coupon: {
        code: "",
        autoGenerate: true,
        discountValue: 10,
        discountType: "percentage",
        minOrderAmount: 0,
        usageLimit: 100,
        expiresInDays: 30,
      },
      targeting: {
        newUsersOnly: true,
        returningUsers: false,
        userSegments: ["all"],
        pages: ["homepage", "shop", "collections"],
      },
      frequency: "once",
      dismissible: true,
      showCloseButton: true,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      scheduleType: "always",
      priority: 0,
      style: {
        backgroundColor: "#1a1a1a",
        textColor: "#ffffff",
        accentColor: "#8b0000",
        buttonColor: "#8b0000",
        buttonTextColor: "#ffffff",
        borderRadius: "16px",
        size: "medium",
        position: "center",
      },
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPG, PNG, WebP, GIF)");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const filteredPopups = popups?.filter(
    (popup) =>
      popup.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      popup.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { variant: "success", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      scheduled: { variant: "warning", label: "Scheduled" },
      expired: { variant: "danger", label: "Expired" },
    };
    const info = statusMap[status] || statusMap.inactive;
    return <Badge bg={info.variant}>{info.label}</Badge>;
  };

  const getTargetingLabel = (targeting) => {
    if (targeting?.newUsersOnly) return "New Users";
    if (targeting?.returningUsers) return "Returning Users";
    return "All Users";
  };

  if (isLoading && !popups?.length) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading popups...</p>
      </div>
    );
  }

  return (
    <div className="popup-management">
      <div className="management-header">
        <div>
          <h1>Popups</h1>
          <p>Manage promotional popups</p>
          <span className="popup-count">
            {popups?.length || 0} popups found
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="outline-secondary"
            onClick={() => {
              dispatch(getPopups());
              toast.success("Refreshing popups...");
            }}
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
          <Button className="btn-add-popup" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Popup
          </Button>
        </div>
      </div>

      <div className="management-controls">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search popups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>
          {filteredPopups?.length || 0} popups found
        </div>
      </div>

      <Card className="table-card">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="admin-table">
              <thead>
                <tr>
                  <th>Popup</th>
                  <th>Targeting</th>
                  <th>Trigger</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Analytics</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPopups?.length > 0 ? (
                  filteredPopups.map((popup) => (
                    <tr key={popup._id}>
                      <td>
                        <div className="popup-name-cell">
                          {popup.useImage && popup.image?.url ? (
                            <img
                              src={popup.image.url}
                              alt={popup.title}
                              className="popup-thumb"
                            />
                          ) : (
                            <div className="popup-thumb-placeholder">
                              <Percent size={20} />
                            </div>
                          )}
                          <div>
                            <div className="popup-title">{popup.title}</div>
                            <div className="popup-subtitle">{popup.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="info" className="targeting-badge">
                          {getTargetingLabel(popup.targeting)}
                        </Badge>
                      </td>
                      <td>
                        <span className="trigger-info">
                          <Clock size={14} />
                          {(popup.triggerDelay / 1000).toFixed(1)}s
                        </span>
                      </td>
                      <td>{popup.priority || 0}</td>
                      <td>{getStatusBadge(popup.status)}</td>
                      <td>
                        <div className="analytics-stats">
                          <span className="stat">
                            <Eye size={12} /> {popup.analytics?.views || 0}
                          </span>
                          <span className="stat">
                            <Users size={12} /> {popup.analytics?.clicks || 0}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <button
                            className={`action-btn toggle ${popup.status === "active" ? "active" : "inactive"}`}
                            onClick={() =>
                              handleToggleStatus(popup._id, popup.status)
                            }
                            disabled={togglingId === popup._id}
                            title={
                              popup.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            {togglingId === popup._id ? (
                              <span className="spinner-sm" />
                            ) : popup.status === "active" ? (
                              <Power size={16} />
                            ) : (
                              <PowerOff size={16} />
                            )}
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => handleEdit(popup)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(popup._id)}
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
                        ? "No popups match your search"
                        : "No popups found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        className="admin-modal"
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingPopup ? "Edit Popup" : "Add Popup"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="popup-tabs mb-3"
            >
              <Tab eventKey="basic" title="Basic Info">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Summer Sale Popup"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="🎉 Summer Sale!"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Subtitle</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="Get 20% off on all fragrances"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Use code SUMMER20 at checkout..."
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Trigger Delay (seconds)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.triggerDelay / 1000}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            triggerDelay: parseInt(e.target.value) * 1000,
                          })
                        }
                        min="1"
                        max="30"
                      />
                      <Form.Text className="text-muted">
                        How long to wait before showing popup
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Priority</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max="100"
                      />
                      <Form.Text className="text-muted">
                        Higher priority popups show first
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="targeting" title="Targeting">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Target Audience</Form.Label>
                      <Form.Select
                        value={
                          formData.targeting.newUsersOnly
                            ? "new"
                            : formData.targeting.returningUsers
                              ? "returning"
                              : "all"
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({
                            ...formData,
                            targeting: {
                              ...formData.targeting,
                              newUsersOnly: value === "new",
                              returningUsers: value === "returning",
                            },
                          });
                        }}
                      >
                        <option value="all">All Users</option>
                        <option value="new">New Users Only</option>
                        <option value="returning">Returning Users Only</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Frequency</Form.Label>
                      <Form.Select
                        value={formData.frequency}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            frequency: e.target.value,
                          })
                        }
                      >
                        <option value="once">Once per session</option>
                        <option value="daily">Once per day</option>
                        <option value="weekly">Once per week</option>
                        <option value="monthly">Once per month</option>
                        <option value="always">Always show</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Show on Pages</Form.Label>
                  <Form.Select
                    multiple
                    value={formData.targeting.pages}
                    onChange={(e) => {
                      const options = e.target.options;
                      const values = [];
                      for (let i = 0; i < options.length; i++) {
                        if (options[i].selected) values.push(options[i].value);
                      }
                      setFormData({
                        ...formData,
                        targeting: { ...formData.targeting, pages: values },
                      });
                    }}
                  >
                    <option value="homepage">Homepage</option>
                    <option value="shop">Shop</option>
                    <option value="collections">Collections</option>
                    <option value="product">Product</option>
                    <option value="cart">Cart</option>
                    <option value="checkout">Checkout</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Hold Ctrl/Cmd to select multiple
                  </Form.Text>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        label="Dismissible"
                        checked={formData.dismissible}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dismissible: e.target.checked,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        label="Show Close Button"
                        checked={formData.showCloseButton}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            showCloseButton: e.target.checked,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Schedule Type</Form.Label>
                      <Form.Select
                        value={formData.scheduleType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scheduleType: e.target.value,
                          })
                        }
                      >
                        <option value="always">Always Active</option>
                        <option value="scheduled">Scheduled</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  {formData.scheduleType === "scheduled" && (
                    <>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Start Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                startDate: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>End Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={formData.endDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                endDate: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                    </>
                  )}
                </Row>
              </Tab>

              <Tab eventKey="coupon" title="Coupon">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        label="Auto Generate Coupon"
                        checked={formData.coupon.autoGenerate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coupon: {
                              ...formData.coupon,
                              autoGenerate: e.target.checked,
                            },
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                  {!formData.coupon.autoGenerate && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Coupon Code</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.coupon.code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              coupon: {
                                ...formData.coupon,
                                code: e.target.value.toUpperCase(),
                              },
                            })
                          }
                          placeholder="SUMMER20"
                        />
                      </Form.Group>
                    </Col>
                  )}
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount Type</Form.Label>
                      <Form.Select
                        value={formData.coupon.discountType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coupon: {
                              ...formData.coupon,
                              discountType: e.target.value,
                            },
                          })
                        }
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount Value</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.coupon.discountValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coupon: {
                              ...formData.coupon,
                              discountValue: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Min Order Amount</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.coupon.minOrderAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coupon: {
                              ...formData.coupon,
                              minOrderAmount: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Usage Limit</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.coupon.usageLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coupon: {
                              ...formData.coupon,
                              usageLimit: parseInt(e.target.value) || 100,
                            },
                          })
                        }
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expires In (Days)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.coupon.expiresInDays}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coupon: {
                              ...formData.coupon,
                              expiresInDays: parseInt(e.target.value) || 30,
                            },
                          })
                        }
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="buttons" title="Buttons & Styling">
                <h6 className="text-light mb-3">Primary Button</h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Button Text</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.primaryButton.text}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryButton: {
                              ...formData.primaryButton,
                              text: e.target.value,
                            },
                          })
                        }
                        placeholder="Shop Now"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Button URL</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.primaryButton.url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryButton: {
                              ...formData.primaryButton,
                              url: e.target.value,
                            },
                          })
                        }
                        placeholder="/shop"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h6 className="text-light mb-3">Secondary Button</h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Button Text</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.secondaryButton.text}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secondaryButton: {
                              ...formData.secondaryButton,
                              text: e.target.value,
                            },
                          })
                        }
                        placeholder="Maybe Later"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        label="Show Secondary Button"
                        checked={formData.secondaryButton.show}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secondaryButton: {
                              ...formData.secondaryButton,
                              show: e.target.checked,
                            },
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr />

                <h6 className="text-light mb-3">Style Settings</h6>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Background Color</Form.Label>
                      <Form.Control
                        type="color"
                        value={formData.style.backgroundColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            style: {
                              ...formData.style,
                              backgroundColor: e.target.value,
                            },
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Text Color</Form.Label>
                      <Form.Control
                        type="color"
                        value={formData.style.textColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            style: {
                              ...formData.style,
                              textColor: e.target.value,
                            },
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Accent Color</Form.Label>
                      <Form.Control
                        type="color"
                        value={formData.style.accentColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            style: {
                              ...formData.style,
                              accentColor: e.target.value,
                            },
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Popup Size</Form.Label>
                      <Form.Select
                        value={formData.style.size}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            style: { ...formData.style, size: e.target.value },
                          })
                        }
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Position</Form.Label>
                      <Form.Select
                        value={formData.style.position}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            style: {
                              ...formData.style,
                              position: e.target.value,
                            },
                          })
                        }
                      >
                        <option value="center">Center</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Border Radius</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.style.borderRadius}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            style: {
                              ...formData.style,
                              borderRadius: e.target.value,
                            },
                          })
                        }
                        placeholder="16px"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="image" title="Image">
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Use Image"
                    checked={formData.useImage}
                    onChange={(e) =>
                      setFormData({ ...formData, useImage: e.target.checked })
                    }
                  />
                </Form.Group>

                {formData.useImage && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Popup Image</Form.Label>
                      <div className="popup-upload-area">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleImageChange}
                          className="popup-upload-input"
                          id="popupImage"
                        />
                        <label
                          htmlFor="popupImage"
                          className="popup-upload-label"
                        >
                          <Image size={24} />
                          <span>Click to upload image</span>
                          <small>Max 5MB (JPG, PNG, WebP, GIF)</small>
                        </label>
                      </div>
                    </Form.Group>

                    {imagePreview && (
                      <div className="popup-image-preview">
                        <img
                          src={imagePreview}
                          alt="Popup preview"
                          className="popup-preview-image"
                        />
                        <button
                          type="button"
                          className="popup-preview-remove"
                          onClick={() => {
                            setImagePreview(null);
                            setSelectedImage(null);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {editingPopup &&
                      !imagePreview &&
                      editingPopup.image?.url && (
                        <div className="popup-image-preview">
                          <img
                            src={editingPopup.image.url}
                            alt="Current popup"
                            className="popup-preview-image"
                          />
                          <div className="popup-current-label">
                            Current Image
                          </div>
                        </div>
                      )}
                  </>
                )}
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {editingPopup ? "Updating..." : "Creating..."}
                </>
              ) : editingPopup ? (
                "Update Popup"
              ) : (
                "Create Popup"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default PopupManagement;

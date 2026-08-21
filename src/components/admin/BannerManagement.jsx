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
  Eye,
  Image,
  Calendar,
  RefreshCw,
  Power,
  PowerOff,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from "../../redux/slices/bannerSlice";
import toast from "react-hot-toast";
import "../../styles/pages/BannerManagement.css";

const BannerManagement = () => {
  const dispatch = useDispatch();
  const { banners, isLoading } = useSelector((state) => state.banners);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link: "",
    position: "hero",
    section: "homepage",
    order: 0,
    status: "active",
  });

  useEffect(() => {
    dispatch(getBanners());
  }, [dispatch]);

  // ✅ Toggle banner status
  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activate" : "deactivate";

    if (window.confirm(`Are you sure you want to ${action} this banner?`)) {
      setTogglingId(id);
      dispatch(toggleBannerStatus({ id, status: newStatus }))
        .unwrap()
        .then(() => {
          toast.success(
            `Banner ${newStatus === "active" ? "activated" : "deactivated"} successfully!`,
          );
          dispatch(getBanners());
        })
        .catch((err) => {
          toast.error(err || "Failed to toggle banner status");
        })
        .finally(() => {
          setTogglingId(null);
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!editingBanner && !selectedImage) {
      toast.error("Please select a banner image");
      return;
    }

    setIsSubmitting(true);

    try {
      const bannerData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (
          formData[key] !== undefined &&
          formData[key] !== null &&
          formData[key] !== ""
        ) {
          bannerData.append(key, formData[key]);
        }
      });

      if (selectedImage) {
        bannerData.append("image", selectedImage);
      }

      let result;
      if (editingBanner) {
        result = await dispatch(
          updateBanner({ id: editingBanner._id, bannerData }),
        ).unwrap();
        toast.success("Banner updated successfully!");
      } else {
        result = await dispatch(createBanner(bannerData)).unwrap();
        toast.success("Banner created successfully!");
      }

      handleCloseModal();
      dispatch(getBanners());
    } catch (error) {
      console.error("❌ Banner error:", error);
      toast.error(error || "Failed to save banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      dispatch(deleteBanner(id))
        .unwrap()
        .then(() => {
          toast.success("Banner deleted successfully!");
          dispatch(getBanners());
        })
        .catch((err) => {
          toast.error(err || "Failed to delete banner");
        });
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      link: banner.link?.url || "",
      position: banner.position || "hero",
      section: banner.section || "homepage",
      order: banner.order || 0,
      status: banner.status || "active",
    });
    setImagePreview(banner.image?.url || null);
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setSelectedImage(null);
    setImagePreview(null);
    setIsSubmitting(false);
    setFormData({
      title: "",
      subtitle: "",
      link: "",
      position: "hero",
      section: "homepage",
      order: 0,
      status: "active",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const handleRefresh = () => {
    dispatch(getBanners());
    toast.success("Refreshing banners...");
  };

  const filteredBanners = banners?.filter(
    (banner) =>
      banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()),
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

  if (isLoading && !banners?.length) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading banners...</p>
      </div>
    );
  }

  return (
    <div className="banner-management">
      <div className="management-header">
        <div>
          <h1>Banners</h1>
          <p>Manage promotional banners</p>
          <span className="banner-count">
            {banners?.length || 0} banners found
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
          <Button className="btn-add-banner" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Banner
          </Button>
        </div>
      </div>

      <div className="management-controls">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>
          {filteredBanners?.length || 0} banners found
        </div>
      </div>

      <Card className="table-card">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="admin-table">
              <thead>
                <tr>
                  <th>Banner</th>
                  <th>Position</th>
                  <th>Section</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBanners?.length > 0 ? (
                  filteredBanners.map((banner) => (
                    <tr key={banner._id}>
                      <td>
                        <div className="banner-name-cell">
                          {banner.image?.url ? (
                            <img
                              src={banner.image.url}
                              alt={banner.title}
                              className="banner-thumb"
                            />
                          ) : (
                            <div className="banner-thumb-placeholder">
                              <Image size={20} />
                            </div>
                          )}
                          <div>
                            <div className="banner-title">{banner.title}</div>
                            <div className="banner-subtitle">
                              {banner.subtitle || "No subtitle"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="capitalize">{banner.position}</td>
                      <td className="capitalize">
                        {banner.section || "homepage"}
                      </td>
                      <td>{banner.order || 0}</td>
                      <td>
                        <div className="status-cell">
                          {getStatusBadge(banner.status)}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="action-buttons">
                          {/* ✅ Toggle Status Button */}
                          <button
                            className={`action-btn toggle ${banner.status === "active" ? "active" : "inactive"}`}
                            onClick={() =>
                              handleToggleStatus(banner._id, banner.status)
                            }
                            disabled={togglingId === banner._id}
                            title={
                              banner.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            {togglingId === banner._id ? (
                              <span className="spinner-sm" />
                            ) : banner.status === "active" ? (
                              <Power size={16} />
                            ) : (
                              <PowerOff size={16} />
                            )}
                          </button>

                          <button
                            className="action-btn view"
                            onClick={() => {
                              if (banner.link?.url) {
                                window.open(banner.link.url, "_blank");
                              } else {
                                toast.info(
                                  "No link configured for this banner",
                                );
                              }
                            }}
                            title="Preview"
                            disabled={!banner.link?.url}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            className="action-btn edit"
                            onClick={() => handleEdit(banner)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(banner._id)}
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
                    <td colSpan="6" className="text-center py-4 text-secondary">
                      {searchTerm
                        ? "No banners match your search"
                        : "No banners found"}
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
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingBanner ? "Edit Banner" : "Add Banner"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Summer Sale"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subtitle</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="Up to 50% off"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Link URL</Form.Label>
              <Form.Control
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="https://elegance.pk/collections"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Position</Form.Label>
                  <Form.Select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                  >
                    <option value="hero">Hero</option>
                    <option value="category">Category</option>
                    <option value="promo">Promo</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="footer">Footer</option>
                    <option value="popup">Popup</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Section</Form.Label>
                  <Form.Select
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value })
                    }
                  >
                    <option value="homepage">Homepage</option>
                    <option value="shop">Shop</option>
                    <option value="category">Category</option>
                    <option value="product">Product</option>
                    <option value="checkout">Checkout</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Order</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: e.target.value })
                    }
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="scheduled">Scheduled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Image Upload */}
            <Form.Group className="mb-3">
              <Form.Label>
                Banner Image{" "}
                {!editingBanner && <span className="text-danger">*</span>}
              </Form.Label>
              <div className="banner-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="banner-upload-input"
                  id="bannerImage"
                />
                <label htmlFor="bannerImage" className="banner-upload-label">
                  <Image size={24} />
                  <span>Click to upload banner image</span>
                  <small>Max 5MB (JPG, PNG, WebP, GIF)</small>
                </label>
              </div>
              {imagePreview && (
                <div className="banner-preview-container">
                  <img
                    src={imagePreview}
                    alt="Banner preview"
                    className="banner-preview"
                  />
                  <button
                    type="button"
                    className="banner-preview-remove"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedImage(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              {editingBanner && !imagePreview && editingBanner.image?.url && (
                <div className="banner-preview-container">
                  <img
                    src={editingBanner.image.url}
                    alt="Current banner"
                    className="banner-preview"
                  />
                  <div className="banner-current-label">Current Image</div>
                </div>
              )}
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
                  {editingBanner ? "Updating..." : "Creating..."}
                </>
              ) : editingBanner ? (
                "Update Banner"
              ) : (
                "Create Banner"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default BannerManagement;

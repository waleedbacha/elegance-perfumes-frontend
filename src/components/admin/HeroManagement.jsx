import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Modal,
  Badge,
  Row,
  Col,
} from "react-bootstrap";
import {
  Plus,
  Edit,
  Trash2,
  Image,
  X,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllHeroes,
  createHero,
  updateHero,
  deleteHero,
  seedHero,
  toggleHeroStatus,
  clearSuccess,
  clearError,
} from "../../redux/slices/heroSlice";
import toast from "react-hot-toast";
import "../../styles/pages/HeroManagement.css";

const HeroManagement = () => {
  const dispatch = useDispatch();
  const { heroes, isLoading, success, error } = useSelector(
    (state) => state.hero,
  );

  const [showModal, setShowModal] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "Shop Now",
    buttonLink: "/shop",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "/collections",
    features: [
      { icon: "✓", label: "Authentic", subLabel: "100% Original" },
      { icon: "✓", label: "Fast Delivery", subLabel: "Across Pakistan" },
      { icon: "✓", label: "Secure Payment", subLabel: "100% Safe" },
    ],
    isActive: true,
    isDefault: false,
    order: 0,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuresText, setFeaturesText] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(getAllHeroes());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeaturesChange = (e) => {
    setFeaturesText(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      setFormData((prev) => ({ ...prev, features: parsed }));
    } catch (error) {
      // Invalid JSON, keep as is
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("subtitle", formData.subtitle || "");
      formDataToSend.append("description", formData.description);
      formDataToSend.append("buttonText", formData.buttonText);
      formDataToSend.append("buttonLink", formData.buttonLink);
      formDataToSend.append(
        "secondaryButtonText",
        formData.secondaryButtonText,
      );
      formDataToSend.append(
        "secondaryButtonLink",
        formData.secondaryButtonLink,
      );
      formDataToSend.append("features", JSON.stringify(formData.features));
      formDataToSend.append("isActive", formData.isActive);
      formDataToSend.append("isDefault", formData.isDefault);
      formDataToSend.append("order", formData.order);

      if (selectedFile) {
        formDataToSend.append("backgroundImage", selectedFile);
      }

      if (editingHero) {
        await dispatch(
          updateHero({
            id: editingHero._id,
            formData: formDataToSend,
          }),
        ).unwrap();
      } else {
        await dispatch(createHero(formDataToSend)).unwrap();
      }

      handleCloseModal();
      dispatch(getAllHeroes());
    } catch (error) {
      // Error handled by slice
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (hero) => {
    setEditingHero(hero);
    setFormData({
      title: hero.title || "",
      subtitle: hero.subtitle || "",
      description: hero.description || "",
      buttonText: hero.buttonText || "Shop Now",
      buttonLink: hero.buttonLink || "/shop",
      secondaryButtonText: hero.secondaryButtonText || "Learn More",
      secondaryButtonLink: hero.secondaryButtonLink || "/collections",
      features: hero.features || [
        { icon: "✓", label: "Authentic", subLabel: "100% Original" },
        { icon: "✓", label: "Fast Delivery", subLabel: "Across Pakistan" },
        { icon: "✓", label: "Secure Payment", subLabel: "100% Safe" },
      ],
      isActive: hero.isActive !== false,
      isDefault: hero.isDefault || false,
      order: hero.order || 0,
    });
    setFeaturesText(JSON.stringify(hero.features, null, 2));
    setImagePreview(hero.backgroundImage?.url || null);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this hero?")) {
      try {
        await dispatch(deleteHero(id)).unwrap();
        dispatch(getAllHeroes());
      } catch (error) {
        // Error handled by slice
      }
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await dispatch(toggleHeroStatus({ id, isActive: !isActive })).unwrap();
      dispatch(getAllHeroes());
    } catch (error) {
      // Error handled by slice
    }
  };

  const handleSeed = async () => {
    if (window.confirm("This will create a default hero. Continue?")) {
      try {
        await dispatch(seedHero()).unwrap();
        dispatch(getAllHeroes());
      } catch (error) {
        // Error handled by slice
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHero(null);
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      secondaryButtonText: "Learn More",
      secondaryButtonLink: "/collections",
      features: [
        { icon: "✓", label: "Authentic", subLabel: "100% Original" },
        { icon: "✓", label: "Fast Delivery", subLabel: "Across Pakistan" },
        { icon: "✓", label: "Secure Payment", subLabel: "100% Safe" },
      ],
      isActive: true,
      isDefault: false,
      order: 0,
    });
    setFeaturesText("");
    setSelectedFile(null);
    setImagePreview(null);
    setIsSubmitting(false);
  };

  if (isLoading && !heroes?.length) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading heroes...</p>
      </div>
    );
  }

  return (
    <div className="hero-management">
      <div className="management-header">
        <div>
          <h1>Hero Section</h1>
          <p>Manage your homepage hero section</p>
          <span className="hero-count">{heroes?.length || 0} heroes</span>
        </div>
        <div className="header-actions">
          <Button
            variant="outline-secondary"
            onClick={handleSeed}
            disabled={isLoading}
            className="seed-btn"
          >
            <RefreshCw size={16} />
            Seed Default
          </Button>
          <Button className="btn-add-hero" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Hero
          </Button>
        </div>
      </div>

      <Card className="table-card">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Default</th>
                  <th>Order</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {heroes?.length > 0 ? (
                  heroes.map((hero) => (
                    <tr key={hero._id}>
                      <td>
                        <div className="hero-image-cell">
                          <img
                            src={
                              hero.backgroundImage?.url ||
                              "https://via.placeholder.com/50"
                            }
                            alt={hero.title}
                            className="hero-thumb"
                          />
                        </div>
                      </td>
                      <td>
                        <div className="hero-title-cell">
                          <strong>{hero.title}</strong>
                          <span className="hero-subtitle">{hero.subtitle}</span>
                        </div>
                      </td>
                      <td className="description-cell">{hero.description}</td>
                      <td>
                        <Badge bg={hero.isActive ? "success" : "secondary"}>
                          {hero.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td>
                        {hero.isDefault ? (
                          <Badge bg="warning">Default</Badge>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>{hero.order || 0}</td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <button
                            className="action-btn toggle"
                            onClick={() =>
                              handleToggle(hero._id, hero.isActive)
                            }
                            title={hero.isActive ? "Deactivate" : "Activate"}
                          >
                            {hero.isActive ? (
                              <Eye size={16} />
                            ) : (
                              <EyeOff size={16} />
                            )}
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => handleEdit(hero)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(hero._id)}
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
                      No heroes found. Click "Seed Default" to create one.
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
        size="lg"
        centered
        className="admin-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingHero ? "Edit Hero" : "Add Hero"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="hero-form">
              {/* Title */}
              <Form.Group className="mb-3">
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., The Night"
                  required
                />
              </Form.Group>

              {/* Subtitle */}
              <Form.Group className="mb-3">
                <Form.Label>Subtitle</Form.Label>
                <Form.Control
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="e.g., Discover the Art of Scent"
                />
              </Form.Group>

              {/* Description */}
              <Form.Group className="mb-3">
                <Form.Label>Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Hero description..."
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Button Text</Form.Label>
                    <Form.Control
                      type="text"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      placeholder="Shop Now"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Button Link</Form.Label>
                    <Form.Control
                      type="text"
                      name="buttonLink"
                      value={formData.buttonLink}
                      onChange={handleInputChange}
                      placeholder="/shop"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Secondary Button Text</Form.Label>
                    <Form.Control
                      type="text"
                      name="secondaryButtonText"
                      value={formData.secondaryButtonText}
                      onChange={handleInputChange}
                      placeholder="Learn More"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Secondary Button Link</Form.Label>
                    <Form.Control
                      type="text"
                      name="secondaryButtonLink"
                      value={formData.secondaryButtonLink}
                      onChange={handleInputChange}
                      placeholder="/collections"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Features */}
              <Form.Group className="mb-3">
                <Form.Label>Features (JSON format)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={featuresText}
                  onChange={handleFeaturesChange}
                  placeholder='[
                    { "icon": "✓", "label": "Authentic", "subLabel": "100% Original" },
                    { "icon": "✓", "label": "Fast Delivery", "subLabel": "Across Pakistan" },
                    { "icon": "✓", "label": "Secure Payment", "subLabel": "100% Safe" }
                  ]'
                />
                <Form.Text className="text-muted">
                  Each feature should have icon, label, and subLabel
                </Form.Text>
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Order</Form.Label>
                    <Form.Control
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Active"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Set as Default"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Image Upload */}
              <Form.Group className="mb-3">
                <Form.Label>Background Image</Form.Label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="image-upload-input"
                    id="heroImage"
                    ref={fileInputRef}
                  />
                  <label htmlFor="heroImage" className="image-upload-label">
                    {imagePreview ? (
                      <div className="image-preview-container">
                        <img
                          src={imagePreview}
                          alt="Hero preview"
                          className="image-preview"
                        />
                        <span className="change-image-text">Change Image</span>
                      </div>
                    ) : (
                      <>
                        <Image size={24} />
                        <span>Click to upload background image</span>
                        <small>JPG, PNG, WebP (max 5MB)</small>
                      </>
                    )}
                  </label>
                </div>
                {imagePreview && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedFile(null);
                      fileInputRef.current.value = "";
                    }}
                    className="mt-2"
                  >
                    <X size={14} /> Remove Image
                  </Button>
                )}
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </>
              ) : editingHero ? (
                "Update Hero"
              ) : (
                "Create Hero"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default HeroManagement;

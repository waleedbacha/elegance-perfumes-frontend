// frontend/src/components/admin/CategoryManagement.jsx

import React, { useState, useEffect, useRef } from "react";
import { Card, Table, Button, Form, Modal, Badge } from "react-bootstrap";
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  X,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  seedCategories,
  clearSuccess,
  clearError,
} from "../../redux/slices/categorySlice";
import toast from "react-hot-toast";
import "../../styles/components/CategoryManagement.css";

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const { categories, isLoading, success, error } = useSelector(
    (state) => state.categories,
  );

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    gradient: "rgba(139, 0, 0, 0.85)",
    order: 0,
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(getAllCategoriesAdmin());
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

  // ✅ Generate slug from display name
  const generateSlug = (displayName) => {
    return displayName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Handle display name change - auto-generate slug
  const handleDisplayNameChange = (e) => {
    const displayName = e.target.value;
    const name = generateSlug(displayName);
    setFormData((prev) => ({
      ...prev,
      displayName: displayName,
      name: name,
    }));
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
      formDataToSend.append("name", formData.name);
      formDataToSend.append("displayName", formData.displayName);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("gradient", formData.gradient);
      formDataToSend.append("order", formData.order);
      formDataToSend.append("isActive", formData.isActive);

      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }

      if (editingCategory) {
        await dispatch(
          updateCategory({
            id: editingCategory._id,
            formData: formDataToSend,
          }),
        ).unwrap();
        toast.success("Category updated successfully!");
      } else {
        await dispatch(createCategory(formDataToSend)).unwrap();
        toast.success("Category created successfully!");
      }

      handleCloseModal();
      dispatch(getAllCategoriesAdmin());
    } catch (error) {
      // Error handled by slice
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      displayName: category.displayName,
      description: category.description,
      gradient: category.gradient || "rgba(139, 0, 0, 0.85)",
      order: category.order || 0,
      isActive: category.isActive !== undefined ? category.isActive : true,
    });
    setImagePreview(category.image?.url || null);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await dispatch(deleteCategory(id)).unwrap();
        toast.success("Category deleted successfully!");
        dispatch(getAllCategoriesAdmin());
      } catch (error) {
        // Error handled by slice
      }
    }
  };

  const handleReorder = async (categoryId, direction) => {
    const index = categories.findIndex((c) => c._id === categoryId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === categories.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newOrder = [...categories];
    [newOrder[index], newOrder[newIndex]] = [
      newOrder[newIndex],
      newOrder[index],
    ];

    const reorderData = newOrder.map((cat, i) => ({
      id: cat._id,
      order: i,
    }));

    try {
      await dispatch(reorderCategories(reorderData)).unwrap();
      toast.success("Categories reordered successfully!");
      dispatch(getAllCategoriesAdmin());
    } catch (error) {
      // Error handled by slice
    }
  };

  const handleSeed = async () => {
    if (window.confirm("This will create default categories. Continue?")) {
      setIsSeeding(true);
      try {
        await dispatch(seedCategories()).unwrap();
        toast.success("Default categories seeded successfully!");
        dispatch(getAllCategoriesAdmin());
      } catch (error) {
        // Error handled by slice
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      displayName: "",
      description: "",
      gradient: "rgba(139, 0, 0, 0.85)",
      order: 0,
      isActive: true,
    });
    setSelectedFile(null);
    setImagePreview(null);
    setIsSubmitting(false);
  };

  // ✅ Helper to check if category is main (for display only)
  const isMainCategory = (name) => {
    return ["men", "women", "unisex"].includes(name?.toLowerCase());
  };

  if (isLoading && !categories?.length) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="category-management">
      <div className="management-header">
        <div>
          <h1>Categories</h1>
          <p>Manage all categories (main & lifestyle)</p>
          <span className="category-count">
            {categories?.length || 0} categories
          </span>
        </div>
        <div className="header-actions">
          <Button
            variant="outline-secondary"
            onClick={handleSeed}
            disabled={isLoading || isSeeding}
            className="seed-btn"
          >
            <RefreshCw size={16} className={isSeeding ? "spin" : ""} />
            {isSeeding ? "Seeding..." : "Seed Defaults"}
          </Button>
          <Button
            className="btn-add-category"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} />
            Add Category
          </Button>
        </div>
      </div>

      <Card className="table-card">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Image</th>
                  <th>Name (Slug)</th>
                  <th>Display Name</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories?.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category._id}>
                      <td>
                        <div className="order-controls">
                          <button
                            className="order-btn"
                            onClick={() => handleReorder(category._id, "up")}
                            disabled={categories.indexOf(category) === 0}
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <span className="order-number">
                            {category.order || 0}
                          </span>
                          <button
                            className="order-btn"
                            onClick={() => handleReorder(category._id, "down")}
                            disabled={
                              categories.indexOf(category) ===
                              categories.length - 1
                            }
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="category-image-cell">
                          <img
                            src={
                              category.image?.url ||
                              "https://via.placeholder.com/40"
                            }
                            alt={category.displayName}
                            className="category-thumb"
                          />
                        </div>
                      </td>
                      <td className="category-name-cell">
                        <code className="slug-text">{category.name}</code>
                      </td>
                      <td className="fw-semibold">
                        {category.displayName}
                        {isMainCategory(category.name) && (
                          <Badge bg="info" className="ms-1" size="sm">
                            Main
                          </Badge>
                        )}
                      </td>
                      <td className="description-cell">
                        {category.description}
                      </td>
                      <td>
                        <Badge
                          bg={
                            isMainCategory(category.name)
                              ? "primary"
                              : "secondary"
                          }
                          className="type-badge"
                        >
                          {isMainCategory(category.name) ? "Main" : "Lifestyle"}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={category.isActive ? "success" : "secondary"}>
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <button
                            className="action-btn edit"
                            onClick={() => handleEdit(category)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(category._id)}
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
                    <td colSpan="8" className="text-center py-4 text-secondary">
                      No categories found. Click "Seed Defaults" to create
                      default categories.
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
          <Modal.Title>
            {editingCategory ? "Edit Category" : "Add New Category"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="category-form">
              {/* ✅ Display Name - Auto-generates slug */}
              <Form.Group className="mb-3">
                <Form.Label>Display Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleDisplayNameChange}
                  placeholder="e.g., Date Night, Office Wear, Wedding"
                  required
                />
                <Form.Text className="text-muted">
                  This is what customers will see. Slug will auto-generate.
                </Form.Text>
              </Form.Group>

              {/* ✅ Slug (auto-generated) */}
              <Form.Group className="mb-3">
                <Form.Label>Slug (Auto-generated)</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  placeholder="Auto-generated from display name"
                  disabled
                  className="slug-display"
                />
                <Form.Text className="text-muted">
                  Used for URLs and linking. Auto-generated from display name.
                </Form.Text>
              </Form.Group>

              {/* Description */}
              <Form.Group className="mb-3">
                <Form.Label>Description *</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Captivating. Romantic. Unforgettable."
                  required
                />
                <Form.Text className="text-muted">
                  Short description shown in the carousel
                </Form.Text>
              </Form.Group>

              {/* Gradient */}
              <Form.Group className="mb-3">
                <Form.Label>Gradient Color</Form.Label>
                <Form.Control
                  type="text"
                  name="gradient"
                  value={formData.gradient}
                  onChange={handleInputChange}
                  placeholder="rgba(139, 0, 0, 0.85)"
                />
                <Form.Text className="text-muted">
                  CSS gradient color for the overlay
                </Form.Text>
              </Form.Group>

              {/* Order */}
              <Form.Group className="mb-3">
                <Form.Label>Order</Form.Label>
                <Form.Control
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                />
                <Form.Text className="text-muted">
                  Lower numbers appear first in the carousel
                </Form.Text>
              </Form.Group>

              {/* Active Status */}
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  label="Active"
                />
                <Form.Text className="text-muted">
                  Inactive categories won't appear in the carousel or product
                  dropdown
                </Form.Text>
              </Form.Group>

              {/* Image Upload */}
              <Form.Group className="mb-3">
                <Form.Label>Category Image</Form.Label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="image-upload-input"
                    id="categoryImage"
                    ref={fileInputRef}
                  />
                  <label htmlFor="categoryImage" className="image-upload-label">
                    {imagePreview ? (
                      <div className="image-preview-container">
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="image-preview"
                        />
                        <span className="change-image-text">Change Image</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon size={24} />
                        <span>Click to upload image</span>
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
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
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
              ) : editingCategory ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;

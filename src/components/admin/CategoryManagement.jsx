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
    name: "men",
    displayName: "",
    description: "",
    gradient: "rgba(139, 0, 0, 0.85)",
    order: 0,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      } else {
        await dispatch(createCategory(formDataToSend)).unwrap();
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
    });
    setImagePreview(category.image?.url || null);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await dispatch(deleteCategory(id)).unwrap();
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
      dispatch(getAllCategoriesAdmin());
    } catch (error) {
      // Error handled by slice
    }
  };

  const handleSeed = async () => {
    if (window.confirm("This will create default categories. Continue?")) {
      try {
        await dispatch(seedCategories()).unwrap();
        dispatch(getAllCategoriesAdmin());
      } catch (error) {
        // Error handled by slice
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "men",
      displayName: "",
      description: "",
      gradient: "rgba(139, 0, 0, 0.85)",
      order: 0,
    });
    setSelectedFile(null);
    setImagePreview(null);
    setIsSubmitting(false);
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
          <p>Manage your product categories</p>
          <span className="category-count">
            {categories?.length || 0} categories
          </span>
        </div>
        <div className="header-actions">
          <Button
            variant="outline-secondary"
            onClick={handleSeed}
            disabled={isLoading}
            className="seed-btn"
          >
            <RefreshCw size={16} />
            Seed Defaults
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
                  <th>Name</th>
                  <th>Display Name</th>
                  <th>Description</th>
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
                      <td className="capitalize">{category.name}</td>
                      <td>{category.displayName}</td>
                      <td className="description-cell">
                        {category.description}
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
                    <td colSpan="7" className="text-center py-4 text-secondary">
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
            {editingCategory ? "Edit Category" : "Add Category"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="category-form">
              {/* Name */}
              <Form.Group className="mb-3">
                <Form.Label>Category Name *</Form.Label>
                <Form.Select
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!!editingCategory}
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  {editingCategory
                    ? "Category name cannot be changed"
                    : "Select the category type"}
                </Form.Text>
              </Form.Group>

              {/* Display Name */}
              <Form.Group className="mb-3">
                <Form.Label>Display Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="e.g., MEN"
                  required
                />
              </Form.Group>

              {/* Description */}
              <Form.Group className="mb-3">
                <Form.Label>Description *</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Bold. Strong. Confident."
                  required
                />
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
                  Lower numbers appear first
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

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Modal,
  Badge,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllNavbarItems,
  createNavbarItem,
  updateNavbarItem,
  deleteNavbarItem,
  reorderNavbarItems,
  seedNavbar,
  toggleVisibility,
  clearSuccess,
  clearError,
} from "../../redux/slices/navbarSlice";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Grip,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import "../../styles/components/NavbarManagement.css";

const NavbarManagement = () => {
  const dispatch = useDispatch();
  const { allItems, isLoading, success, error } = useSelector(
    (state) => state.navbar,
  );

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    path: "",
    icon: "",
    order: 0,
    target: "_self",
    allowedRoles: ["admin", "customer", "guest"],
    isVisible: true,
    parentId: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getAllNavbarItems());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      // ✅ Only show toast for success, not for seed (we handle it separately)
      if (success !== "Default navbar items seeded successfully") {
        toast.success(success);
      }
      dispatch(clearSuccess());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        label: item.label,
        path: item.path,
        icon: item.icon || "",
        order: item.order || 0,
        target: item.target || "_self",
        allowedRoles: item.allowedRoles || ["admin", "customer", "guest"],
        isVisible: item.isVisible !== undefined ? item.isVisible : true,
        parentId: item.parentId || null,
      });
    } else {
      setEditingItem(null);
      setFormData({
        label: "",
        path: "",
        icon: "",
        order: allItems.length,
        target: "_self",
        allowedRoles: ["admin", "customer", "guest"],
        isVisible: true,
        parentId: null,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format allowedRoles
      let allowedRoles = formData.allowedRoles;
      if (typeof allowedRoles === "string") {
        allowedRoles = allowedRoles
          .split(",")
          .map((r) => r.trim())
          .filter((r) => r);
      }
      if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
        allowedRoles = ["customer"];
      }

      const data = {
        label: formData.label.trim(),
        path: formData.path.trim(),
        icon: formData.icon || "",
        order: parseInt(formData.order) || 0,
        target: formData.target || "_self",
        allowedRoles: allowedRoles,
        isVisible: formData.isVisible !== undefined ? formData.isVisible : true,
        parentId: formData.parentId || null,
      };

      console.log("📤 Sending navbar data:", data);

      let result;
      if (editingItem) {
        result = await dispatch(
          updateNavbarItem({ id: editingItem._id, data }),
        ).unwrap();
        toast.success("Navbar item updated successfully!");
      } else {
        result = await dispatch(createNavbarItem(data)).unwrap();
        toast.success("Navbar item created successfully!");
      }

      console.log("✅ Result:", result);
      handleCloseModal();
      await dispatch(getAllNavbarItems());
    } catch (error) {
      console.error("❌ Submit error:", error);
      const errorMsg =
        typeof error === "string"
          ? error
          : error?.message || "Failed to save navbar item";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update the handleChange function for allowedRoles:
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "allowedRoles") {
      // Handle as array
      const roles = value
        .split(",")
        .map((r) => r.trim())
        .filter((r) => r);
      setFormData((prev) => ({
        ...prev,
        allowedRoles: roles,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this navbar item?")) {
      try {
        await dispatch(deleteNavbarItem(id)).unwrap();
        toast.success("Navbar item deleted successfully!");
        dispatch(getAllNavbarItems());
      } catch (error) {
        toast.error(error || "Failed to delete navbar item");
      }
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      await dispatch(toggleVisibility(id)).unwrap();
      dispatch(getAllNavbarItems());
    } catch (error) {
      toast.error(error || "Failed to toggle visibility");
    }
  };

  const handleReorder = async (id, direction) => {
    const index = allItems.findIndex((item) => item._id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === allItems.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newItems = [...allItems];
    [newItems[index], newItems[newIndex]] = [
      newItems[newIndex],
      newItems[index],
    ];

    const reorderData = newItems.map((item, idx) => ({
      id: item._id,
      order: idx,
    }));

    try {
      await dispatch(reorderNavbarItems(reorderData)).unwrap();
      toast.success("Navbar items reordered successfully!");
      dispatch(getAllNavbarItems());
    } catch (error) {
      toast.error(error || "Failed to reorder navbar items");
    }
  };

  const handleSeed = async () => {
    if (window.confirm("This will reset navbar items to default. Continue?")) {
      try {
        const result = await dispatch(seedNavbar()).unwrap();
        toast.success("Default navbar items seeded successfully!");
        // ✅ The items are already updated in the slice, but refresh to be safe
        await dispatch(getAllNavbarItems());
      } catch (error) {
        console.error("❌ Seed error:", error);
        toast.error(error || "Failed to seed navbar items");
      }
    }
  };

  const getRoleBadge = (roles) => {
    const roleColors = {
      admin: "danger",
      customer: "info",
      guest: "secondary",
    };
    return roles.map((role) => (
      <Badge key={role} bg={roleColors[role] || "secondary"} className="me-1">
        {role}
      </Badge>
    ));
  };

  if (isLoading && !allItems.length) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading navbar items...</p>
      </div>
    );
  }

  return (
    <div className="navbar-management">
      <div className="management-header">
        <div>
          <h1>Navbar Management</h1>
          <p>Manage your navigation menu items</p>
          <span className="item-count">{allItems.length} items</span>
        </div>
        <div className="header-actions">
          <Button
            variant="outline-secondary"
            onClick={handleSeed}
            disabled={isLoading}
            className="seed-btn"
          >
            <RefreshCw size={16} />
            Reset to Default
          </Button>
          <Button className="btn-add-item" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Add Item
          </Button>
        </div>
      </div>

      {allItems.length === 0 ? (
        <Card className="empty-state-card">
          <Card.Body>
            <div className="text-center py-5">
              <h5>No navbar items found</h5>
              <p className="text-muted">
                Click "Add Item" to create your first navbar item
              </p>
              <Button variant="danger" onClick={() => handleOpenModal()}>
                <Plus size={16} className="me-2" />
                Add Navbar Item
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card className="table-card">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th>Label</th>
                    <th>Path</th>
                    <th>Icon</th>
                    <th>Roles</th>
                    <th>Status</th>
                    <th style={{ width: "180px" }} className="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allItems.map((item, index) => (
                    <tr key={item._id}>
                      <td className="order-cell">
                        <span className="order-number">{index + 1}</span>
                        <div className="order-controls">
                          <button
                            className="order-btn"
                            onClick={() => handleReorder(item._id, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            className="order-btn"
                            onClick={() => handleReorder(item._id, "down")}
                            disabled={index === allItems.length - 1}
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="item-label">
                          <span>{item.label}</span>
                          {item.parentId && (
                            <Badge bg="secondary" className="ms-2">
                              Child
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        <code className="path-code">{item.path}</code>
                      </td>
                      <td>{item.icon || "—"}</td>
                      <td>{getRoleBadge(item.allowedRoles || ["customer"])}</td>
                      <td>
                        <Badge bg={item.isVisible ? "success" : "secondary"}>
                          {item.isVisible ? "Visible" : "Hidden"}
                        </Badge>
                        {!item.isActive && (
                          <Badge bg="danger" className="ms-1">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <button
                            className="action-btn visibility"
                            onClick={() => handleToggleVisibility(item._id)}
                            title={item.isVisible ? "Hide" : "Show"}
                          >
                            {item.isVisible ? (
                              <Eye size={16} />
                            ) : (
                              <EyeOff size={16} />
                            )}
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => handleOpenModal(item)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(item._id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

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
            {editingItem ? "Edit Navbar Item" : "Add Navbar Item"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Label *</Form.Label>
                  <Form.Control
                    type="text"
                    name="label"
                    value={formData.label}
                    onChange={handleChange}
                    placeholder="e.g., Products"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Path *</Form.Label>
                  <Form.Control
                    type="text"
                    name="path"
                    value={formData.path}
                    onChange={handleChange}
                    placeholder="e.g., /products"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Icon (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    placeholder="e.g., ShoppingBag"
                  />
                  <Form.Text className="text-muted">
                    Use Lucide React icon names
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Order</Form.Label>
                  <Form.Control
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Target</Form.Label>
                  <Form.Select
                    name="target"
                    value={formData.target}
                    onChange={handleChange}
                  >
                    <option value="_self">Same Window</option>
                    <option value="_blank">New Window</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Allowed Roles</Form.Label>
                  <Form.Control
                    type="text"
                    name="allowedRoles"
                    value={
                      Array.isArray(formData.allowedRoles)
                        ? formData.allowedRoles.join(", ")
                        : formData.allowedRoles
                    }
                    onChange={handleChange}
                    placeholder="admin, customer, guest"
                  />
                  <Form.Text className="text-muted">
                    Comma separated: admin, customer, guest
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Parent Item (Optional)</Form.Label>
                  <Form.Select
                    name="parentId"
                    value={formData.parentId || ""}
                    onChange={handleChange}
                  >
                    <option value="">None (Top Level)</option>
                    {allItems
                      .filter((item) => item._id !== editingItem?._id)
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.label} {item.parentId ? "(Child)" : ""}
                        </option>
                      ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Select a parent to create a dropdown menu
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    name="isVisible"
                    checked={formData.isVisible}
                    onChange={handleChange}
                    label="Visible in Navbar"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </>
              ) : editingItem ? (
                "Update Item"
              ) : (
                "Create Item"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default NavbarManagement;

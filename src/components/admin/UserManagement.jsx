// frontend/src/components/admin/UserManagement.jsx
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
} from "react-bootstrap";
import {
  Search,
  Edit,
  Trash2,
  UserPlus,
  RefreshCw,
  X,
  LayoutGrid,
  List,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUsers,
  updateUser,
  deleteUser,
  clearUsersError,
} from "../../redux/slices/authSlice";
import { fetchManager } from "../../utils/fetchManager";
import UserCard from "./UserCard";
import toast from "react-hot-toast";
import "../../styles/pages/UserManagement.css";

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, isUsersLoading, usersError } = useSelector(
    (state) => state.auth,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    role: "customer",
    status: "active",
  });

  // ✅ Only fetch once on mount
  useEffect(() => {
    dispatch(clearUsersError());
    dispatch(getUsers());
  }, []);

  // ✅ Handle manual refresh
  const handleRefresh = () => {
    fetchManager.resetFetch("users");
    dispatch(clearUsersError());
    dispatch(getUsers());
    toast.success("Refreshing users...");
  };

  // ✅ Handle Edit
  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      password: "",
      passwordConfirm: "",
    });
    setShowEditModal(true);
  };

  // ✅ Handle Add User
  const handleAddUser = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      passwordConfirm: "",
      role: "customer",
      status: "active",
    });
    setShowAddModal(true);
  };

  // ✅ Handle Update Submit
  const handleUpdate = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    dispatch(updateUser({ id: selectedUser._id, userData: formData }))
      .unwrap()
      .then(() => {
        toast.success("User updated successfully!");
        setShowEditModal(false);
        dispatch(getUsers());
      })
      .catch((err) => {
        toast.error(err || "Failed to update user");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // ✅ Handle Add Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();

    // ✅ Validate passwords match
    if (formData.password !== formData.passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }

    // ✅ Validate password length
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    // ✅ Use the register endpoint to create a new user
    const registerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      passwordConfirm: formData.passwordConfirm,
    };

    // ✅ If we want to set role/status, we need to use admin endpoint
    // For now, register as customer and then update role if needed
    import("../../services/authService")
      .then((module) => {
        const authService = module.default;
        return authService.register(registerData);
      })
      .then(() => {
        toast.success("User created successfully!");
        setShowAddModal(false);
        dispatch(getUsers());
      })
      .catch((err) => {
        toast.error(err || "Failed to create user");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // ✅ Handle Delete
  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      toast.loading("Deleting user...", { id: "delete-user" });

      dispatch(deleteUser(userId))
        .unwrap()
        .then(() => {
          toast.success("User deleted successfully!", { id: "delete-user" });
          // Refresh the user list
          dispatch(getUsers());
        })
        .catch((err) => {
          console.error("Delete error:", err);
          toast.error(err || "Failed to delete user", { id: "delete-user" });
        });
    }
  };

  // ✅ Filter users - EXCLUDE deactivated/deleted users
  const filteredUsers = users?.filter((user) => {
    // Skip soft-deleted users (safety net - backend already filters these)
    if (user.email?.startsWith("deleted_")) return false;
    if (user.status === "deactivated") return false;

    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    return matchesSearch;
  });

  // ✅ Badge helpers
  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { variant: "danger", label: "Admin" },
      manager: { variant: "warning", label: "Manager" },
      customer: { variant: "info", label: "Customer" },
      delivery: { variant: "secondary", label: "Delivery" },
    };
    const info = roleMap[role] || roleMap.customer;
    return <Badge bg={info.variant}>{info.label}</Badge>;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { variant: "success", label: "Active" },
      suspended: { variant: "warning", label: "Suspended" },
      deactivated: { variant: "secondary", label: "Deactivated" },
    };
    const info = statusMap[status] || statusMap.active;
    return <Badge bg={info.variant}>{info.label}</Badge>;
  };

  // ✅ Loading state
  if (isUsersLoading && !users?.length) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading users...</p>
      </div>
    );
  }

  // ✅ Error state
  if (usersError) {
    return (
      <div
        className="admin-error"
        style={{ padding: "40px", textAlign: "center" }}
      >
        <p
          className="text-danger"
          style={{ color: "#ef4444", fontSize: "1.1rem" }}
        >
          ⚠️ {usersError}
        </p>
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <button className="btn btn-danger" onClick={handleRefresh}>
            <RefreshCw size={16} style={{ marginRight: "8px" }} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <div>
          <h1>Users</h1>
          <p>Manage user accounts</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {/* ✅ View Toggle Buttons */}
          <div className="view-toggle-group">
            <button
              className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <List size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === "card" ? "active" : ""}`}
              onClick={() => setViewMode("card")}
              title="Card View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          <Button
            variant="outline-secondary"
            onClick={handleRefresh}
            disabled={isUsersLoading}
            style={{
              borderColor: "#2a2a2a",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RefreshCw size={16} className={isUsersLoading ? "spin" : ""} />
            Refresh
          </Button>
          <Button className="btn-add-user" onClick={handleAddUser}>
            <UserPlus size={18} />
            Add User
          </Button>
        </div>
      </div>

      <div className="management-controls">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>
          {filteredUsers?.length || 0} users found
        </div>
      </div>

      {/* ✅ Table View */}
      {viewMode === "table" && (
        <Card className="table-card">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Orders</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers?.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-name-cell">
                            <div className="user-avatar">
                              {user.name?.charAt(0) || "U"}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>{getStatusBadge(user.status)}</td>
                        <td>{user.orderCount || 0}</td>
                        <td className="text-center">
                          <div className="action-buttons">
                            <button
                              className="action-btn edit"
                              onClick={() => handleEdit(user)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleDelete(user._id)}
                              title="Delete"
                              disabled={user.role === "admin"}
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
                        colSpan="7"
                        className="text-center py-4 text-secondary"
                      >
                        {searchTerm
                          ? "No users match your search"
                          : "No users found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* ✅ Card View */}
      {viewMode === "card" && (
        <div className="user-card-grid">
          {filteredUsers?.length > 0 ? (
            filteredUsers.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isAdmin={user.role === "admin"}
              />
            ))
          ) : (
            <div
              className="text-center py-4 text-secondary"
              style={{ gridColumn: "1 / -1" }}
            >
              {searchTerm ? "No users match your search" : "No users found"}
            </div>
          )}
        </div>
      )}

      {/* ✅ EDIT USER MODAL */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        className="admin-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="customer">Customer</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="delivery">Delivery</option>
                  </Form.Select>
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
                    <option value="suspended">Suspended</option>
                    <option value="deactivated">Deactivated</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update User"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ✅ ADD USER MODAL */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        className="admin-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    minLength={8}
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 8 characters
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password *</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm password"
                    value={formData.passwordConfirm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passwordConfirm: e.target.value,
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
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="customer">Customer</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="delivery">Delivery</option>
                  </Form.Select>
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
                    <option value="suspended">Suspended</option>
                    <option value="deactivated">Deactivated</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;

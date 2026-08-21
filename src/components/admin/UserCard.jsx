// frontend/src/components/admin/UserCard.jsx
import React from "react";
import { Card, Badge, Button } from "react-bootstrap";
import { Edit, Trash2, Mail, Phone, ShoppingBag, Crown } from "lucide-react";
import "../../styles/components/UserCard.css";

const UserCard = ({ user, onEdit, onDelete, isAdmin }) => {
  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { variant: "danger", label: "Admin", icon: <Crown size={14} /> },
      manager: { variant: "warning", label: "Manager" },
      customer: { variant: "info", label: "Customer" },
      delivery: { variant: "secondary", label: "Delivery" },
    };
    const info = roleMap[role] || roleMap.customer;
    return (
      <Badge bg={info.variant} className="role-badge">
        {info.icon && <span className="badge-icon">{info.icon}</span>}
        {info.label}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { variant: "success", label: "Active" },
      suspended: { variant: "warning", label: "Suspended" },
      deactivated: { variant: "secondary", label: "Deactivated" },
    };
    const info = statusMap[status] || statusMap.active;
    return (
      <Badge bg={info.variant} className="status-badge">
        {info.label}
      </Badge>
    );
  };

  return (
    <Card className="user-card">
      <Card.Body>
        {/* Header with Avatar and Name */}
        <div className="user-card-header">
          <div className="user-avatar-large">{user.name?.charAt(0) || "U"}</div>
          <div className="user-card-name-section">
            <h5 className="user-card-name">{user.name}</h5>
            <div className="user-card-badges">
              {getRoleBadge(user.role)}
              {getStatusBadge(user.status)}
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="user-card-details">
          <div className="user-detail-item">
            <Mail size={16} className="detail-icon" />
            <span className="detail-label">Email:</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="user-detail-item">
            <Phone size={16} className="detail-icon" />
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{user.phone || "N/A"}</span>
          </div>
          <div className="user-detail-item">
            <ShoppingBag size={16} className="detail-icon" />
            <span className="detail-label">Orders:</span>
            <span className="detail-value">{user.orderCount || 0}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="user-card-actions">
          <Button
            variant="outline-primary"
            size="sm"
            className="action-btn edit"
            onClick={() => onEdit(user)}
          >
            <Edit size={16} />
            Edit
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            className="action-btn delete"
            onClick={() => onDelete(user._id)}
            disabled={isAdmin || user.role === "admin"}
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default UserCard;

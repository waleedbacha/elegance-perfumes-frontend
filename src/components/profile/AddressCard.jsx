import React from "react";
import { Card, Badge, Button } from "react-bootstrap";
import { Edit2, Trash2, CheckCircle, MapPin } from "lucide-react";
import "../../styles/components/AddressCard.css";

const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDefault,
  loading,
}) => {
  return (
    <Card className={`address-card ${isDefault ? "default-address" : ""}`}>
      <Card.Body>
        <div className="address-header">
          <div>
            <h6 className="address-name">{address.name}</h6>
            <p className="address-phone">{address.phone}</p>
          </div>
          {isDefault && (
            <Badge className="default-badge">
              <CheckCircle size={12} />
              Default
            </Badge>
          )}
        </div>

        <div className="address-details">
          <p className="address-street">{address.street}</p>
          {address.area && <p className="address-area">{address.area}</p>}
          <p className="address-city">
            {address.city}, {address.state} {address.zipCode}
          </p>
          <p className="address-country">{address.country}</p>
          {address.landmark && (
            <span className="address-landmark">📍 {address.landmark}</span>
          )}
        </div>

        <div className="d-flex gap-2 mt-2">
          <Badge className="address-type-badge">{address.type}</Badge>
        </div>
      </Card.Body>
      <Card.Footer>
        <div className="address-actions">
          {!isDefault && (
            <Button
              variant="outline-success"
              size="sm"
              onClick={onSetDefault}
              disabled={loading}
            >
              Set Default
            </Button>
          )}
          <Button
            variant="outline-primary"
            size="sm"
            onClick={onEdit}
            disabled={loading}
          >
            <Edit2 size={14} />
            Edit
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={onDelete}
            disabled={loading}
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default AddressCard;

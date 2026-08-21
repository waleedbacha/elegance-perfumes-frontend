import React from "react";
import { Card, Badge, Button, Row, Col } from "react-bootstrap";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/components/OrderCard.css";

const OrderCard = ({
  order,
  compact = false,
  expanded = false,
  onToggleExpand,
  onCancel,
  loading,
}) => {
  const navigate = useNavigate();

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

  const statusInfo = getStatusBadge(order.status);
  const isExpanded = expanded;

  if (compact) {
    return (
      <div className="order-card-compact">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <p className="compact-order-number">#{order.orderNumber}</p>
            <small className="compact-order-date">
              {new Date(order.createdAt).toLocaleDateString()}
            </small>
          </div>
          <div className="compact-order-right">
            <Badge className={`status-badge bg-${statusInfo.variant}`}>
              {statusInfo.label}
            </Badge>
            <p className="compact-order-total mt-1">
              Rs. {order.total?.toLocaleString()}
            </p>
          </div>
        </Card.Body>
      </div>
    );
  }

  return (
    <Card className={`order-card status-${order.status}`}>
      <Card.Body>
        {/* Header */}
        <div className="order-header">
          <div>
            <h6 className="order-number">Order #{order.orderNumber}</h6>
            <small className="order-date">
              {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </small>
          </div>
          <div className="order-right">
            <Badge className={`status-badge bg-${statusInfo.variant}`}>
              {statusInfo.label}
            </Badge>
            <h6 className="order-total">Rs. {order.total?.toLocaleString()}</h6>
            <small className="order-items-count">
              {order.items?.length || 0} items
            </small>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="mt-2">
          <button
            className={`toggle-details-btn ${isExpanded ? "expanded" : ""}`}
            onClick={onToggleExpand}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {isExpanded ? " Hide Details" : " View Details"}
          </button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="order-details">
            <Row>
              <Col md={6}>
                <div className="order-items">
                  <h6 className="order-items-title">Items</h6>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <div className="order-item-info">
                        <p className="order-item-name">{item.name}</p>
                        <small className="order-item-meta">
                          Size: {item.size} × {item.quantity}
                        </small>
                      </div>
                      <span className="order-item-price">
                        Rs. {item.total?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Col>

              <Col md={6}>
                <h6 className="order-items-title">Order Summary</h6>
                <div className="order-summary">
                  <div className="order-summary-row">
                    <span className="label">Subtotal</span>
                    <span className="value">
                      Rs. {order.subtotal?.toLocaleString()}
                    </span>
                  </div>
                  {order.productDiscount > 0 && (
                    <div className="order-summary-row discount">
                      <span className="label">Product Discount</span>
                      <span className="value">
                        -Rs. {order.productDiscount?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {order.couponDiscount > 0 && (
                    <div className="order-summary-row discount">
                      <span className="label">Coupon Discount</span>
                      <span className="value">
                        -Rs. {order.couponDiscount?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="order-summary-row">
                    <span className="label">Delivery Fee</span>
                    <span className="value">
                      Rs. {order.shipping?.toLocaleString()}
                    </span>
                  </div>
                  <div className="order-summary-row total">
                    <span>Total</span>
                    <span>Rs. {order.total?.toLocaleString()}</span>
                  </div>
                </div>

                {order.coupon && (
                  <div className="coupon-badge">
                    Coupon: {order.coupon.code}
                  </div>
                )}

                <div className="payment-info">
                  <span className="payment-method">
                    Payment: {order.paymentMethod || "N/A"}
                  </span>
                  <span className="payment-method">
                    Status: {order.paymentStatus || "N/A"}
                  </span>
                </div>
              </Col>
            </Row>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="shipping-address">
                <h6 className="shipping-address-title">Shipping Address</h6>
                <p className="address-name">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                {order.shippingAddress.area && (
                  <p>{order.shippingAddress.area}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            )}

            {/* Actions */}
            <div className="order-actions">
              {order.status !== "cancelled" && order.status !== "delivered" && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={onCancel}
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
};

export default OrderCard;

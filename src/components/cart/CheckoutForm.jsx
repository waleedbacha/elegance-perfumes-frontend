import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../../redux/slices/orderSlice";
import { clearCart } from "../../redux/slices/cartSlice";
import toast from "react-hot-toast";
import { MapPin, Phone, User, Mail, Home, Building } from "lucide-react";
import "../../styles/components/CheckoutForm.css";

const CheckoutForm = ({
  items,
  subtotal,
  productDiscount,
  couponDiscount,
  discount,
  shipping,
  total,
  coupon,
  user,
  onOrderPlaced,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    // Customer Info
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",

    // Shipping Address
    shippingName: "",
    shippingPhone: "",
    shippingStreet: "",
    shippingArea: "",
    shippingCity: "",
    shippingState: "",
    shippingZipCode: "",
    shippingCountry: "Pakistan",
    shippingLandmark: "",
    deliveryInstructions: "",

    // Billing
    sameAsShipping: true,
    billingName: "",
    billingPhone: "",
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingZipCode: "",
    billingCountry: "Pakistan",

    // Payment
    paymentMethod: "cod",
    couponCode: coupon?.code || "",
    notes: "",
    giftMessage: "",
    isGift: false,
    giftWrap: false,
  });

  // Set user data when available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // HANDLERS

  const formatPhoneNumber = (value) => {
    // Remove all non-numeric
    let cleaned = value.replace(/\D/g, "");
    // Remove leading 0
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }
    // Add 92 if not present and not empty
    if (cleaned.length > 0 && !cleaned.startsWith("92")) {
      cleaned = `92${cleaned}`;
    }
    // Limit to 12 digits
    if (cleaned.length > 12) {
      cleaned = cleaned.substring(0, 12);
    }
    return cleaned;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsProcessing(true);

    // Validate phone number - REQUIRED for all users
    // Update validation in handleSubmit:
    if (!formData.phone || formData.phone.replace(/\D/g, "").length < 12) {
      toast.error("Please enter a complete phone number (e.g., 3459270471)");
      setLoading(false);
      setIsProcessing(false);
      return;
    }

    // Validate shipping address
    if (
      !formData.shippingStreet ||
      !formData.shippingCity ||
      !formData.shippingState ||
      !formData.shippingZipCode
    ) {
      toast.error("Please fill in all shipping address fields");
      setLoading(false);
      setIsProcessing(false);
      return;
    }

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.product?._id || item.product,
          size: item.size,
          quantity: item.quantity,
        })),
        shippingAddress: {
          name: formData.shippingName || formData.name,
          phone: formData.shippingPhone || formData.phone,
          street: formData.shippingStreet,
          area: formData.shippingArea,
          city: formData.shippingCity,
          state: formData.shippingState,
          zipCode: formData.shippingZipCode,
          country: formData.shippingCountry,
          landmark: formData.shippingLandmark,
          deliveryInstructions: formData.deliveryInstructions,
        },
        billingAddress: formData.sameAsShipping
          ? { sameAsShipping: true }
          : {
              name: formData.billingName,
              phone: formData.billingPhone || formData.phone,
              street: formData.billingStreet,
              city: formData.billingCity,
              state: formData.billingState,
              zipCode: formData.billingZipCode,
              country: formData.billingCountry,
            },
        paymentMethod: formData.paymentMethod,
        couponCode: formData.couponCode,
        notes: formData.notes,
        giftMessage: formData.giftMessage,
        isGift: formData.isGift || false,
        giftWrap: formData.giftWrap || false,
        customerPhone: formData.phone,
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
      toast.success("Order placed successfully! 🎉");
      dispatch(clearCart());

      if (onOrderPlaced) {
        onOrderPlaced(result);
      } else {
        navigate(`/order-confirmation/${result._id}`);
      }
    } catch (error) {
      toast.error(error || "Failed to place order");
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="checkout-form-wrapper"
    >
      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <Card className="mb-4 checkout-card">
          <Card.Header className="checkout-card-header">
            <h5 className="mb-0 text-light">
              <User size={18} className="me-2" />
              Contact Information
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="checkout-input"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">
                    Email Address *
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="checkout-input"
                    required
                    disabled={!!user?.email}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="text-light">
                <Phone size={16} className="me-1" />
                Phone Number <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setFormData({ ...formData, phone: formatted });
                }}
                placeholder="3459270471"
                className="checkout-input"
                required
              />
              <Form.Text className="text-muted">
                We'll use this to contact you about your order
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>

        {/* Shipping Address */}
        <Card className="mb-4 checkout-card">
          <Card.Header className="checkout-card-header">
            <h5 className="mb-0 text-light">
              <MapPin size={18} className="me-2" />
              Shipping Address
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="shippingName"
                    value={formData.shippingName}
                    onChange={handleChange}
                    placeholder="Recipient name"
                    className="checkout-input"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Phone *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="shippingPhone"
                    value={formData.shippingPhone}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setFormData({ ...formData, shippingPhone: formatted });
                    }}
                    placeholder="3459270471"
                    className="checkout-input"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="text-light">Street Address *</Form.Label>
              <Form.Control
                type="text"
                name="shippingStreet"
                value={formData.shippingStreet}
                onChange={handleChange}
                placeholder="House #, Street, Sector"
                className="checkout-input"
                required
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">City *</Form.Label>
                  <Form.Control
                    type="text"
                    name="shippingCity"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    placeholder="Islamabad"
                    className="checkout-input"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">
                    State/Province *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="shippingState"
                    value={formData.shippingState}
                    onChange={handleChange}
                    placeholder="Punjab"
                    className="checkout-input"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">ZIP Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="shippingZipCode"
                    value={formData.shippingZipCode}
                    onChange={handleChange}
                    placeholder="44000"
                    className="checkout-input"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Area / Colony</Form.Label>
                  <Form.Control
                    type="text"
                    name="shippingArea"
                    value={formData.shippingArea}
                    onChange={handleChange}
                    placeholder="F-7, Gulberg etc."
                    className="checkout-input"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">Landmark</Form.Label>
                  <Form.Control
                    type="text"
                    name="shippingLandmark"
                    value={formData.shippingLandmark}
                    onChange={handleChange}
                    placeholder="Near mosque, school etc."
                    className="checkout-input"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="text-light">
                Delivery Instructions
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="deliveryInstructions"
                value={formData.deliveryInstructions}
                onChange={handleChange}
                placeholder="Leave at gate, call on arrival etc."
                className="checkout-input"
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {/* Billing Address */}
        <Card className="mb-4 checkout-card">
          <Card.Header className="checkout-card-header">
            <h5 className="mb-0 text-light">
              <Building size={18} className="me-2" />
              Billing Address
            </h5>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Same as shipping address"
                name="sameAsShipping"
                checked={formData.sameAsShipping}
                onChange={handleChange}
                className="text-light"
              />
            </Form.Group>

            {!formData.sameAsShipping && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-light">Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="billingName"
                      value={formData.billingName}
                      onChange={handleChange}
                      className="checkout-input"
                      required={!formData.sameAsShipping}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-light">Phone *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="billingPhone"
                      value={formData.billingPhone}
                      onChange={handleChange}
                      className="checkout-input"
                      required={!formData.sameAsShipping}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>

        {/* Payment */}
        <Card className="mb-4 checkout-card">
          <Card.Header className="checkout-card-header">
            <h5 className="mb-0 text-light">Payment Method</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group>
              <Form.Select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="checkout-select"
              >
                <option value="cod">Cash on Delivery</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="jazzcash">JazzCash</option>
                <option value="bank-transfer">Bank Transfer</option>
              </Form.Select>
            </Form.Group>
          </Card.Body>
        </Card>

        {/* Order Notes */}
        <Card className="mb-4 checkout-card">
          <Card.Header className="checkout-card-header">
            <h5 className="mb-0 text-light">Additional Information</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label className="text-light">
                Order Notes (Optional)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special instructions for this order..."
                className="checkout-input"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light">
                    Gift Message (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="giftMessage"
                    value={formData.giftMessage}
                    onChange={handleChange}
                    placeholder="Write a gift message..."
                    className="checkout-input"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <div className="d-flex gap-3 mt-2">
                  <Form.Check
                    type="checkbox"
                    label="This is a gift"
                    name="isGift"
                    checked={formData.isGift}
                    onChange={handleChange}
                    className="text-light"
                  />
                  <Form.Check
                    type="checkbox"
                    label="Gift wrapping"
                    name="giftWrap"
                    checked={formData.giftWrap}
                    onChange={handleChange}
                    className="text-light"
                  />
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Button
          type="submit"
          variant="danger"
          size="lg"
          className="w-100 checkout-submit-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Placing Order...
            </>
          ) : (
            `Place Order • PKR ${total?.toLocaleString()}`
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default CheckoutForm;

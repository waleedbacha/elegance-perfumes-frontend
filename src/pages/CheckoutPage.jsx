import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Navbar from "../components/common/Navbar";
import CheckoutForm from "../components/cart/CheckoutForm";
import "../styles/pages/CheckoutPage.css";
import SEO from "../components/common/SEO";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    productDiscount,
    couponDiscount,
    discount,
    tax,
    shipping,
    total,
    coupon,
  } = useSelector((state) => state.cart);
  // ✅ Debug log
  console.log("🔍 CheckoutPage values:", {
    couponDiscount,
    coupon,
    productDiscount,
    subtotal,
    total,
  });
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // ============================================
  // REDIRECT IF CART IS EMPTY
  // ============================================

  useEffect(() => {
    if (!items || items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  // ============================================
  // HANDLE ORDER PLACED
  // ============================================

  const handleOrderPlaced = (order) => {
    navigate(`/order-confirmation/${order._id}`);
  };

  // ============================================
  // RENDER
  // ============================================

  if (!items || items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="checkout-page">
          <Container className="py-5">
            <div className="text-center" style={{ padding: "80px 0" }}>
              <h2 style={{ color: "#FFFFFF", fontFamily: "'Cinzel', serif" }}>
                Your Cart is Empty
              </h2>
              <p style={{ color: "#6B7280" }}>
                Add some products to your cart before checking out.
              </p>
              <Link to="/collections" className="btn btn-blood-red mt-3">
                Browse Products
              </Link>
            </div>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Checkout"
        description="Complete your purchase securely at Elegance Perfumes. Fast delivery across Pakistan."
        keywords="checkout, buy perfume, secure payment, Elegance Perfumes checkout"
        url="/checkout"
      />
      <Navbar />
      <div className="checkout-page">
        {/* Header */}
        <div className="checkout-header">
          <Container>
            <h1>
              Secure <span className="highlight">Checkout</span>
            </h1>
            <p>Complete your order with confidence</p>
          </Container>
        </div>

        <Container>
          <div className="checkout-content">
            <Row className="g-4">
              {/* Checkout Form */}
              <Col lg={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckoutForm
                    items={items}
                    subtotal={subtotal}
                    productDiscount={productDiscount}
                    couponDiscount={couponDiscount}
                    discount={discount}
                    // tax={tax}
                    shipping={shipping}
                    total={total}
                    coupon={coupon}
                    user={user}
                    onOrderPlaced={handleOrderPlaced}
                  />
                </motion.div>
              </Col>

              {/* Order Summary */}
              <Col lg={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="order-summary"
                >
                  <h3 className="summary-title">Order Summary</h3>
                  {items.map((item) => {
                    const hasDiscount = item.discount > 0;
                    const discountedPrice = item.price - item.discount;

                    return (
                      <div
                        key={`${item.product?._id || item.product}-${item.size}`}
                        className="summary-item"
                      >
                        <img
                          src={
                            item.image || "https://via.placeholder.com/60x60"
                          }
                          alt={item.name}
                          className="item-image"
                        />
                        <div className="item-details">
                          <div className="item-name">{item.name}</div>
                          <div className="item-size">Size: {item.size}</div>
                          <div className="item-price">
                            {hasDiscount ? (
                              <>
                                <span className="original-price">
                                  PKR {item.price?.toLocaleString() || 0}
                                </span>
                                <span className="discounted-price">
                                  PKR {discountedPrice?.toLocaleString() || 0}
                                </span>
                              </>
                            ) : (
                              <span>
                                PKR {item.price?.toLocaleString() || 0}
                              </span>
                            )}
                          </div>
                          <div className="item-quantity">
                            Qty: {item.quantity}
                          </div>
                          <div className="item-total">
                            Total: PKR{" "}
                            {(
                              item.totalPrice || item.price * item.quantity
                            )?.toLocaleString() || 0}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="summary-totals">
                    <div className="total-row">
                      <span>Subtotal</span>
                      <span>PKR {subtotal?.toLocaleString() || 0}</span>
                    </div>
                    {productDiscount > 0 && (
                      <div className="total-row" style={{ color: "#10B981" }}>
                        <span>Product Discount</span>
                        <span>
                          - PKR {productDiscount?.toLocaleString() || 0}
                        </span>
                      </div>
                    )}
                    {couponDiscount > 0 && coupon?.code && (
                      <div className="total-row" style={{ color: "#8B0000" }}>
                        <span>Coupon Discount ({coupon.code})</span>
                        <span>
                          - PKR {couponDiscount?.toLocaleString() || 0}
                        </span>
                      </div>
                    )}
                    <div className="total-row">
                      <span>Shipping</span>
                      <span>
                        {shipping === 0
                          ? "FREE"
                          : `PKR ${shipping?.toLocaleString() || 0}`}
                      </span>
                    </div>
                    <div className="total-row grand-total">
                      <span>Total</span>
                      <span className="amount">
                        PKR {total?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </>
  );
};

export default CheckoutPage;

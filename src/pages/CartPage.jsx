// frontend/src/pages/CartPage.jsx

import React, { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import {
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} from "../redux/slices/cartSlice";
import Navbar from "../components/common/Navbar";
import toast from "react-hot-toast";
import "../styles/pages/CartPage.css";
import SEO from "../components/common/SEO";

const CartPage = () => {
  const dispatch = useDispatch();
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
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleQuantityChange = (productId, size, quantity) => {
    if (quantity < 1) return;
    dispatch(updateCartItem({ productId, size, quantity }));
  };

  const handleRemoveItem = (productId, size) => {
    dispatch(removeFromCart({ productId, size }));
    toast.success("Item removed from cart");
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }
    setIsApplying(true);
    try {
      await dispatch(applyCoupon(couponCode)).unwrap();
      toast.success("Coupon applied successfully!");
      setCouponCode("");
    } catch (error) {
      toast.error(error || "Invalid coupon code");
    }
    setIsApplying(false);
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.success("Coupon removed");
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please login to proceed to checkout");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (!items || items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="cart-page-empty">
          <Container>
            <div className="empty-cart">
              <ShoppingBag size={64} />
              <h2>Your Cart is Empty</h2>
              <p>Looks like you haven't added any products to your cart yet.</p>
              <Link to="/collections" className="btn btn-blood-red">
                Start Shopping
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
        title="Shopping Cart"
        description="Review your items in the shopping cart. Checkout securely at HAMAMA Perfumes."
        keywords="shopping cart, perfume cart, checkout, HAMAMA Perfumes cart"
        url="/cart"
      />
      <Navbar />
      <div className="cart-page">
        <Container>
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">{items.length} items in your cart</p>

          <Row className="g-4">
            {/* Cart Items */}
            <Col lg={8}>
              <div className="cart-items">
                {items.map((item, index) => {
                  const itemTotal =
                    item.totalPrice || item.price * item.quantity;
                  const hasDiscount = item.discount > 0;
                  const originalPrice = item.price; // This is comparePrice (original)
                  const discountedPrice = item.price - item.discount; // This is the sale price

                  return (
                    <motion.div
                      key={`${item.product?._id || item.product}-${item.size}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="cart-item"
                    >
                      <img
                        src={
                          item.image || "https://via.placeholder.com/100x100"
                        }
                        alt={item.name}
                        className="cart-item-image"
                      />
                      <div className="cart-item-info">
                        <div className="cart-item-brand">{item.brand}</div>
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-size">Size: {item.size}</div>
                        <div className="cart-item-price">
                          {hasDiscount ? (
                            <>
                              <span className="original-price">
                                PKR {originalPrice?.toLocaleString() || 0}
                              </span>
                              <span className="discounted-price">
                                PKR {discountedPrice?.toLocaleString() || 0}
                              </span>
                              <span className="discount-badge">
                                -
                                {Math.round(
                                  (item.discount / originalPrice) * 100,
                                )}
                                %
                              </span>
                            </>
                          ) : (
                            <span>PKR {item.price?.toLocaleString() || 0}</span>
                          )}
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button
                            className="qty-btn"
                            onClick={() =>
                              handleQuantityChange(
                                item.product?._id || item.product,
                                item.size,
                                item.quantity - 1,
                              )
                            }
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() =>
                              handleQuantityChange(
                                item.product?._id || item.product,
                                item.size,
                                item.quantity + 1,
                              )
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() =>
                            handleRemoveItem(
                              item.product?._id || item.product,
                              item.size,
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="cart-item-total">
                        PKR {itemTotal?.toLocaleString() || 0}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Col>

            {/* Cart Summary */}
            <Col lg={4}>
              <div className="cart-summary">
                <h3>Order Summary</h3>

                {/* ✅ Original Total (before product discounts) */}
                <div className="summary-row">
                  <span>Original Total</span>
                  <span>
                    PKR {(subtotal + productDiscount)?.toLocaleString() || 0}
                  </span>
                </div>

                {/* ✅ Product Discount */}
                {productDiscount > 0 && (
                  <div className="summary-row discount">
                    <span>Product Discount</span>
                    <span>- PKR {productDiscount?.toLocaleString() || 0}</span>
                  </div>
                )}

                {/* ✅ Subtotal After Product Discount */}
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>PKR {subtotal?.toLocaleString() || 0}</span>
                </div>

                {/* ✅ Coupon Discount */}
                {couponDiscount > 0 && coupon?.code && (
                  <div className="summary-row discount">
                    <span>Coupon Discount ({coupon.code})</span>
                    <span>- PKR {couponDiscount?.toLocaleString() || 0}</span>
                  </div>
                )}

                {/* ✅ Delivery Fee */}
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>PKR {shipping?.toLocaleString() || 0}</span>
                </div>

                {/* ✅ Final Total */}
                <div className="summary-row total">
                  <span>Total</span>
                  <span>PKR {total?.toLocaleString() || 0}</span>
                </div>

                {/* Coupon Section */}
                <div className="coupon-section">
                  {coupon?.code ? (
                    <div className="applied-coupon">
                      <span>✅ Coupon {coupon.code} applied</span>
                      <button
                        onClick={handleRemoveCoupon}
                        className="remove-coupon-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="coupon-input">
                      <Form.Control
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={isApplying}
                        className="apply-coupon-btn"
                      >
                        {isApplying ? "..." : "Apply"}
                      </Button>
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-blood-red checkout-btn"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>

                <Link to="/collections" className="continue-shopping">
                  ← Continue Shopping
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default CartPage;

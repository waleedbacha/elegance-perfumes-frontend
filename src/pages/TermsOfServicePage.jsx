import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  Shield,
  FileText,
  CreditCard,
  Truck,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Package,
  Clock,
  MapPin,
  Mail,
  Phone,
  Scale,
  Lock,
  ShoppingBag,
} from "lucide-react";
import "../styles/pages/TermsOfServicePage.css";
import SEO from "../components/common/SEO";

const TermsOfServicePage = () => {
  return (
    <>
      <SEO
        title="Terms of Service"
        description="Read the Terms of Service for Elegance Perfumes. Understand our policies on orders, returns, privacy, and user conduct."
        keywords="terms of service, perfume terms, Elegance Perfumes policies, legal terms"
        url="/terms"
      />
      <div className="terms-page">
        {/* Hero Section */}
        <section className="terms-hero">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="hero-content"
            >
              <span className="hero-badge">📋 Terms of Service</span>
              <h1 className="hero-title">
                Our <span className="highlight">Terms</span>
              </h1>
              <p className="hero-subtitle">
                Please read these terms carefully before using our services.
              </p>
              <p className="hero-date">Last Updated: January 2024</p>
            </motion.div>
          </Container>
        </section>

        {/* Main Content */}
        <section className="terms-content">
          <Container>
            <Row className="g-5">
              {/* Sidebar */}
              <Col lg={3}>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="terms-sidebar"
                >
                  <h5>Quick Links</h5>
                  <ul>
                    <li>
                      <a href="#acceptance">Acceptance of Terms</a>
                    </li>
                    <li>
                      <a href="#accounts">Accounts</a>
                    </li>
                    <li>
                      <a href="#products">Products & Pricing</a>
                    </li>
                    <li>
                      <a href="#orders">Orders & Payment</a>
                    </li>
                    <li>
                      <a href="#shipping">Shipping & Delivery</a>
                    </li>
                    <li>
                      <a href="#returns">Returns & Refunds</a>
                    </li>
                    <li>
                      <a href="#loyalty">Loyalty Program</a>
                    </li>
                    <li>
                      <a href="#conduct">User Conduct</a>
                    </li>
                    <li>
                      <a href="#contact">Contact</a>
                    </li>
                  </ul>
                </motion.div>
              </Col>

              {/* Main Content */}
              <Col lg={9}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="terms-main"
                >
                  {/* Acceptance */}
                  <div className="terms-section" id="acceptance">
                    <div className="section-header">
                      <Scale size={24} />
                      <h2>Acceptance of Terms</h2>
                    </div>
                    <p>
                      By using Elegance Perfumes website and services, you agree
                      to these Terms of Service. If you do not agree, please do
                      not use our services. You must be at least 18 years old to
                      make a purchase.
                    </p>
                  </div>

                  {/* Accounts */}
                  <div className="terms-section" id="accounts">
                    <div className="section-header">
                      <User size={24} />
                      <h2>Account Registration</h2>
                    </div>
                    <p>
                      To place an order, you may need to create an account. You
                      agree to:
                    </p>
                    <ul className="terms-list">
                      <li>Provide accurate and complete information</li>
                      <li>Keep your account credentials secure</li>
                      <li>Notify us immediately of any unauthorized use</li>
                      <li>
                        Be responsible for all activity under your account
                      </li>
                    </ul>
                  </div>

                  {/* Products & Pricing */}
                  <div className="terms-section" id="products">
                    <div className="section-header">
                      <ShoppingBag size={24} />
                      <h2>Products & Pricing</h2>
                    </div>
                    <div className="info-grid">
                      <div className="info-card">
                        <h5>Product Descriptions</h5>
                        <ul>
                          <li>Accurate fragrance descriptions</li>
                          <li>Notes, longevity, and sillage details</li>
                          <li>Individual scent perception may vary</li>
                          <li>Size and specifications clearly stated</li>
                        </ul>
                      </div>
                      <div className="info-card">
                        <h5>Pricing</h5>
                        <ul>
                          <li>All prices in Pakistani Rupees (PKR)</li>
                          <li>Taxes included in product price</li>
                          <li>Promotions and discounts apply</li>
                          <li>We reserve right to correct pricing errors</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Orders & Payment */}
                  <div className="terms-section" id="orders">
                    <div className="section-header">
                      <CreditCard size={24} />
                      <h2>Orders & Payment</h2>
                    </div>
                    <div className="order-grid">
                      <div className="order-item">
                        <div className="order-icon">
                          <Package size={20} />
                        </div>
                        <div>
                          <h6>Order Process</h6>
                          <p>
                            Order confirmation sent via email. We reserve right
                            to accept or decline orders.
                          </p>
                        </div>
                      </div>
                      <div className="order-item">
                        <div className="order-icon">
                          <Lock size={20} />
                        </div>
                        <div>
                          <h6>Payment Security</h6>
                          <p>
                            Secure payment processing. We do not store full
                            payment details.
                          </p>
                        </div>
                      </div>
                      <div className="order-item">
                        <div className="order-icon">
                          <AlertCircle size={20} />
                        </div>
                        <div>
                          <h6>Order Cancellation</h6>
                          <p>
                            Orders can be cancelled within 24 hours. Contact
                            support for assistance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping & Delivery */}
                  <div className="terms-section" id="shipping">
                    <div className="section-header">
                      <Truck size={24} />
                      <h2>Shipping & Delivery</h2>
                    </div>
                    <div className="shipping-grid">
                      <div className="shipping-item">
                        <Clock size={20} />
                        <div>
                          <h6>Processing Time</h6>
                          <p>1-3 business days for order processing</p>
                        </div>
                      </div>
                      <div className="shipping-item">
                        <MapPin size={20} />
                        <div>
                          <h6>Delivery</h6>
                          <p>3-7 business days across Pakistan</p>
                        </div>
                      </div>
                      <div className="shipping-item">
                        <Package size={20} />
                        <div>
                          <h6>Tracking</h6>
                          <p>Tracking number provided for all orders</p>
                        </div>
                      </div>
                      <div className="shipping-item">
                        <AlertCircle size={20} />
                        <div>
                          <h6>Damaged Items</h6>
                          <p>
                            Report within 48 hours of delivery for replacement
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Returns & Refunds */}
                  <div className="terms-section" id="returns">
                    <div className="section-header">
                      <RefreshCw size={24} />
                      <h2>Returns & Refunds</h2>
                    </div>
                    <p>
                      We want you to love your purchase. If not, here's our
                      policy:
                    </p>
                    <div className="return-grid">
                      <div className="return-item allowed">
                        <CheckCircle size={18} />
                        <span>3-day return window</span>
                      </div>
                      <div className="return-item allowed">
                        <CheckCircle size={18} />
                        <span>Unopened, unused products only</span>
                      </div>
                      <div className="return-item allowed">
                        <CheckCircle size={18} />
                        <span>Original packaging required</span>
                      </div>
                      <div className="return-item not-allowed">
                        <XCircle size={18} />
                        <span>Personalized items not returnable</span>
                      </div>
                      <div className="return-item not-allowed">
                        <XCircle size={18} />
                        <span>Final sale items not returnable</span>
                      </div>
                      <div className="return-item not-allowed">
                        <XCircle size={18} />
                        <span>Used or opened products not returnable</span>
                      </div>
                    </div>
                  </div>

                  {/* Loyalty Program */}
                  <div className="terms-section" id="loyalty">
                    <div className="section-header">
                      <Shield size={24} />
                      <h2>Loyalty Program</h2>
                    </div>
                    <div className="loyalty-grid">
                      <div className="loyalty-item">
                        <span className="loyalty-icon">⭐</span>
                        <div>
                          <h6>Earn Points</h6>
                          <p>1 point = PKR 1 for every PKR 100 spent</p>
                        </div>
                      </div>
                      <div className="loyalty-item">
                        <span className="loyalty-icon">👑</span>
                        <div>
                          <h6>Tier Levels</h6>
                          <p>
                            Bronze, Silver, Gold, Platinum with exclusive
                            benefits
                          </p>
                        </div>
                      </div>
                      <div className="loyalty-item">
                        <span className="loyalty-icon">🎯</span>
                        <div>
                          <h6>Redeem Points</h6>
                          <p>Points can be redeemed on future purchases</p>
                        </div>
                      </div>
                      <div className="loyalty-item">
                        <span className="loyalty-icon">⏰</span>
                        <div>
                          <h6>Points Expiry</h6>
                          <p>Points expire after 12 months of inactivity</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Conduct */}
                  <div className="terms-section" id="conduct">
                    <div className="section-header">
                      <Shield size={24} />
                      <h2>User Conduct</h2>
                    </div>
                    <p>
                      You agree to use our services responsibly. Prohibited
                      activities include:
                    </p>
                    <ul className="terms-list">
                      <li>Fraudulent orders or payment methods</li>
                      <li>Harassment or offensive behavior</li>
                      <li>Reselling products without permission</li>
                      <li>Attempting to hack or disrupt our services</li>
                      <li>Posting fake reviews or spam</li>
                    </ul>
                  </div>

                  {/* Contact */}
                  <div className="terms-section" id="contact">
                    <div className="section-header">
                      <Mail size={24} />
                      <h2>Contact Us</h2>
                    </div>
                    <p>If you have any questions about these terms:</p>
                    <div className="contact-info">
                      <div className="contact-item">
                        <Mail size={18} />
                        <span>elegance.myperfume@gmail.com</span>
                      </div>
                      <div className="contact-item">
                        <Phone size={18} />
                        <span>+92 319 9457143</span>
                      </div>
                      <div className="contact-item">
                        <MapPin size={18} />
                        <span>Gulburg Greens, Islamabad, Pakistan</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </section>
      </div>
    </>
  );
};

export default TermsOfServicePage;

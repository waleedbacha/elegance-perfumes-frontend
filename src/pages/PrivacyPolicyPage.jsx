import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server, Mail, Phone, MapPin } from "lucide-react";
import "../styles/pages/PrivacyPolicyPage.css";

const PrivacyPolicyPage = () => {
  return (
    <div className="privacy-page">
      {/* Hero Section */}
      <section className="privacy-hero">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <span className="hero-badge">🔒 Privacy Policy</span>
            <h1 className="hero-title">
              Your <span className="highlight">Privacy</span> Matters
            </h1>
            <p className="hero-subtitle">
              We are committed to protecting your personal information and being
              transparent about how we use it.
            </p>
            <p className="hero-date">Last Updated: August 2026</p>
          </motion.div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="privacy-content">
        <Container>
          <Row className="g-5">
            {/* Sidebar */}
            <Col lg={3}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="privacy-sidebar"
              >
                <h5>Quick Links</h5>
                <ul>
                  <li>
                    <a href="#collect">Information We Collect</a>
                  </li>
                  <li>
                    <a href="#use">How We Use Your Data</a>
                  </li>
                  <li>
                    <a href="#share">Data Sharing</a>
                  </li>
                  <li>
                    <a href="#security">Security</a>
                  </li>
                  <li>
                    <a href="#rights">Your Rights</a>
                  </li>
                  <li>
                    <a href="#cookies">Cookies</a>
                  </li>
                  <li>
                    <a href="#contact">Contact Us</a>
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
                className="privacy-main"
              >
                {/* Introduction */}
                <div className="privacy-section">
                  <h2>Introduction</h2>
                  <p>
                    At Elegance Perfumes, we take your privacy seriously. This
                    policy explains how we collect, use, and protect your
                    personal information when you visit our website or make a
                    purchase.
                  </p>
                </div>

                {/* Collect */}
                <div className="privacy-section" id="collect">
                  <h2>Information We Collect</h2>
                  <div className="info-grid">
                    <div className="info-card">
                      <h5>Personal Information</h5>
                      <ul>
                        <li>Full name</li>
                        <li>Email address</li>
                        <li>Phone number</li>
                        <li>Shipping & billing addresses</li>
                        <li>Payment details</li>
                      </ul>
                    </div>
                    <div className="info-card">
                      <h5>Non-Personal Information</h5>
                      <ul>
                        <li>Browser type</li>
                        <li>Device information</li>
                        <li>IP address</li>
                        <li>Pages visited</li>
                        <li>Time spent on site</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Use */}
                <div className="privacy-section" id="use">
                  <h2>How We Use Your Data</h2>
                  <div className="use-grid">
                    <div className="use-item">
                      <span className="use-icon">📦</span>
                      <div>
                        <h6>Order Processing</h6>
                        <p>
                          Process and fulfill your orders, send confirmations
                          and updates
                        </p>
                      </div>
                    </div>
                    <div className="use-item">
                      <span className="use-icon">💬</span>
                      <div>
                        <h6>Customer Support</h6>
                        <p>Respond to inquiries and provide assistance</p>
                      </div>
                    </div>
                    <div className="use-item">
                      <span className="use-icon">📧</span>
                      <div>
                        <h6>Marketing Communications</h6>
                        <p>Send promotional emails (with your consent)</p>
                      </div>
                    </div>
                    <div className="use-item">
                      <span className="use-icon">🔒</span>
                      <div>
                        <h6>Security & Fraud Prevention</h6>
                        <p>Protect against unauthorized transactions</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Share */}
                <div className="privacy-section" id="share">
                  <h2>Data Sharing</h2>
                  <p>
                    We never sell your personal information. We may share your
                    data with:
                  </p>
                  <ul className="share-list">
                    <li>Shipping partners for order delivery</li>
                    <li>Payment processors for secure transactions</li>
                    <li>Service providers who assist our operations</li>
                    <li>Legal authorities when required by law</li>
                  </ul>
                </div>

                {/* Security */}
                <div className="privacy-section" id="security">
                  <h2>Security</h2>
                  <div className="security-grid">
                    <div className="security-item">
                      <Lock size={24} />
                      <span>SSL Encryption</span>
                    </div>
                    <div className="security-item">
                      <Shield size={24} />
                      <span>Secure Payments</span>
                    </div>
                    <div className="security-item">
                      <Eye size={24} />
                      <span>Access Controls</span>
                    </div>
                    <div className="security-item">
                      <Server size={24} />
                      <span>Regular Audits</span>
                    </div>
                  </div>
                </div>

                {/* Rights */}
                <div className="privacy-section" id="rights">
                  <h2>Your Rights</h2>
                  <ul className="rights-list">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Request data deletion</li>
                    <li>Withdraw consent for marketing</li>
                    <li>Opt-out of communications</li>
                  </ul>
                </div>

                {/* Cookies */}
                <div className="privacy-section" id="cookies">
                  <h2>Cookies</h2>
                  <p>
                    We use cookies to enhance your shopping experience. You can
                    manage cookie preferences in your browser settings.
                  </p>
                </div>

                {/* Contact */}
                <div className="privacy-section" id="contact">
                  <h2>Contact Us</h2>
                  <p>If you have any questions about our privacy policy:</p>
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
  );
};

export default PrivacyPolicyPage;

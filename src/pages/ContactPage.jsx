import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/pages/ContactPage.css";
import SEO from "../components/common/SEO";

// Custom TikTok Icon
const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    <path d="M9 12a4 4 0 1 1 4-4" />
  </svg>
);

// Custom Instagram Icon
const InstagramIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Custom YouTube Icon
const YoutubeIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Contact Info
  const contactInfo = {
    address: "Gulburg Greens, Islamabad, Pakistan",
    phone: "+92 319 9457143",
    email: "elegance.myperfume@gmail.com",
    tiktok:
      "https://www.tiktok.com/@elegance.myperfumes?_r=1&_t=ZS-97zqqy3DRtC",
    hours: "Mon - Sat: 9:00 AM - 9:00 PM",
    whatsapp: "https://wa.me/923199457143",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitSuccess(true);
    toast.success("Message sent successfully!");
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });

    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with Elegance Perfumes. Reach us via phone, email, WhatsApp, or visit our store in Islamabad, Pakistan."
        keywords="contact perfume store, fragrance support, perfume customer service, Elegance Perfumes contact"
        url="/contact"
      />
      <div className="contact-page">
        {/* ========================================== */}
        {/* HERO SECTION */}
        {/* ========================================== */}
        <section className="contact-hero">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="hero-content"
            >
              <span className="hero-badge">✦ Get in Touch</span>
              <h1 className="hero-title">
                Let's <span className="highlight">Connect</span>
              </h1>
              <p className="hero-subtitle">
                We'd love to hear from you. Whether you have a question about
                our fragrances, need assistance with an order, or just want to
                say hello.
              </p>
            </motion.div>
          </Container>
        </section>

        {/* ========================================== */}
        {/* CONTACT CARDS */}
        {/* ========================================== */}
        <section className="contact-cards-section">
          <Container>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Row className="g-4">
                {/* WhatsApp Card */}
                <Col lg={4} md={6}>
                  <motion.div
                    variants={fadeUp}
                    className="contact-card whatsapp"
                  >
                    <div className="card-icon">
                      <MessageCircle size={28} />
                    </div>
                    <h4>WhatsApp</h4>
                    <p>Chat with us instantly</p>
                    <a
                      href={contactInfo.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-link"
                    >
                      <span>{contactInfo.phone}</span>
                      <ArrowRight size={16} />
                    </a>
                  </motion.div>
                </Col>

                {/* Email Card */}
                <Col lg={4} md={6}>
                  <motion.div variants={fadeUp} className="contact-card email">
                    <div className="card-icon">
                      <Mail size={28} />
                    </div>
                    <h4>Email Us</h4>
                    <p>We'll respond within 24 hours</p>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="card-link"
                    >
                      <span>{contactInfo.email}</span>
                      <ArrowRight size={16} />
                    </a>
                  </motion.div>
                </Col>

                {/* Phone Card */}
                <Col lg={4} md={6}>
                  <motion.div variants={fadeUp} className="contact-card phone">
                    <div className="card-icon">
                      <Phone size={28} />
                    </div>
                    <h4>Call Us</h4>
                    <p>Mon-Sat, 9AM - 9PM</p>
                    <a href={`tel:${contactInfo.phone}`} className="card-link">
                      <span>{contactInfo.phone}</span>
                      <ArrowRight size={16} />
                    </a>
                  </motion.div>
                </Col>
              </Row>
            </motion.div>
          </Container>
        </section>

        {/* ========================================== */}
        {/* GOOGLE MAP SECTION */}
        {/* ========================================== */}
        <section className="map-section">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="map-header">
                <span className="section-tag">📍 Find Us</span>
                <h2 className="section-title">
                  Visit Our <span className="highlight">Luxury Store</span>
                </h2>
                <p className="section-subtitle">
                  Come experience our premium fragrances in person
                </p>
              </div>

              <div className="map-wrapper">
                <div className="map-container">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3318.123456789012!2d73.043!3d33.684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbfd8e8e8e8e8%3A0x1234567890abcdef!2sGulburg%20Greens%2C%20Islamabad!5e0!3m2!1sen!2s!4v1234567890123"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Elegance Perfumes Location"
                  />
                </div>
                <div className="map-overlay">
                  <div className="map-info">
                    <h5>📍 Gulburg Greens</h5>
                    <p>Islamabad, Pakistan</p>
                    <div className="map-hours">
                      <Clock size={16} />
                      <span>{contactInfo.hours}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* ========================================== */}
        {/* CONTACT FORM & INFO */}
        {/* ========================================== */}
        <section className="contact-form-section">
          <Container>
            <Row className="g-5">
              {/* Form */}
              <Col lg={7}>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="form-wrapper"
                >
                  <div className="form-header">
                    <span className="form-tag">✉️ Send Message</span>
                    <h3>Get in Touch</h3>
                    <p>Fill out the form and we'll get back to you soon</p>
                  </div>

                  {submitSuccess && (
                    <Alert variant="success" className="success-alert">
                      <CheckCircle size={20} />
                      <div>
                        <strong>Message sent!</strong>
                        <p>We'll get back to you within 24 hours.</p>
                      </div>
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit} className="contact-form">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="form-group">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="form-group">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="form-group">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            placeholder="+92 300 1234567"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="form-group">
                          <Form.Label>Subject</Form.Label>
                          <Form.Control
                            type="text"
                            name="subject"
                            placeholder="Order Inquiry"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="form-group">
                      <Form.Label>Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="message"
                        placeholder="Tell us how we can help you..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      className="submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" />
                          &nbsp; Sending...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          &nbsp; Send Message
                        </>
                      )}
                    </Button>
                  </Form>
                </motion.div>
              </Col>

              {/* Info Sidebar */}
              <Col lg={5}>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="info-sidebar"
                >
                  <div className="sidebar-header">
                    <span className="sidebar-tag">✦ Information</span>
                    <h3>Contact Details</h3>
                  </div>

                  <div className="info-items">
                    <div className="info-item">
                      <div className="info-icon">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h6>Address</h6>
                        <p>{contactInfo.address}</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon">
                        <Phone size={20} />
                      </div>
                      <div>
                        <h6>Phone</h6>
                        <p>{contactInfo.phone}</p>
                        <a
                          href={contactInfo.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="whatsapp-link"
                        >
                          <MessageCircle size={14} />
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon">
                        <Mail size={20} />
                      </div>
                      <div>
                        <h6>Email</h6>
                        <p>{contactInfo.email}</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h6>Business Hours</h6>
                        <p>{contactInfo.hours}</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="social-links">
                    <h6>Follow Us</h6>
                    <div className="social-icons">
                      <a
                        href={contactInfo.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon tiktok"
                        title="TikTok"
                      >
                        <TikTokIcon size={22} />
                      </a>
                      <a
                        href="#"
                        className="social-icon instagram"
                        title="Instagram"
                      >
                        <InstagramIcon size={22} />
                      </a>
                      <a
                        href="#"
                        className="social-icon youtube"
                        title="YouTube"
                      >
                        <YoutubeIcon size={22} />
                      </a>
                      <a
                        href={contactInfo.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon whatsapp"
                        title="WhatsApp"
                      >
                        <MessageCircle size={22} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* ========================================== */}
        {/* WHATSAPP FLOATING BUTTON */}
        {/* ========================================== */}
        <a
          href={contactInfo.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-float"
          title="Chat on WhatsApp"
        >
          <MessageCircle size={32} />
          <span className="whatsapp-pulse" />
        </a>
      </div>
    </>
  );
};

export default ContactPage;

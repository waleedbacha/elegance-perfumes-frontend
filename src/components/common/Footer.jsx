import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer-elegance">
      <Container>
        <Row className="footer-top g-4">
          {/* Brand Column - full width on mobile */}
          <Col lg={4} md={12} className="footer-col footer-col-brand">
            <div className="footer-brand">
              <span className="brand-white">ELEGANCE</span>
              <span className="brand-red">PERFUMES</span>
            </div>
            <p className="footer-description">
              Luxury fragrances crafted for unforgettable impressions.
            </p>
            <div className="social-icons">
              <a href="#" className="social-link" aria-label="Facebook">
                <FaFacebook size={16} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <FaInstagram size={16} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FaTwitter size={16} />
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <FaYoutube size={16} />
              </a>
            </div>
          </Col>

          {/* Row of 3: Quick Links, Support, Contact - stays one row on mobile */}
          <Col lg={8} md={12} className="footer-col footer-col-triorow">
            <div className="footer-tri-row">
              <div className="footer-tri-block">
                <h4 className="footer-heading">Quick Links</h4>
                <ul className="footer-links">
                  <li>
                    <Link to="/shop">Shop</Link>
                  </li>
                  <li>
                    <Link to="/collections">Collections</Link>
                  </li>
                  <li>
                    <Link to="/about">About Us</Link>
                  </li>
                  <li>
                    <Link to="/contact">Contact</Link>
                  </li>
                </ul>
              </div>

              <div className="footer-tri-block">
                <h4 className="footer-heading">Support</h4>
                <ul className="footer-links">
                  <li>
                    <Link to="/privacy">FAQ</Link>
                  </li>
                  <li>
                    <Link to="/terms#returns">Returns</Link>
                  </li>
                  <li>
                    <Link to="/terms#shipping">Shipping</Link>
                  </li>
                  <li>
                    <Link to="/privacy">Privacy</Link>
                  </li>
                </ul>
              </div>

              <div className="footer-tri-block footer-tri-block-contact">
                <h4 className="footer-heading">Contact Us</h4>
                <div className="footer-contact">
                  <a
                    href="mailto:elegance.myperfume@gmail.com"
                    className="contact-item"
                  >
                    <span className="contact-icon">
                      <Mail size={16} />
                    </span>
                    <span className="contact-text">
                      elegance.myperfume@gmail.com
                    </span>
                  </a>
                  <a href="tel:+923199457143" className="contact-item">
                    <span className="contact-icon">
                      <Phone size={16} />
                    </span>
                    <span className="contact-text">+92 319 9457143</span>
                  </a>
                  <div className="contact-item">
                    <span className="contact-icon">
                      <MapPin size={16} />
                    </span>
                    <span className="contact-text">Islamabad, Pakistan</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} Elegance Perfumes. All rights
            reserved.
          </p>
          <div className="footer-bottom-links">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

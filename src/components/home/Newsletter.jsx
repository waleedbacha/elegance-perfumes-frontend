import React, { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Successfully subscribed!");
    setEmail("");
    setIsLoading(false);
  };

  return (
    <section className="newsletter-section">
      <Container>
        <motion.div
          className="newsletter-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="newsletter-title">
            Join Our <span className="highlight">Newsletter</span>
          </h2>
          <p className="newsletter-subtitle">
            Subscribe to get exclusive offers, new arrivals, and fragrance tips.
          </p>

          <Form onSubmit={handleSubmit} className="newsletter-form">
            <Form.Control
              type="email"
              placeholder="Enter your email address"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="btn-blood-red"
              disabled={isLoading}
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </Form>
        </motion.div>
      </Container>
    </section>
  );
};

export default Newsletter;

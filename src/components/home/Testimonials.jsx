import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Sarah Khan",
    role: "Beauty Enthusiast",
    quote:
      "The fragrances are absolutely divine! I've never experienced such quality and longevity. HAMAMA Perfumes has become my go-to destination for luxury scents.",
    avatar: "SK",
  },
  {
    id: 2,
    name: "Ahmed Raza",
    role: "Luxury Collector",
    quote:
      "The attention to detail and authenticity is unmatched. Every bottle tells a story. Highly recommended for anyone who appreciates fine fragrances.",
    avatar: "AR",
  },
  {
    id: 3,
    name: "Fatima Noor",
    role: "Fashion Blogger",
    quote:
      "I've been collecting perfumes for years and HAMAMA Perfumes has some of the most unique and sophisticated scents I've ever encountered. Truly exceptional!",
    avatar: "FN",
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <Container>
        <div className="section-header">
          <h2 className="section-title">
            What Our <span className="highlight">Customers Say</span>
          </h2>
          <p className="section-subtitle">
            Real experiences from real fragrance lovers
          </p>
        </div>

        <Row className="g-4">
          {testimonials.map((testimonial, index) => (
            <Col md={4} key={testimonial.id}>
              <motion.div
                className="testimonial-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="avatar">{testimonial.avatar}</div>
                <p className="quote">"{testimonial.quote}"</p>
                <div className="author">{testimonial.name}</div>
                <div className="author-role">{testimonial.role}</div>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Testimonials;

import React, { useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getHero } from "../../redux/slices/heroSlice";
import "../../styles/pages/HomePage.css";

const HeroSection = () => {
  const dispatch = useDispatch();
  const { hero, isLoading } = useSelector((state) => state.hero);

  useEffect(() => {
    dispatch(getHero());
  }, [dispatch]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="hero-section" style={{ background: "#0a0a0a" }}>
        <Container className="hero-content">
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ color: "#6b7280" }}>Loading hero...</div>
          </div>
        </Container>
      </section>
    );
  }

  // Use default values if no hero exists
  const heroData = hero || {
    title: "The Night",
    subtitle: "Discover the Art of Scent",
    description:
      "Indulge in the richness of luxury fragrances, crafted for unforgettable impressions.",
    buttonText: "Shop Collection",
    buttonLink: "/shop",
    secondaryButtonText: "Pre-Order Now",
    secondaryButtonLink: "/collections",
    features: [
      { icon: "✓", label: "Authentic", subLabel: "100% Original" },
      { icon: "✓", label: "Fast Delivery", subLabel: "Across Pakistan" },
      { icon: "✓", label: "Secure Payment", subLabel: "100% Safe" },
    ],
    backgroundImage: {
      url: "https://res.cloudinary.com/dcjhzgigb/image/upload/v1785340637/elegance-perfumes/hero/fhxc5eg1cqenhkrkyvmz.png",
    },
  };

  return (
    <section
      className="hero-section"
      style={{ backgroundImage: `url(${heroData.backgroundImage?.url})` }}
    >
      <Container className="hero-content">
        <Row>
          <Col lg={7}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <span className="hero-badge">
                  {heroData.subtitle || "Discover the Art of Scent"}
                </span>
              </motion.div>

              <motion.h1 className="hero-title" variants={fadeInUp}>
                {heroData.title}
                <br />
                <span className="highlight">Daisy Treasure</span>
              </motion.h1>

              <motion.p className="hero-description" variants={fadeInUp}>
                {heroData.description}
              </motion.p>

              <motion.div className="hero-buttons" variants={fadeInUp}>
                <Button
                  className="btn-blood-red btn-lg"
                  as="a"
                  href={heroData.buttonLink || "/shop"}
                >
                  {heroData.buttonText || "Shop Collection"}
                </Button>
                <Button
                  className="btn-outline-blood-red btn-lg"
                  as="a"
                  href={heroData.secondaryButtonLink || "/collections"}
                >
                  {heroData.secondaryButtonText || "Pre-Order Now"}
                </Button>
              </motion.div>

              {/* Features */}
              <motion.div className="hero-features" variants={fadeIn}>
                {heroData.features?.map((feature, index) => (
                  <div key={index} className="hero-feature">
                    <div className="icon-wrapper">{feature.icon || "✓"}</div>
                    <div className="feature-text">
                      <p className="label">{feature.label}</p>
                      <p className="sub-label">{feature.subLabel}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </Col>
        </Row>
      </Container>

      {/* Scroll Indicator */}
      <div className="hero-scroll-indicator">
        <div className="mouse">
          <div className="wheel" />
        </div>
        <span>Scroll</span>
      </div>
    </section>
  );
};

export default HeroSection;

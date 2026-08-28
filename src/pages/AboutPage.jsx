import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion, useAnimation, useInView } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  Award,
  Users,
  Package,
  Star,
  Heart,
  Sparkles,
  Leaf,
  Gem,
  Quote,
  MapPin,
  Mail,
  Phone,
  Crown,
  Shield,
  Zap,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getPublicSettings } from "../redux/slices/settingSlice";
import "../styles/pages/AboutPage.css";
import SEO from "../components/common/SEO";

// Custom social icons
const InstagramIcon = ({ size = 16, className = "" }) => (
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

const TwitterIcon = ({ size = 16, className = "" }) => (
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
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const FacebookIcon = ({ size = 16, className = "" }) => (
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
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const AboutPage = () => {
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.settings);
  const [refreshKey, setRefreshKey] = useState(0);

  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.1 });

  // ============================================
  // GET SETTINGS WITH DEFAULTS
  // ============================================

  const aboutEnabled =
    settings?.about_page_enabled !== undefined
      ? settings.about_page_enabled
      : true;

  // Hero Section
  const heroBadge = settings?.about_hero_badge || "✦ About HAMAMA";
  const heroTitle =
    settings?.about_hero_title || "Crafting Luxury Fragrances Since 2015";
  const heroSubtitle =
    settings?.about_hero_subtitle ||
    "We believe that luxury is an experience, not just a product. Every fragrance we create is a masterpiece of artistry, quality, and passion.";
  const heroBtnPrimaryText =
    settings?.about_hero_btn_primary_text || "Explore Collection";
  const heroBtnPrimaryLink = settings?.about_hero_btn_primary_link || "/shop";
  const heroBtnSecondaryText =
    settings?.about_hero_btn_secondary_text || "Our Story";
  const heroBtnSecondaryLink =
    settings?.about_hero_btn_secondary_link || "/collections";

  // Story Section
  const storyTag = settings?.about_story_tag || "Our Story";
  const storyTitle = settings?.about_story_title || "The Art of Perfumery";
  const storyText1 =
    settings?.about_story_text_1 ||
    "HAMAMA Perfumes was born from a simple yet profound belief: fragrance is the invisible luxury that defines who you are. What started as a passion project in a small studio has grown into Pakistan's premier destination for luxury fragrances.";
  const storyText2 =
    settings?.about_story_text_2 ||
    "We travel the world to source the rarest and most exquisite ingredients—from the lush fields of Grasse to the exotic markets of Dubai. Our master perfumers blend these precious materials with artistry and precision to create scents that are truly unforgettable.";
  const storyFeatures = settings?.about_story_features || [
    "Premium Quality",
    "Sustainable Sourcing",
    "Artisan Craftsmanship",
    "Luxury Experience",
  ];

  // Values Section
  const valuesTag = settings?.about_values_tag || "Our Values";
  const valuesTitle = settings?.about_values_title || "What Drives Us";
  const valuesSubtitle =
    settings?.about_values_subtitle ||
    "Our core values guide everything we do, from sourcing to serving you.";
  const valuesItems = settings?.about_values_items || [
    {
      title: "Luxury Quality",
      description:
        "We source only the finest ingredients from around the world to create unforgettable fragrances.",
    },
    {
      title: "Sustainable Luxury",
      description:
        "Committed to ethical sourcing, sustainable practices, and eco-friendly packaging.",
    },
    {
      title: "Passion for Perfumery",
      description:
        "Every fragrance tells a story. We pour our passion into crafting scents that evoke emotions.",
    },
    {
      title: "Innovation & Excellence",
      description:
        "Constantly exploring new olfactory experiences to bring you the extraordinary.",
    },
  ];

  // Testimonial Section
  const testimonialText =
    settings?.about_testimonial_text ||
    "HAMAMA Perfumes has completely transformed my understanding of luxury fragrances. Every scent tells a story and the quality is unmatched. It's not just perfume; it's an experience.";
  const testimonialAuthorName =
    settings?.about_testimonial_author_name || "Zara Malik";
  const testimonialAuthorTitle =
    settings?.about_testimonial_author_title ||
    "Luxury Beauty Influencer • 500K+ Followers";
  const testimonialRating = settings?.about_testimonial_rating || 5;

  // Stats Section
  const statsData = settings?.about_stats || [
    {
      value: "50K+",
      label: "Happy Customers",
      description: "Trusted by fragrance lovers worldwide",
    },
    {
      value: "10K+",
      label: "Orders Delivered",
      description: "Successfully fulfilled with care",
    },
    {
      value: "4.9",
      label: "Average Rating",
      description: "Based on thousands of reviews",
    },
    {
      value: "100+",
      label: "Premium Brands",
      description: "Curated luxury collections",
    },
  ];

  // CTA Section
  const ctaBadge = settings?.about_cta_badge || "✦ Experience Luxury";
  const ctaTitle = settings?.about_cta_title || "Find Your Signature Scent";
  const ctaSubtitle =
    settings?.about_cta_subtitle ||
    "Discover our curated collection of luxury fragrances and find the scent that defines you.";
  const ctaBtnPrimaryText = settings?.about_cta_btn_primary_text || "Shop Now";
  const ctaBtnPrimaryLink = settings?.about_cta_btn_primary_link || "/shop";
  const ctaBtnSecondaryText =
    settings?.about_cta_btn_secondary_text || "Explore Collections";
  const ctaBtnSecondaryLink =
    settings?.about_cta_btn_secondary_link || "/collections";

  // Contact Info
  const contactInfo = settings?.about_contact_info || [
    {
      icon: "MapPin",
      title: "Visit Us",
      details: ["Luxury Fragrance House", "Islamabad, Pakistan"],
    },
    {
      icon: "Mail",
      title: "Email Us",
      details: ["hamama.myperfume@gmail.com", "info@hamama.pk"],
    },
    {
      icon: "Phone",
      title: "Call Us",
      details: ["+923199457143", "Mon-Sat, 9AM - 9PM"],
    },
  ];

  // ============================================
  // ALL HOOKS MUST BE CALLED BEFORE CONDITIONAL RETURN
  // ============================================

  // Fetch settings
  useEffect(() => {
    dispatch(getPublicSettings("about"));
  }, [dispatch, refreshKey]);

  // Listen for localStorage changes to refresh settings
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "aboutSettingsUpdated") {
        console.log("🔄 About settings updated, refreshing...");
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Animation
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // ============================================
  // IF ABOUT PAGE IS DISABLED - RETURN AFTER HOOKS
  // ============================================

  if (!aboutEnabled) {
    return (
      <div className="about-page">
        <Container className="text-center py-5">
          <h2 className="text-light">About Us</h2>
          <p className="text-muted">Page coming soon.</p>
        </Container>
      </div>
    );
  }

  // ============================================
  // ANIMATION HELPERS
  // ============================================

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

  const statItem = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  // ============================================
  // RENDER TITLE HELPER
  // ============================================

  const renderHighlightedTitle = (title) => {
    const words = title.split(" ");
    if (words.length <= 1) {
      return title;
    }
    const lastWord = words.pop();
    return (
      <>
        {words.join(" ")} <span className="highlight">{lastWord}</span>
      </>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <>
      <SEO
        title="About Us"
        description="Learn about HAMAMA Perfumes - Pakistan's premier luxury fragrance destination. Discover our story, values, and commitment to authentic scents."
        keywords="about perfume store, luxury fragrance brand, perfume story, HAMAMA Perfumes"
        url="/about"
      />
      <div className="about-page">
        {/* ========================================== */}
        {/* HERO SECTION */}
        {/* ========================================== */}
        <section className="about-hero">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="hero-content"
            >
              <span className="hero-badge">{heroBadge}</span>
              <h1 className="hero-title">
                {renderHighlightedTitle(heroTitle)}
              </h1>
              <p className="hero-subtitle">{heroSubtitle}</p>
              <div className="hero-buttons">
                <Link to={heroBtnPrimaryLink} className="btn btn-primary">
                  {heroBtnPrimaryText}
                </Link>
                <Link to={heroBtnSecondaryLink} className="btn btn-outline">
                  {heroBtnSecondaryText}
                </Link>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* ========================================== */}
        {/* STATISTICS SECTION */}
        {/* ========================================== */}
        <section className="stats-section">
          <Container>
            <motion.div
              ref={ref}
              initial="hidden"
              animate={controls}
              variants={staggerContainer}
            >
              <Row className="g-4">
                {statsData.map((stat, index) => (
                  <Col key={index} lg={3} md={6}>
                    <motion.div variants={statItem} className="stat-card">
                      <div className="stat-icon">
                        {index === 0 && <Users size={32} />}
                        {index === 1 && <Package size={32} />}
                        {index === 2 && <Star size={32} />}
                        {index === 3 && <Award size={32} />}
                      </div>
                      <h3 className="stat-value">{stat.value}</h3>
                      <p className="stat-label">{stat.label}</p>
                      <p className="stat-description">{stat.description}</p>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </motion.div>
          </Container>
        </section>

        {/* ========================================== */}
        {/* STORY SECTION */}
        {/* ========================================== */}
        <section className="story-section">
          <Container>
            <Row className="align-items-center g-5">
              <Col lg={6}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <span className="section-tag">{storyTag}</span>
                  <h2 className="section-title">
                    {renderHighlightedTitle(storyTitle)}
                  </h2>
                  <p className="story-text">{storyText1}</p>
                  <p className="story-text">{storyText2}</p>
                  <div className="story-features">
                    {storyFeatures.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <CheckCircle size={16} className="feature-icon" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </Col>
              <Col lg={6}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="story-image-wrapper"
                >
                  <div className="story-image">
                    <div className="image-content">
                      <Gem size={48} color="#8B0000" />
                      <span>Luxury Fragrances</span>
                    </div>
                    <div className="floating-badge badge-1">
                      <Sparkles size={20} />
                      <span>
                        {statsData[3]?.value || "100+"} Premium Scents
                      </span>
                    </div>
                    <div className="floating-badge badge-2">
                      <Award size={20} />
                      <span>{statsData[2]?.value || "4.9"} ⭐ Rating</span>
                    </div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* ========================================== */}
        {/* VALUES SECTION */}
        {/* ========================================== */}
        <section className="values-section">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="section-header"
            >
              <span className="section-tag">{valuesTag}</span>
              <h2 className="section-title">
                {renderHighlightedTitle(valuesTitle)}
              </h2>
              <p className="section-subtitle">{valuesSubtitle}</p>
            </motion.div>

            <Row className="g-4">
              {valuesItems.map((value, index) => (
                <Col key={index} lg={3} md={6}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="value-card"
                  >
                    <div className="value-icon">
                      {index === 0 && <Gem size={28} />}
                      {index === 1 && <Leaf size={28} />}
                      {index === 2 && <Heart size={28} />}
                      {index === 3 && <Sparkles size={28} />}
                    </div>
                    <h4 className="value-title">{value.title}</h4>
                    <p className="value-description">{value.description}</p>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* ========================================== */}
        {/* TESTIMONIAL SECTION */}
        {/* ========================================== */}
        <section className="testimonial-section">
          <Container>
            <Row className="justify-content-center">
              <Col lg={10}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="testimonial-card"
                >
                  <div className="quote-icon">
                    <Quote size={48} />
                  </div>
                  <blockquote>{testimonialText}</blockquote>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      {testimonialAuthorName.charAt(0)}
                    </div>
                    <div>
                      <h6>{testimonialAuthorName}</h6>
                      <span>{testimonialAuthorTitle}</span>
                    </div>
                  </div>
                  <div className="testimonial-rating">
                    {[...Array(testimonialRating)].map((_, i) => (
                      <Star key={i} size={16} fill="#8B0000" stroke="#8B0000" />
                    ))}
                    {[...Array(5 - testimonialRating)].map((_, i) => (
                      <Star
                        key={`empty-${i}`}
                        size={16}
                        fill="none"
                        stroke="#4A4A4A"
                      />
                    ))}
                  </div>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* ========================================== */}
        {/* CTA SECTION */}
        {/* ========================================== */}
        <section className="cta-section">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="cta-content"
            >
              <span className="cta-badge">{ctaBadge}</span>
              <h2 className="cta-title">{renderHighlightedTitle(ctaTitle)}</h2>
              <p className="cta-subtitle">{ctaSubtitle}</p>
              <div className="cta-buttons">
                <Link to={ctaBtnPrimaryLink} className="btn btn-primary btn-lg">
                  {ctaBtnPrimaryText}
                </Link>
                <Link
                  to={ctaBtnSecondaryLink}
                  className="btn btn-outline btn-lg"
                >
                  {ctaBtnSecondaryText}
                </Link>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* ========================================== */}
        {/* CONTACT INFO */}
        {/* ========================================== */}
        {/* ========================================== */}
        {/* CONTACT INFO - USING SETTINGS */}
        {/* ========================================== */}
        <section className="contact-info-section">
          <Container>
            <Row className="g-4">
              {contactInfo.map((item, index) => {
                const IconComponent =
                  item.icon === "MapPin"
                    ? MapPin
                    : item.icon === "Mail"
                      ? Mail
                      : item.icon === "Phone"
                        ? Phone
                        : MapPin;

                return (
                  <Col md={4} key={index}>
                    <div className="contact-info-item">
                      <div className="contact-icon">
                        <IconComponent size={24} />
                      </div>
                      <h6>{item.title}</h6>
                      {item.details.map((detail, i) => (
                        <p key={i}>{detail}</p>
                      ))}
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Container>
        </section>
      </div>
    </>
  );
};

export default AboutPage;

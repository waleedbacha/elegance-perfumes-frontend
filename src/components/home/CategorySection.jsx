import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, LayoutGrid, LayoutList } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getCategories } from "../../redux/slices/categorySlice";
import { getPublicSettings } from "../../redux/slices/settingSlice";
import "../../styles/components/CategorySection.css";

const CategorySection = () => {
  const dispatch = useDispatch();
  const { categories, isLoading } = useSelector((state) => state.categories);
  const { settings } = useSelector((state) => state.settings);
  const [gridLayout, setGridLayout] = useState("three");
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to fetch data
  const fetchData = useCallback(() => {
    dispatch(getCategories());
    dispatch(getPublicSettings("category"));
  }, [dispatch]);

  // Fetch data on mount and when refreshKey changes
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  // ✅ Listen for localStorage changes to refresh settings
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "categorySettingsUpdated") {
        console.log("🔄 Category settings updated, refreshing...");
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Log settings for debugging
  useEffect(() => {
    console.log("🔍 CategorySection settings:", settings);
  }, [settings]);

  // Get settings with defaults
  const sectionTitle =
    settings?.category_section_title || "Explore Our Collections";
  const sectionSubtitle =
    settings?.category_section_subtitle ||
    "Discover the perfect fragrance for every moment";
  const badgeText = settings?.category_badge_text || "Collection";
  const shopNowText = settings?.category_shop_now_text || "Shop Now";
  const sectionEnabled =
    settings?.category_section_enabled !== undefined
      ? settings.category_section_enabled
      : true;

  // If section is disabled, don't render
  if (!sectionEnabled) {
    return null;
  }

  const getGridClasses = () => {
    switch (gridLayout) {
      case "one":
        return { xs: 12, md: 12, lg: 12 };
      case "two":
        return { xs: 6, md: 6, lg: 6 };
      case "three":
        return { xs: 4, md: 4, lg: 4 };
      case "four":
        return { xs: 6, md: 4, lg: 3 };
      default:
        return { xs: 4, md: 4, lg: 4 };
    }
  };

  const gridOptions = [
    { value: "one", icon: <LayoutList size={16} />, label: "1" },
    { value: "two", icon: <Grid size={16} />, label: "2" },
    { value: "three", icon: <LayoutGrid size={16} />, label: "3" },
    { value: "four", icon: <Grid size={16} />, label: "4" },
  ];

  // Split title to highlight the last word
  const renderTitle = (title) => {
    if (!title)
      return (
        <h2 className="section-title">
          Explore Our <span className="highlight">Collections</span>
        </h2>
      );

    const words = title.split(" ");
    if (words.length <= 1) {
      return <h2 className="section-title">{title}</h2>;
    }
    const lastWord = words.pop();
    return (
      <h2 className="section-title">
        {words.join(" ")} <span className="highlight">{lastWord}</span>
      </h2>
    );
  };

  if (isLoading) {
    return (
      <section className="categories-section">
        <Container>
          <div className="section-header">
            <h2 className="section-title">
              Explore Our <span className="highlight">Collections</span>
            </h2>
            <p className="section-subtitle">Loading categories...</p>
          </div>
          <Row>
            {[1, 2, 3].map((i) => (
              <Col key={i} xs={4} md={4} lg={4}>
                <div className="category-card-skeleton">
                  <div className="skeleton-image" />
                  <div className="skeleton-text" />
                  <div className="skeleton-text short" />
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="categories-section">
      <Container>
        <div className="section-header">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {renderTitle(sectionTitle)}
            <p className="section-subtitle">{sectionSubtitle}</p>
          </motion.div>
        </div>

        {/* Grid Selector */}
        <div className="grid-selector-wrapper">
          <div className="grid-selector">
            <div className="grid-selector-options">
              {gridOptions.map((option) => (
                <button
                  key={option.value}
                  className={`grid-option ${gridLayout === option.value ? "active" : ""}`}
                  onClick={() => setGridLayout(option.value)}
                  aria-label={`${option.label} column view`}
                >
                  {option.icon}
                </button>
              ))}
            </div>
            <span className="grid-count">{categories.length} items</span>
          </div>
        </div>

        <Row className="g-3 g-md-4">
          <AnimatePresence mode="wait">
            {categories.map((category, index) => {
              const gridCols = getGridClasses();
              return (
                <Col
                  key={category._id || category.name}
                  xs={gridCols.xs}
                  md={gridCols.md}
                  lg={gridCols.lg}
                  className="category-col"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="category-wrapper"
                    layout
                  >
                    <Link
                      to={
                        category.link ||
                        `/collections?category=${category.name}`
                      }
                      className="category-card-link"
                    >
                      <div className="category-card">
                        <div className="category-image-wrapper">
                          <img
                            src={category.image?.url || category.imageUrl}
                            alt={category.displayName}
                            className="category-image"
                            loading="lazy"
                          />
                          <div
                            className="category-overlay"
                            style={{
                              background: `linear-gradient(to top, ${category.gradient || "rgba(139, 0, 0, 0.85)"} 0%, rgba(0,0,0,0.3) 60%, transparent 100%)`,
                            }}
                          >
                            <div className="category-content">
                              <div className="category-badge">
                                <span className="badge-text">{badgeText}</span>
                              </div>
                              <h3 className="category-name">
                                {category.displayName}
                              </h3>
                              <p className="category-desc">
                                {category.description}
                              </p>
                              <div className="category-link-wrapper">
                                <span className="category-link">
                                  {shopNowText}
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                  </svg>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </Col>
              );
            })}
          </AnimatePresence>
        </Row>
      </Container>
    </section>
  );
};

export default CategorySection;

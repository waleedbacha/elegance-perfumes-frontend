import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Zap,
  Star,
  Grid,
  LayoutGrid,
  LayoutList,
  Sparkles,
} from "lucide-react";
import { getNewArrivals } from "../../redux/slices/productSlice";
import { addToCart } from "../../redux/slices/cartSlice";
import { toggleWishlist } from "../../redux/slices/wishlistSlice";
import toast from "react-hot-toast";
import "../../styles/components/FeaturedProduct.css";

const NewArrivals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { newArrivals, isLoading } = useSelector((state) => state.products);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [addingToCart, setAddingToCart] = useState({});
  const [gridLayout, setGridLayout] = useState("three");

  useEffect(() => {
    dispatch(getNewArrivals(8));
  }, [dispatch]);

  const isInWishlist = (productId) => {
    return wishlistItems.some(
      (item) => item.product?._id === productId || item.product === productId,
    );
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    e.preventDefault();

    if (!product.sizes || product.sizes.length === 0) {
      toast.error("No size available for this product");
      return;
    }

    const availableSize = product.sizes.find((s) => s.stock > 0);
    if (!availableSize) {
      toast.error("Product is out of stock");
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [product._id]: true }));

    dispatch(
      addToCart({
        productId: product._id,
        size: availableSize.size,
        quantity: 1,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success(`${product.name} added to cart! 🛒`);
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to add to cart");
      })
      .finally(() => {
        setAddingToCart((prev) => ({ ...prev, [product._id]: false }));
      });
  };

  const handleBuyNow = (e, product) => {
    e.stopPropagation();
    e.preventDefault();

    if (!product.sizes || product.sizes.length === 0) {
      toast.error("No size available for this product");
      return;
    }

    const availableSize = product.sizes.find((s) => s.stock > 0);
    if (!availableSize) {
      toast.error("Product is out of stock");
      return;
    }

    dispatch(
      addToCart({
        productId: product._id,
        size: availableSize.size,
        quantity: 1,
      }),
    );
    navigate("/checkout");
  };

  const handleWishlistToggle = (e, productId) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(toggleWishlist(productId));
  };

  const handleCardClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          fill={i < fullStars ? "#D4AF37" : "none"}
          color={i < fullStars ? "#D4AF37" : "#4A4A4A"}
          className="star-icon"
        />,
      );
    }
    return stars;
  };

  const getGridClasses = () => {
    switch (gridLayout) {
      case "one":
        return { xs: 12, sm: 12, md: 12, lg: 12 };
      case "two":
        return { xs: 6, sm: 6, md: 6, lg: 6 };
      case "three":
        return { xs: 4, sm: 4, md: 4, lg: 4 };
      case "four":
        return { xs: 6, sm: 6, md: 4, lg: 3 };
      default:
        return { xs: 4, sm: 4, md: 4, lg: 4 };
    }
  };

  const gridOptions = [
    { value: "one", icon: <LayoutList size={16} />, label: "1" },
    { value: "two", icon: <Grid size={16} />, label: "2" },
    { value: "three", icon: <LayoutGrid size={16} />, label: "3" },
    { value: "four", icon: <Grid size={16} />, label: "4" },
  ];

  if (isLoading) {
    return (
      <section className="featured-section new-arrivals-section">
        <Container>
          <div className="section-header">
            <h2 className="section-title">
              <Sparkles className="inline-icon" /> New{" "}
              <span className="highlight">Arrivals</span>
            </h2>
            <p className="section-subtitle">Fresh fragrances just added</p>
          </div>
          <Row className="g-3 g-md-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Col xs={6} md={4} lg={3} key={i}>
                <div className="product-card-skeleton">
                  <div className="skeleton-image" />
                  <div className="skeleton-body">
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                    <div className="skeleton-line medium" />
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    );
  }

  if (!newArrivals || newArrivals.length === 0) {
    return null;
  }

  return (
    <section className="featured-section new-arrivals-section">
      <Container>
        <div className="section-header">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">
              <Sparkles className="inline-icon" /> New{" "}
              <span className="highlight">Arrivals</span>
            </h2>
            <p className="section-subtitle">Fresh fragrances just added</p>
          </motion.div>
        </div>

        <div className="featured-grid-selector-wrapper">
          <div className="featured-grid-selector">
            <div className="featured-grid-selector-options">
              {gridOptions.map((option) => (
                <button
                  key={option.value}
                  className={`featured-grid-option ${gridLayout === option.value ? "active" : ""}`}
                  onClick={() => setGridLayout(option.value)}
                  aria-label={`${option.label} column view`}
                >
                  {option.icon}
                </button>
              ))}
            </div>
            <span className="featured-grid-count">
              {newArrivals.length} items
            </span>
          </div>
        </div>

        <Row className="g-3 g-md-4">
          {newArrivals.slice(0, 8).map((product, index) => {
            const gridCols = getGridClasses();
            return (
              <Col
                key={product._id}
                xs={gridCols.xs}
                sm={gridCols.sm}
                md={gridCols.md}
                lg={gridCols.lg}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="product-card-shop"
                  onClick={() => handleCardClick(product._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCardClick(product._id);
                    }
                  }}
                >
                  <Link
                    to={`/product/${product._id}`}
                    className="product-card-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="image-wrapper">
                      <img
                        src={
                          product.images?.[0]?.url ||
                          "https://via.placeholder.com/400x400/1a1a1a/8B0000?text=Elegance"
                        }
                        alt={product.name}
                        loading="lazy"
                      />

                      {/* ✅ ALWAYS show "New" badge for New Arrivals */}
                      <span className="badge new">New</span>

                      {product.discount > 0 && (
                        <span className="badge sale">
                          {product.discount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="info">
                      <div className="brand">{product.brand}</div>
                      <div className="name">{product.name}</div>
                      <div className="rating">
                        <span className="stars">
                          {renderStars(product.ratings?.average || 0)}
                        </span>
                        <span className="count">
                          ({product.ratings?.count || 0})
                        </span>
                      </div>
                      <div className="price">
                        <span className="current">
                          PKR {product.price.toLocaleString()}
                        </span>
                        {product.comparePrice && (
                          <span className="original">
                            PKR {product.comparePrice.toLocaleString()}
                          </span>
                        )}
                        {product.discount > 0 && (
                          <span className="discount">-{product.discount}%</span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div
                    className="product-actions-shop"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={`action-btn wishlist-btn ${isInWishlist(product._id) ? "active" : ""}`}
                      onClick={(e) => handleWishlistToggle(e, product._id)}
                      title={
                        isInWishlist(product._id)
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"
                      }
                    >
                      <Heart
                        size={16}
                        fill={isInWishlist(product._id) ? "#8B0000" : "none"}
                        color={
                          isInWishlist(product._id) ? "#8B0000" : "#FFFFFF"
                        }
                      />
                    </button>

                    <button
                      className="action-btn add-to-cart-btn"
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={addingToCart[product._id]}
                      title="Add to Cart"
                    >
                      {addingToCart[product._id] ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <ShoppingBag size={16} />
                      )}
                    </button>

                    <button
                      className="action-btn buy-now-btn"
                      onClick={(e) => handleBuyNow(e, product)}
                      title="Buy Now"
                    >
                      <Zap size={14} />
                    </button>
                  </div>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default NewArrivals;

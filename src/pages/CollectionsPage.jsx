import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container } from "react-bootstrap";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid,
  LayoutGrid,
  LayoutList,
  Heart,
  ShoppingBag,
  Zap,
  ChevronDown,
  Star,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getProducts } from "../redux/slices/productSlice";
import { addToCart } from "../redux/slices/cartSlice";
import { toggleWishlist, getWishlist } from "../redux/slices/wishlistSlice";
import { getPublicSettings } from "../redux/slices/settingSlice";
import Navbar from "../components/common/Navbar";
import toast from "react-hot-toast";
import "../styles/pages/CollectionsPage.css";

// Import background image
import collectionsBg from "../assets/images/hero-bg.jpg";
import SEO from "../components/common/SEO";

const CollectionsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { products, isLoading, pagination } = useSelector(
    (state) => state.products,
  );
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.settings);

  const categoryParam = searchParams.get("category") || "all";

  const [viewMode, setViewMode] = useState("grid-3");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasFetched = useRef(false);

  const categories = ["all", "men", "women", "unisex", "niche"];

  // ============================================
  // GET SETTINGS WITH DEFAULTS
  // ============================================

  const collectionTitle = settings?.collection_page_title || "All Collections";
  const collectionSubtitle =
    settings?.collection_page_subtitle ||
    "Discover the perfect fragrance for every moment";
  const collectionHeroImage =
    settings?.collection_hero_image?.url ||
    settings?.collection_hero_image ||
    collectionsBg;
  const collectionEnabled =
    settings?.collection_section_enabled !== undefined
      ? settings.collection_section_enabled
      : true;

  // ============================================
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURN
  // ============================================

  // Fetch settings on mount and when refreshKey changes
  useEffect(() => {
    dispatch(getPublicSettings("collection"));
  }, [dispatch, refreshKey]);

  // ✅ Listen for localStorage changes to refresh settings
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "collectionSettingsUpdated") {
        console.log("🔄 Collection settings updated, refreshing...");
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch wishlist on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const params = {
        page: currentPage,
        limit: 12,
        sortBy,
        sortOrder,
        ...(activeCategory !== "all" && { category: activeCategory }),
      };
      dispatch(getProducts(params));
    }
  }, [dispatch, currentPage, sortBy, sortOrder, activeCategory]);

  // Update active category from URL
  useEffect(() => {
    setActiveCategory(categoryParam);
    setCurrentPage(1);
  }, [categoryParam]);

  // Fetch products when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 12,
      sortBy,
      sortOrder,
      ...(activeCategory !== "all" && { category: activeCategory }),
    };
    dispatch(getProducts(params));
  }, [dispatch, currentPage, sortBy, sortOrder, activeCategory]);

  // ============================================
  // IF COLLECTION IS DISABLED - RETURN AFTER HOOKS
  // ============================================

  if (!collectionEnabled) {
    return (
      <>
        <Navbar />
        <div className="collections-page">
          <Container className="text-center py-5">
            <h2 className="text-light">Collections Coming Soon</h2>
            <p className="text-muted">
              Check back later for our curated collections.
            </p>
          </Container>
        </div>
      </>
    );
  }

  // ============================================
  // HANDLERS
  // ============================================

  const handleAddToCart = (product) => {
    const defaultSize = product.sizes?.[0]?.size || "50ml";
    dispatch(
      addToCart({
        productId: product._id,
        size: defaultSize,
        quantity: 1,
      }),
    );
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const handleBuyNow = (product) => {
    const defaultSize = product.sizes?.[0]?.size || "50ml";
    dispatch(
      addToCart({
        productId: product._id,
        size: defaultSize,
        quantity: 1,
      }),
    );
    navigate("/checkout");
  };

  const handleWishlistToggle = (productId) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist ❤️");
      navigate("/login");
      return;
    }

    dispatch(toggleWishlist(productId));
    const inWishlist = wishlistItems.some(
      (item) => item.product?._id === productId || item.product === productId,
    );
    toast.success(
      inWishlist ? "Removed from wishlist 💔" : "Added to wishlist ❤️",
    );
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(
      (item) => item.product?._id === productId || item.product === productId,
    );
  };

  // ============================================
  // UI HELPERS
  // ============================================

  const getGridClasses = () => {
    if (isMobile) {
      switch (viewMode) {
        case "grid-1":
          return { xs: 12, sm: 12, md: 12, lg: 12 };
        case "grid-2":
          return { xs: 6, sm: 6, md: 6, lg: 6 };
        case "grid-3":
          return { xs: 6, sm: 6, md: 4, lg: 4 };
        case "grid-4":
          return { xs: 6, sm: 6, md: 4, lg: 3 };
        default:
          return { xs: 6, sm: 6, md: 4, lg: 4 };
      }
    }

    switch (viewMode) {
      case "grid-1":
        return { xs: 12, sm: 12, md: 12, lg: 12 };
      case "grid-2":
        return { xs: 6, sm: 6, md: 6, lg: 6 };
      case "grid-3":
        return { xs: 6, sm: 6, md: 4, lg: 4 };
      case "grid-4":
        return { xs: 6, sm: 6, md: 4, lg: 3 };
      default:
        return { xs: 6, sm: 6, md: 4, lg: 4 };
    }
  };

  const viewOptions = [
    { id: "grid-1", icon: <LayoutList size={18} />, label: "List" },
    { id: "grid-2", icon: <Grid size={18} />, label: "2 Col" },
    { id: "grid-3", icon: <LayoutGrid size={18} />, label: "3 Col" },
    { id: "grid-4", icon: <Grid size={18} />, label: "4 Col" },
  ];

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={isMobile ? 12 : 14}
          fill={i < fullStars ? "#D4AF37" : "none"}
          color={i < fullStars ? "#D4AF37" : "#4A4A4A"}
          className="star-icon"
        />,
      );
    }
    return stars;
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
    const url =
      category === "all" ? "/collections" : `/collections?category=${category}`;
    window.history.pushState({}, "", url);
  };

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split("-");
    setSortBy(sortBy);
    setSortOrder(sortOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageTitle = () => {
    if (activeCategory === "all") {
      return {
        title: collectionTitle,
        subtitle: collectionSubtitle,
      };
    }
    return {
      title: `${activeCategory.toUpperCase()} Collection`,
      subtitle: `Explore our exclusive ${activeCategory} collection`,
    };
  };

  const pageInfo = getPageTitle();

  const collectionName =
    activeCategory === "all"
      ? "All Collections"
      : `${activeCategory} Collection`;
  const collectionDescription = `Explore ${collectionName} at HAMAMA Perfumes. Discover luxury fragrances for ${activeCategory === "all" ? "everyone" : activeCategory}. Authentic scents.`;

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <>
        <SEO
          title={collectionName}
          description={collectionDescription}
          keywords={`${collectionName}, perfumes, luxury fragrances, ${activeCategory} perfume`}
          url={`/collections${activeCategory !== "all" ? `?category=${activeCategory}` : ""}`}
        />
        <Navbar />
        <div className="collections-page">
          <div
            className="collections-header"
            style={{
              backgroundImage: `url(${collectionHeroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            <div className="collections-header-overlay" />
            <Container className="collections-header-content">
              <h1>
                {pageInfo.title} <span className="highlight">Fragrances</span>
              </h1>
              <p>{pageInfo.subtitle}</p>
            </Container>
          </div>
          <Container>
            <div className="product-grid">
              <div className="grid-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="product-card-skeleton">
                    <div className="skeleton-image" />
                    <div className="skeleton-body">
                      <div className="skeleton-line" />
                      <div className="skeleton-line short" />
                      <div className="skeleton-line medium" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </div>
      </>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <>
      <Navbar />
      <div className="collections-page">
        {/* Header with Background Image - Using Settings */}
        <div
          className="collections-header"
          style={{
            backgroundImage: `url(${collectionHeroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          <div className="collections-header-overlay" />

          <Container className="collections-header-content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1>
                {pageInfo.title} <span className="highlight">Fragrances</span>
              </h1>
              <p>{pageInfo.subtitle}</p>
            </motion.div>
          </Container>
        </div>

        <Container>
          {/* Category Filters */}
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-filter-btn ${activeCategory === category ? "active" : ""}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category === "all" ? "All" : category}
              </button>
            ))}
          </div>

          {/* View Controls - MATCH SHOP PAGE */}
          <div className="view-controls">
            <div className="view-controls-left">
              <span className="results-count-mobile">
                {pagination?.total || 0} Products
              </span>
            </div>

            <div className="view-controls-right">
              <div className="sort-wrapper">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                  className="sort-select"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="ratings.average-desc">Highest Rated</option>
                  <option value="purchasedCount-desc">Most Popular</option>
                </select>
                <ChevronDown size={16} className="sort-icon" />
              </div>

              <div className="view-options">
                {viewOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`view-btn ${viewMode === option.id ? "active" : ""}`}
                    onClick={() => setViewMode(option.id)}
                    title={option.label}
                  >
                    {option.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid - USING SHOP PAGE CARD STYLES */}
          <div className="product-grid">
            <div className={viewMode}>
              <AnimatePresence>
                {products?.length > 0 ? (
                  products.map((product) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="product-card-shop"
                    >
                      {/* Product Link */}
                      <Link
                        to={`/product/${product._id}`}
                        className="product-card-link"
                      >
                        <div className="image-wrapper">
                          <img
                            src={
                              product.images?.[0]?.url ||
                              "https://via.placeholder.com/300x300"
                            }
                            alt={product.name}
                          />
                          {product.isNew && (
                            <span className="badge new">New</span>
                          )}
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
                              <span className="discount">
                                -{product.discount}%
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Action Buttons - MATCH SHOP PAGE */}
                      <div className="product-actions-shop">
                        <button
                          className={`action-btn wishlist-btn ${isInWishlist(product._id) ? "active" : ""}`}
                          onClick={() => handleWishlistToggle(product._id)}
                          title={
                            isInWishlist(product._id)
                              ? "Remove from Wishlist"
                              : "Add to Wishlist"
                          }
                        >
                          <Heart
                            size={16}
                            fill={
                              isInWishlist(product._id) ? "#8B0000" : "none"
                            }
                            color={
                              isInWishlist(product._id) ? "#8B0000" : "#FFFFFF"
                            }
                          />
                        </button>

                        <button
                          className="action-btn add-to-cart-btn"
                          onClick={() => handleAddToCart(product)}
                          title="Add to Cart"
                        >
                          <ShoppingBag size={16} />
                        </button>

                        <button
                          className="action-btn buy-now-btn"
                          onClick={() => handleBuyNow(product)}
                          title="Buy Now"
                        >
                          <Zap size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="no-products">
                    <div className="no-products-icon">🛍️</div>
                    <h3>No Products Found</h3>
                    <p>Try adjusting your filters or search terms</p>
                    <button
                      className="btn-reset-filters"
                      onClick={() => handleCategoryClick("all")}
                    >
                      View All Products
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Pagination */}
          {pagination?.pages > 1 && (
            <div className="pagination-wrapper">
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from(
                  { length: Math.min(pagination.pages, 7) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.pages - 3) {
                      pageNum = pagination.pages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="page-btn"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
};

export default CollectionsPage;

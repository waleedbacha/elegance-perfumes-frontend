import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Row, Col, Form, InputGroup } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid,
  LayoutGrid,
  LayoutList,
  Heart,
  ShoppingBag,
  Zap,
  Filter,
  X,
  ChevronDown,
  Star,
  TrendingUp,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getProducts } from "../redux/slices/productSlice";
import { addToCart } from "../redux/slices/cartSlice";
import { toggleWishlist, getWishlist } from "../redux/slices/wishlistSlice";
import { getPublicSettings } from "../redux/slices/settingSlice";
import Navbar from "../components/common/Navbar";
import toast from "react-hot-toast";
import "../styles/pages/ShopPage.css";
import BannerCarousel from "../components/common/BannerCarousel";

// Import background image
import shopBg from "../assets/images/hero-bg.jpg";
import SEO from "../components/common/SEO";
import { BreadcrumbStructuredData } from "../components/common/StructuredData";

// ============================================
// SAMPLE PRODUCT DATA FOR DEMONSTRATION
// ============================================
const SAMPLE_PRODUCTS = [
  {
    _id: "1",
    name: "Chanel No. 5",
    brand: "Chanel",
    category: "women",
    price: 15000,
    comparePrice: 18000,
    discount: 20,
    rating: 4.8,
    reviews: 234,
    image:
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop&q=80",
    isNew: true,
    inStock: true,
  },
  {
    _id: "2",
    name: "Dior Sauvage",
    brand: "Dior",
    category: "men",
    price: 12000,
    comparePrice: 15000,
    discount: 25,
    rating: 4.7,
    reviews: 189,
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop&q=80",
    isNew: false,
    inStock: true,
  },
  {
    _id: "3",
    name: "YSL Black Opium",
    brand: "YSL",
    category: "women",
    price: 10000,
    comparePrice: 12000,
    discount: 15,
    rating: 4.6,
    reviews: 156,
    image:
      "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=400&h=400&fit=crop&q=80",
    isNew: true,
    inStock: true,
  },
  {
    _id: "4",
    name: "Versace Eros",
    brand: "Versace",
    category: "men",
    price: 8000,
    comparePrice: 10000,
    discount: 20,
    rating: 4.5,
    reviews: 123,
    image:
      "https://images.unsplash.com/photo-1591337295751-2a8494fa8574?w=400&h=400&fit=crop&q=80",
    isNew: false,
    inStock: true,
  },
  {
    _id: "5",
    name: "Tom Ford Oud Wood",
    brand: "Tom Ford",
    category: "unisex",
    price: 45000,
    comparePrice: 50000,
    discount: 10,
    rating: 4.9,
    reviews: 312,
    image:
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop&q=80",
    isNew: true,
    inStock: true,
  },
  {
    _id: "6",
    name: "Gucci Flora",
    brand: "Gucci",
    category: "women",
    price: 11000,
    comparePrice: 13000,
    discount: 15,
    rating: 4.4,
    reviews: 98,
    image:
      "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=400&h=400&fit=crop&q=80",
    isNew: false,
    inStock: true,
  },
  {
    _id: "7",
    name: "Armani Acqua Di Gio",
    brand: "Armani",
    category: "men",
    price: 9500,
    comparePrice: 11000,
    discount: 12,
    rating: 4.3,
    reviews: 87,
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop&q=80",
    isNew: false,
    inStock: false,
  },
  {
    _id: "8",
    name: "Lattafa Asad",
    brand: "Lattafa",
    category: "unisex",
    price: 4500,
    comparePrice: 6000,
    discount: 25,
    rating: 4.2,
    reviews: 67,
    image:
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop&q=80",
    isNew: true,
    inStock: true,
  },
];

const ShopPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    products: apiProducts,
    isLoading,
    pagination,
  } = useSelector((state) => state.products);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.settings);

  // Get search query from URL
  const searchQuery = searchParams.get("search") || "";

  // State
  const [viewMode, setViewMode] = useState("grid-3");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
    inStock: false,
  });
  const [selectedFilters, setSelectedFilters] = useState([]);
  const hasFetched = useRef(false);

  // Categories and Brands (for filters)
  const categories = ["men", "women", "unisex", "niche"];
  const brands = [
    "Chanel",
    "Dior",
    "Gucci",
    "Versace",
    "Tom Ford",
    "YSL",
    "Armani",
    "Lattafa",
  ];

  // ============================================
  // GET SETTINGS WITH DEFAULTS
  // ============================================

  const shopTitle = settings?.shop_page_title || "Shop Fragrances";
  const shopSubtitle =
    settings?.shop_page_subtitle || "Discover your perfect scent";
  const shopSearchPlaceholder =
    settings?.shop_search_placeholder || "Search for perfumes...";
  const shopHeroImage =
    settings?.shop_hero_image?.url || settings?.shop_hero_image || shopBg;
  const shopEnabled =
    settings?.shop_page_enabled !== undefined
      ? settings.shop_page_enabled
      : true;

  // ============================================
  // ALL HOOKS MUST BE CALLED BEFORE CONDITIONAL RETURN
  // ============================================

  const breadcrumbItems = [
    { name: "Home", url: "https://eleganceperfumes.com/" },
    { name: "Shop", url: "https://eleganceperfumes.com/shop" },
  ];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch shop settings
  useEffect(() => {
    dispatch(getPublicSettings("shop"));
  }, [dispatch, refreshKey]);

  // Listen for localStorage changes to refresh settings
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "shopSettingsUpdated") {
        console.log("🔄 Shop settings updated, refreshing...");
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Fetch wishlist on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Fetch products
  const fetchProducts = useCallback(() => {
    const params = {
      page: currentPage,
      limit: 12,
      sortBy,
      sortOrder,
      ...(filters.category && { category: filters.category }),
      ...(filters.brand && { brand: filters.brand }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.rating && { rating: filters.rating }),
      ...(filters.inStock && { inStock: "true" }),
      ...(searchTerm && { search: searchTerm }),
    };
    dispatch(getProducts(params));
  }, [dispatch, currentPage, sortBy, sortOrder, filters, searchTerm]);

  // Initial fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchProducts();
    }
  }, [fetchProducts]);

  // Fetch when filters/sort/page changes
  useEffect(() => {
    if (hasFetched.current) {
      fetchProducts();
    }
  }, [fetchProducts]);

  // Update search term from URL
  useEffect(() => {
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  // ============================================
  // IF SHOP IS DISABLED - RETURN AFTER HOOKS
  // ============================================

  if (!shopEnabled) {
    return (
      <>
        <Navbar />
        <div className="shop-page">
          <Container className="text-center py-5">
            <h2 className="text-light">Shop Coming Soon</h2>
            <p className="text-muted">Check back later for our collection.</p>
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setCurrentPage(1);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    if (value) {
      setSelectedFilters((prev) => {
        const existing = prev.find((f) => f.key === key);
        if (existing) {
          return prev.map((f) => (f.key === key ? { ...f, value } : f));
        }
        return [...prev, { key, value, label: getFilterLabel(key, value) }];
      });
    } else {
      setSelectedFilters((prev) => prev.filter((f) => f.key !== key));
    }
  };

  const getFilterLabel = (key, value) => {
    const labels = {
      category: `Category: ${value}`,
      brand: `Brand: ${value}`,
      minPrice: `Min: PKR ${value}`,
      maxPrice: `Max: PKR ${value}`,
      rating: `${value}★ & above`,
      inStock: "In Stock",
    };
    return labels[key] || value;
  };

  const clearFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
    setSelectedFilters((prev) => prev.filter((f) => f.key !== key));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      rating: "",
      inStock: false,
    });
    setSelectedFilters([]);
    setCurrentPage(1);
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

  const gridCols = getGridClasses();

  // Get products - use API products if available, otherwise sample data
  const products = apiProducts?.length > 0 ? apiProducts : SAMPLE_PRODUCTS;

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading && !apiProducts?.length) {
    return (
      <>
        <SEO
          title="Shop"
          description="Shop luxury fragrances at Elegance Perfumes. Browse our collection of premium perfumes for men and women. Authentic scents with fast delivery."
          keywords="shop perfumes, luxury fragrances, buy perfume online, perfume store Pakistan, authentic perfumes"
          url="/shop"
        />
        <BreadcrumbStructuredData items={breadcrumbItems} />
        <Navbar />
        <div className="shop-page">
          <div
            className="shop-header"
            style={{
              backgroundImage: `url(${shopHeroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            <div className="shop-header-overlay" />
            <Container className="shop-header-content">
              <h1>
                {(() => {
                  const title = shopTitle || "Shop Fragrances";
                  const words = title.split(" ");
                  if (words.length <= 1) {
                    return title;
                  }
                  const lastWord = words.pop();
                  return (
                    <>
                      {words.join(" ")}{" "}
                      <span className="highlight">{lastWord}</span>
                    </>
                  );
                })()}
              </h1>
              <p>{shopSubtitle}</p>
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
      <div className="shop-page">
        {/* Header with Hero Image from Settings */}
        <div
          className="shop-header"
          style={{
            backgroundImage: `url(${shopHeroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          <div className="shop-header-overlay" />
          <BannerCarousel position="hero" section="shop" limit={5} />

          <Container className="shop-header-content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* ✅ FIX: Only render the title once with proper highlighting */}
              <h1>
                {(() => {
                  const title = shopTitle || "Shop Fragrances";
                  const words = title.split(" ");
                  if (words.length <= 1) {
                    return title;
                  }
                  const lastWord = words.pop();
                  return (
                    <>
                      {words.join(" ")}{" "}
                      <span className="highlight">{lastWord}</span>
                    </>
                  );
                })()}
              </h1>
              <p>{shopSubtitle}</p>

              {/* Search Bar */}
              <Form onSubmit={handleSearch} className="shop-search-form">
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder={shopSearchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="shop-search-input"
                  />
                  <button type="submit" className="shop-search-btn">
                    <Search size={20} />
                  </button>
                </InputGroup>
              </Form>
            </motion.div>
          </Container>
        </div>

        <Container>
          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="filter-bar-left">
              <button
                className="filter-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={18} />
                Filters
                {selectedFilters.length > 0 && (
                  <span className="filter-count">{selectedFilters.length}</span>
                )}
              </button>

              {selectedFilters.length > 0 && (
                <div className="active-filters">
                  {selectedFilters.map((filter) => (
                    <span key={filter.key} className="active-filter">
                      {filter.label}
                      <button onClick={() => clearFilter(filter.key)}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  <button
                    className="clear-all-filters"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            <div className="filter-bar-right">
              <span className="results-count">
                <TrendingUp size={16} />
                {products?.length || 0} Products
              </span>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="filters-panel"
              >
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        handleFilterChange("category", e.target.value)
                      }
                      className="filter-select"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Brand</label>
                    <select
                      value={filters.brand}
                      onChange={(e) =>
                        handleFilterChange("brand", e.target.value)
                      }
                      className="filter-select"
                    >
                      <option value="">All Brands</option>
                      {brands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Price Range</label>
                    <div className="price-range-inputs">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) =>
                          handleFilterChange("minPrice", e.target.value)
                        }
                        className="price-input"
                      />
                      <span className="price-separator">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          handleFilterChange("maxPrice", e.target.value)
                        }
                        className="price-input"
                      />
                    </div>
                  </div>

                  <div className="filter-group">
                    <label>Rating</label>
                    <select
                      value={filters.rating}
                      onChange={(e) =>
                        handleFilterChange("rating", e.target.value)
                      }
                      className="filter-select"
                    >
                      <option value="">All Ratings</option>
                      <option value="4">4★ & above</option>
                      <option value="3">3★ & above</option>
                      <option value="2">2★ & above</option>
                      <option value="1">1★ & above</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Availability</label>
                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) =>
                          handleFilterChange("inStock", e.target.checked)
                        }
                      />
                      <span>In Stock Only</span>
                    </label>
                  </div>

                  <div className="filter-actions">
                    <button
                      className="btn-apply-filters"
                      onClick={() => setShowFilters(false)}
                    >
                      Apply Filters
                    </button>
                    <button
                      className="btn-clear-filters"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View Controls */}
          <div className="view-controls">
            <div className="view-controls-left">
              <span className="results-count-mobile">
                {products?.length || 0} Products
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

          {/* Product Grid */}
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
                      {/* Product Link - Entire Card Clickable */}
                      <Link
                        to={`/product/${product._id}`}
                        className="product-card-link"
                      >
                        <div className="image-wrapper">
                          <img
                            src={
                              product.images?.[0]?.url ||
                              product.image ||
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

                      {/* Action Buttons */}
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
                      onClick={clearAllFilters}
                    >
                      Reset Filters
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

export default ShopPage;

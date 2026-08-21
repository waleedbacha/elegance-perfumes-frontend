import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart,
  ShoppingBag,
  Zap,
  Minus,
  Plus,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { getProductById } from "../redux/slices/productSlice";
import { addToCart } from "../redux/slices/cartSlice";
import { toggleWishlist } from "../redux/slices/wishlistSlice";
import reviewService from "../services/reviewService";
import Navbar from "../components/common/Navbar";
import ProductReviews from "../components/products/ProductReviews";
import RelatedProducts from "../components/products/RelatedProducts";
import toast from "react-hot-toast";
import "../styles/pages/ProductPage.css";
import SEO from "../components/common/SEO";
import {
  BreadcrumbStructuredData,
  ProductStructuredData,
} from "../components/common/StructuredData";

const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProduct: product, isLoading } = useSelector(
    (state) => state.products,
  );
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Get the price for the selected size
  const getSelectedPrice = () => {
    if (!selectedSize || !product?.sizes) return product?.price || 0;
    const sizeItem = product.sizes.find((s) => s.size === selectedSize);
    return sizeItem?.price || product?.price || 0;
  };

  const getSelectedDiscount = () => {
    if (!selectedSize || !product?.sizes) return product?.discount || 0;
    const sizeItem = product.sizes.find((s) => s.size === selectedSize);
    return sizeItem?.discount !== undefined
      ? sizeItem.discount
      : product?.discount || 0;
  };

  const getSelectedComparePrice = () => {
    if (!selectedSize || !product?.sizes) return product?.comparePrice || null;
    const sizeItem = product.sizes.find((s) => s.size === selectedSize);
    return sizeItem?.comparePrice || product?.comparePrice || null;
  };

  const currentPrice = getSelectedPrice();
  const currentDiscount = getSelectedDiscount();
  const currentComparePrice = getSelectedComparePrice();

  // Fetch product
  useEffect(() => {
    if (id) {
      dispatch(getProductById(id));
    }
  }, [dispatch, id]);

  // Reset current image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) {
        setReviews([]);
        setReviewsLoading(false);
        return;
      }
      try {
        setReviewsLoading(true);
        const response = await reviewService.getProductReviews(id);
        let reviewsData = [];
        if (response?.data?.reviews) {
          reviewsData = response.data.reviews;
        } else if (response?.reviews) {
          reviewsData = response.reviews;
        }
        setReviews(reviewsData || []);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  // Set default size when product loads
  useEffect(() => {
    if (product?.sizes?.length > 0) {
      const availableSize = product.sizes.find((s) => s.stock > 0);
      setSelectedSize(availableSize?.size || product.sizes[0]?.size || "");
    }
  }, [product]);

  // ============================================
  // GALLERY HANDLERS
  // ============================================

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleNextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length,
      );
    }
  };

  const toggleLightbox = () => {
    setShowLightbox(!showLightbox);
  };

  // ============================================
  // CART HANDLERS
  // ============================================

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    const sizeItem = product.sizes.find((s) => s.size === selectedSize);
    if (sizeItem && sizeItem.stock < quantity) {
      toast.error("Not enough stock available");
      return;
    }
    setIsAddingToCart(true);
    dispatch(
      addToCart({
        productId: product._id,
        size: selectedSize,
        quantity,
      }),
    );
    toast.success(`${product.name} added to cart! 🛒`);
    setIsAddingToCart(false);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    const sizeItem = product.sizes.find((s) => s.size === selectedSize);
    if (sizeItem && sizeItem.stock < quantity) {
      toast.error("Not enough stock available");
      return;
    }
    dispatch(
      addToCart({
        productId: product._id,
        size: selectedSize,
        quantity,
      }),
    );
    navigate("/checkout");
  };

  const handleWishlistToggle = () => {
    dispatch(toggleWishlist(product._id));
  };

  const isInWishlist = () => {
    return wishlistItems.some(
      (item) =>
        item.product?._id === product._id || item.product === product._id,
    );
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i < fullStars ? "#D4AF37" : "none"}
          color={i < fullStars ? "#D4AF37" : "#2A2A2A"}
        />,
      );
    }
    return stars;
  };

  // ============================================
  // IMAGES
  // ============================================

  const images =
    product?.images?.length > 0
      ? product.images
      : [{ url: "https://via.placeholder.com/600x600" }];

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="product-page">
          <Container className="py-5">
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ color: "#6B7280" }}>Loading product...</p>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid #2A2A2A",
                  borderTop: "3px solid #8B0000",
                  borderRadius: "50%",
                  margin: "20px auto",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          </Container>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="product-page">
          <Container className="py-5">
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ color: "#6B7280" }}>Product not found</p>
              <Link
                to="/collections"
                className="btn btn-outline-blood-red mt-3"
              >
                ← Back to Collections
              </Link>
            </div>
          </Container>
        </div>
      </>
    );
  }

  // ============================================
  // SEO DATA - Only defined AFTER product is confirmed
  // ============================================

  const productDescription = product.description?.substring(0, 160) || "";
  const productKeywords = [
    product.name,
    product.brand,
    "perfume",
    product.category,
    "luxury fragrance",
    "premium perfume",
  ].join(", ");

  const breadcrumbItems = [
    { name: "Home", url: "https://eleganceperfumes.com/" },
    { name: "Shop", url: "https://eleganceperfumes.com/shop" },
    {
      name: product.name,
      url: `https://eleganceperfumes.com/product/${product._id}`,
    },
  ];

  // ============================================
  // RENDER PRODUCT
  // ============================================

  const selectedSizeItem = product.sizes?.find((s) => s.size === selectedSize);
  const stock = selectedSizeItem?.stock || 0;

  const currentImageUrl = images[currentImageIndex]?.url || images[0]?.url;

  return (
    <>
      {/* ✅ SEO Tags - Only rendered when product exists */}
      <SEO
        title={product.name}
        description={productDescription}
        keywords={productKeywords}
        image={product.images?.[0]?.url}
        url={`/product/${product._id}`}
        type="product"
        publishedTime={product.createdAt}
        modifiedTime={product.updatedAt}
      />
      <ProductStructuredData product={product} />
      <BreadcrumbStructuredData items={breadcrumbItems} />

      <Navbar />
      <div className="product-page">
        <Container>
          {/* Breadcrumb */}
          <div
            className="py-3"
            style={{ color: "#6B7280", fontSize: "0.85rem" }}
          >
            <Link to="/" style={{ color: "#6B7280", textDecoration: "none" }}>
              Home
            </Link>
            <span style={{ margin: "0 8px" }}>›</span>
            <Link
              to="/collections"
              style={{ color: "#6B7280", textDecoration: "none" }}
            >
              Collections
            </Link>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#8B0000" }}>{product.name}</span>
          </div>

          <Row className="g-5 py-4">
            {/* Images Gallery */}
            <Col lg={6}>
              <div className="product-gallery">
                <div className="main-image" onClick={toggleLightbox}>
                  <img src={currentImageUrl} alt={product.name} />

                  {images.length > 1 && (
                    <>
                      <button
                        className="gallery-nav prev"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevImage();
                        }}
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        className="gallery-nav next"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage();
                        }}
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="image-counter">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                  <div className="zoom-hint">🔍 Click to zoom</div>
                </div>

                {images.length > 1 && (
                  <div className="thumbnail-list">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={`thumbnail ${currentImageIndex === index ? "active" : ""}`}
                        onClick={() => handleThumbnailClick(index)}
                      >
                        <img
                          src={img.url}
                          alt={`${product.name} ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>

            {/* Info */}
            <Col lg={6}>
              <div className="product-info">
                <div className="product-brand">{product.brand}</div>
                <h1 className="product-name">{product.name}</h1>

                <div className="product-rating">
                  <span className="stars">
                    {renderStars(product.ratings?.average || 0)}
                  </span>
                  <span className="count">
                    ({product.ratings?.count || 0} reviews)
                  </span>
                </div>

                <div className="product-price">
                  <span className="current">
                    PKR {currentPrice?.toLocaleString() || 0}
                  </span>
                  {currentComparePrice &&
                    currentComparePrice > currentPrice && (
                      <span className="original">
                        PKR {currentComparePrice.toLocaleString()}
                      </span>
                    )}
                  {currentDiscount > 0 && (
                    <span className="discount">-{currentDiscount}%</span>
                  )}
                </div>

                <div
                  className={`stock-status ${stock > 0 ? "in-stock" : "out-of-stock"}`}
                >
                  <span>●</span>
                  <span>
                    {stock === 0
                      ? "Out of Stock"
                      : stock <= 5
                        ? `Only ${stock} left!`
                        : "In Stock"}
                  </span>
                </div>

                <p className="product-description">{product.description}</p>

                {/* Notes */}
                {product.notes && (
                  <div className="product-notes">
                    <div className="note-group">
                      <div className="note-label">Top Notes</div>
                      <div className="note-value">
                        {product.notes.top?.join(", ") || "—"}
                      </div>
                    </div>
                    <div className="note-group">
                      <div className="note-label">Middle Notes</div>
                      <div className="note-value">
                        {product.notes.middle?.join(", ") || "—"}
                      </div>
                    </div>
                    <div className="note-group">
                      <div className="note-label">Base Notes</div>
                      <div className="note-value">
                        {product.notes.base?.join(", ") || "—"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Attributes */}
                <div className="product-attributes">
                  {product.longevity && (
                    <div className="attribute">
                      <span className="label">Longevity</span>
                      <span className="value">{product.longevity} hours</span>
                    </div>
                  )}
                  {product.intensity && (
                    <div className="attribute">
                      <span className="label">Intensity</span>
                      <span className="value">{product.intensity}</span>
                    </div>
                  )}
                  {product.sillage && (
                    <div className="attribute">
                      <span className="label">Sillage</span>
                      <span className="value">{product.sillage}</span>
                    </div>
                  )}
                  {product.season?.length > 0 && (
                    <div className="attribute">
                      <span className="label">Season</span>
                      <span className="value">{product.season.join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Size Selector */}
                {product.sizes?.length > 0 && (
                  <div className="size-selector">
                    <span className="size-label">Select Size</span>
                    <div className="size-options">
                      {product.sizes.map((size) => {
                        const isSelected = selectedSize === size.size;
                        const isOutOfStock = size.stock === 0;

                        return (
                          <button
                            key={size.size}
                            className={`size-btn ${isSelected ? "active" : ""} ${isOutOfStock ? "out-of-stock" : ""}`}
                            onClick={() =>
                              !isOutOfStock && setSelectedSize(size.size)
                            }
                            disabled={isOutOfStock}
                          >
                            <span className="size-name">{size.size}</span>
                            {isOutOfStock && (
                              <span className="size-out-of-stock">
                                Out of Stock
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="quantity-selector">
                  <span className="qty-label">Quantity</span>
                  <div className="qty-control">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="qty-value">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="product-actions">
                  <button
                    className="btn-add-to-cart"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || stock === 0}
                  >
                    <ShoppingBag size={20} />
                    {isAddingToCart ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    className="btn-buy-now"
                    onClick={handleBuyNow}
                    disabled={stock === 0}
                  >
                    <Zap size={20} /> Buy Now
                  </button>
                  <button
                    className={`btn-wishlist ${isInWishlist() ? "active" : ""}`}
                    onClick={handleWishlistToggle}
                  >
                    <Heart size={22} />
                  </button>
                </div>

                {/* Features */}
                <div className="product-features">
                  <div className="feature">
                    <div className="icon">🚚</div>
                    <div className="label">Free Shipping</div>
                  </div>
                  <div className="feature">
                    <div className="icon">🛡️</div>
                    <div className="label">100% Authentic</div>
                  </div>
                  <div className="feature">
                    <div className="icon">🔄</div>
                    <div className="label">Easy Returns</div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Reviews */}
          <ProductReviews
            productId={product._id}
            reviews={reviews}
            loading={reviewsLoading}
          />

          {/* Related Products */}
          <RelatedProducts productId={product._id} />
        </Container>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div className="lightbox" onClick={toggleLightbox}>
          <button className="lightbox-close" onClick={toggleLightbox}>
            <X size={32} />
          </button>
          <img src={currentImageUrl} alt={product.name} />
          {images.length > 1 && (
            <>
              <button
                className="lightbox-nav prev"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
              >
                <ChevronLeft size={40} />
              </button>
              <button
                className="lightbox-nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
              >
                <ChevronRight size={40} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ProductPage;

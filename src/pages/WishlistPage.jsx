import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Trash2, Zap } from "lucide-react";
import { getWishlist, removeFromWishlist } from "../redux/slices/wishlistSlice";
import { addToCart } from "../redux/slices/cartSlice";
import Navbar from "../components/common/Navbar";
import toast from "react-hot-toast";
import "../styles/pages/WishlistPage.css";

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: wishlistItems, isLoading } = useSelector(
    (state) => state.wishlist,
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
    toast.success("Removed from wishlist 💔");
  };

  const handleAddToCart = (product) => {
    if (!product) return;
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
    if (!product) return;
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

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="wishlist-page">
          <Container className="py-5">
            <div className="text-center" style={{ padding: "80px 0" }}>
              <Heart size={64} color="#6B7280" />
              <h2
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'Cinzel', serif",
                  marginTop: "16px",
                }}
              >
                Login to View Wishlist
              </h2>
              <p style={{ color: "#6B7280" }}>
                Please login to see your saved items.
              </p>
              <Link to="/login" className="btn btn-blood-red mt-3">
                Login Now
              </Link>
            </div>
          </Container>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="wishlist-page">
          <Container className="py-5">
            <div className="text-center" style={{ padding: "80px 0" }}>
              <p style={{ color: "#6B7280" }}>Loading your wishlist...</p>
            </div>
          </Container>
        </div>
      </>
    );
  }

  // ✅ Filter out items with null products
  const validItems = wishlistItems?.filter(item => item && item.product) || [];

  return (
    <>
      <Navbar />
      <div className="wishlist-page">
        <Container>
          {/* Header */}
          <div className="wishlist-header">
            <h1>
              My <span className="highlight">Wishlist</span>
            </h1>
            <p>{validItems.length || 0} items saved</p>
          </div>

          {/* Wishlist Grid */}
          {validItems.length > 0 ? (
            <div className="wishlist-grid">
              <AnimatePresence>
                {validItems.map((item, index) => {
                  const product = item.product;
                  // ✅ Skip if product is null
                  if (!product) return null;
                  
                  return (
                    <motion.div
                      key={product._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="wishlist-item"
                    >
                      {/* Product Image */}
                      <Link
                        to={`/product/${product._id}`}
                        className="wishlist-image"
                      >
                        <img
                          src={
                            product.images?.[0]?.url ||
                            "https://via.placeholder.com/200x200"
                          }
                          alt={product.name || "Product"}
                        />
                        {product.discount > 0 && (
                          <span className="badge-sale">
                            {product.discount}% OFF
                          </span>
                        )}
                      </Link>

                      {/* Product Info */}
                      <div className="wishlist-info">
                        <div className="wishlist-brand">{product.brand || ""}</div>
                        <Link
                          to={`/product/${product._id}`}
                          className="wishlist-name"
                        >
                          {product.name || "Unknown Product"}
                        </Link>
                        <div className="wishlist-rating">
                          <span className="stars">
                            {"★".repeat(
                              Math.round(product.ratings?.average || 0),
                            )}
                            {"☆".repeat(
                              5 - Math.round(product.ratings?.average || 0),
                            )}
                          </span>
                          <span className="count">
                            ({product.ratings?.count || 0})
                          </span>
                        </div>
                        <div className="wishlist-price">
                          <span className="current">
                            PKR {product.price?.toLocaleString() || 0}
                          </span>
                          {product.comparePrice && (
                            <span className="original">
                              PKR {product.comparePrice?.toLocaleString() || 0}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="wishlist-actions">
                        <button
                          className="wishlist-cart-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingBag size={16} /> Add to Cart
                        </button>
                        <button
                          className="wishlist-buy-btn"
                          onClick={() => handleBuyNow(product)}
                        >
                          <Zap size={16} /> Buy Now
                        </button>
                        <button
                          className="wishlist-remove-btn"
                          onClick={() => handleRemoveFromWishlist(product._id)}
                          title="Remove from wishlist"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="empty-wishlist">
              <Heart size={64} />
              <h2>Your Wishlist is Empty</h2>
              <p>Start adding your favorite fragrances to your wishlist.</p>
              <Link to="/collections" className="btn btn-blood-red">
                Explore Collections
              </Link>
            </div>
          )}
        </Container>
      </div>
    </>
  );
};

export default WishlistPage;
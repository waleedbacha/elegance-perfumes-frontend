import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { getProducts } from "../../redux/slices/productSlice";
import { addToCart } from "../../redux/slices/cartSlice";
import { toggleWishlist } from "../../redux/slices/wishlistSlice";
import toast from "react-hot-toast";

const RelatedProducts = ({ productId }) => {
  const dispatch = useDispatch();
  const { products, isLoading } = useSelector((state) => state.products);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  // ✅ Use ref to prevent multiple fetches
  const hasFetched = useRef(false);

  useEffect(() => {
    // ✅ Only fetch once and only if products are empty
    if (
      !hasFetched.current &&
      productId &&
      (!products || products.length === 0)
    ) {
      hasFetched.current = true;
      dispatch(getProducts({ limit: 8 }));
    }
  }, [dispatch, productId, products]);

  // ✅ Use cached products if available
  const relatedProducts =
    products?.filter((p) => p._id !== productId)?.slice(0, 4) || [];

  // ✅ Don't show if no products
  if (relatedProducts.length === 0) {
    return null;
  }

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

  const handleWishlistToggle = (productId) => {
    dispatch(toggleWishlist(productId));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(
      (item) => item.product?._id === productId || item.product === productId,
    );
  };

  return (
    <section
      className="related-products"
      style={{
        padding: "40px 0",
        borderTop: "1px solid #1A1A1A",
        marginTop: "20px",
      }}
    >
      <h3
        style={{
          fontFamily: "'Cinzel', serif",
          color: "#FFFFFF",
          fontSize: "1.5rem",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        You May Also Like
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {relatedProducts.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            style={{
              background: "#1A1A1A",
              border: "1px solid #2A2A2A",
              borderRadius: "12px",
              overflow: "hidden",
              transition: "all 0.3s ease",
            }}
          >
            <Link
              to={`/product/${product._id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  position: "relative",
                  paddingTop: "100%",
                  background: "#0A0A0A",
                  overflow: "hidden",
                }}
              >
                <img
                  src={
                    product.images?.[0]?.url ||
                    "https://via.placeholder.com/300x300"
                  }
                  alt={product.name}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                  }}
                />
                {product.discount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: "#D4AF37",
                      color: "#0A0A0A",
                      padding: "4px 12px",
                      borderRadius: "50px",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {product.discount}% OFF
                  </span>
                )}
              </div>
            </Link>
            <div style={{ padding: "16px" }}>
              <div
                style={{
                  color: "#6B7280",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {product.brand}
              </div>
              <Link
                to={`/product/${product._id}`}
                style={{
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontWeight: 600,
                  display: "block",
                  margin: "4px 0 8px",
                  fontSize: "0.9rem",
                }}
              >
                {product.name}
              </Link>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span style={{ color: "#FFFFFF", fontWeight: 700 }}>
                  PKR {product.price.toLocaleString()}
                </span>
                {product.comparePrice && (
                  <span
                    style={{
                      color: "#6B7280",
                      fontSize: "0.9rem",
                      textDecoration: "line-through",
                    }}
                  >
                    PKR {product.comparePrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button
                  onClick={() => handleAddToCart(product)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: "#8B0000",
                    border: "none",
                    borderRadius: "6px",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    transition: "background 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#CC0000")}
                  onMouseLeave={(e) => (e.target.style.background = "#8B0000")}
                >
                  <ShoppingBag size={14} /> Add
                </button>
                <button
                  onClick={() => handleWishlistToggle(product._id)}
                  style={{
                    padding: "8px 12px",
                    background: "transparent",
                    border: "1px solid #2A2A2A",
                    borderRadius: "6px",
                    color: isInWishlist(product._id) ? "#8B0000" : "#9CA3AF",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Heart
                    size={16}
                    fill={isInWishlist(product._id) ? "#8B0000" : "none"}
                    color={isInWishlist(product._id) ? "#8B0000" : "#9CA3AF"}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;

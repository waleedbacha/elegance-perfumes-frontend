import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  StarHalf,
  User,
  Calendar,
  Send,
  MessageCircle,
  Camera,
  X,
  Image as ImageIcon,
} from "lucide-react";
import reviewService from "../../services/reviewService";
import toast from "react-hot-toast";

const ProductReviews = ({
  productId,
  reviews: propReviews,
  loading: propLoading,
}) => {
  const [reviews, setReviews] = useState(propReviews || []);
  const [loading, setLoading] = useState(
    propLoading !== undefined ? propLoading : true,
  );
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Image upload states
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const { isAuthenticated } = useSelector((state) => state.auth);

  // ============================================
  // UPDATE WHEN PROPS CHANGE
  // ============================================

  useEffect(() => {
    setReviews(propReviews || []);
    setLoading(propLoading !== undefined ? propLoading : false);

    if (propReviews && propReviews.length > 0) {
      const total = propReviews.length;
      const sum = propReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
      const avg = sum / total;
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      propReviews.forEach((r) => {
        if (r.rating)
          distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      });
      setStats({ average: avg, total, distribution });
    } else {
      setStats({
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    }
  }, [propReviews, propLoading]);

  // ============================================
  // HANDLERS
  // ============================================

  // ✅ Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setSelectedImages([...selectedImages, ...files]);

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);

    // Reset input
    e.target.value = "";
  };

  // ✅ Remove image
  const removeImage = (index) => {
    const newSelected = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newSelected);

    // Revoke URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to submit a review");
      return;
    }

    if (!newReview.comment || newReview.comment.length < 10) {
      toast.error("Please write a review of at least 10 characters");
      return;
    }

    setSubmitting(true);
    try {
      // ✅ Create FormData for review with images
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("rating", newReview.rating);
      formData.append("title", newReview.title || "");
      formData.append("comment", newReview.comment);

      // ✅ Append images
      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      // ✅ Use the service with FormData
      const response = await reviewService.createReviewWithImages(formData);

      // Refresh reviews
      const fetchResponse = await reviewService.getProductReviews(productId);
      const reviewsData =
        fetchResponse?.data?.reviews || fetchResponse?.reviews || [];
      setReviews(reviewsData);

      // Update stats
      if (reviewsData.length > 0) {
        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc, r) => acc + (r.rating || 0), 0);
        const avg = sum / total;
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviewsData.forEach((r) => {
          if (r.rating)
            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });
        setStats({ average: avg, total, distribution });
      }

      toast.success("Review submitted successfully!");
      setShowForm(false);
      setNewReview({ rating: 5, title: "", comment: "" });
      setSelectedImages([]);
      setImagePreviews([]);
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message || "Failed to submit review",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} fill="#D4AF37" color="#D4AF37" />);
    }
    if (hasHalf) {
      stars.push(
        <StarHalf key="half" size={16} fill="#D4AF37" color="#D4AF37" />,
      );
    }
    while (stars.length < 5) {
      stars.push(<Star key={stars.length} size={16} color="#2A2A2A" />);
    }
    return stars;
  };

  const renderRatingStars = (rating, setRating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isActive = i <= (hoverRating || rating);
      stars.push(
        <button
          key={i}
          type="button"
          className="rating-star-btn"
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            transition: "transform 0.2s ease",
          }}
        >
          <Star
            size={28}
            fill={isActive ? "#D4AF37" : "none"}
            color={isActive ? "#D4AF37" : "#2A2A2A"}
            style={{
              transform: isActive ? "scale(1.1)" : "scale(1)",
              transition: "all 0.2s ease",
            }}
          />
        </button>,
      );
    }
    return stars;
  };

  // ✅ Render review images
  const renderReviewImages = (images) => {
    if (!images || images.length === 0) return null;

    return (
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "10px",
          flexWrap: "wrap",
        }}
      >
        {images.map((img, index) => (
          <div
            key={index}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #2A2A2A",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => window.open(img.url, "_blank")}
          >
            <img
              src={img.url}
              alt={img.alt || "Review image"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div
      className="reviews-section"
      id="reviews"
      style={{
        padding: "40px 0",
        borderTop: "1px solid #1A1A1A",
        marginTop: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <h3
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#FFFFFF",
              fontSize: "1.5rem",
              margin: 0,
            }}
          >
            Customer Reviews
          </h3>
          {!loading && reviews && reviews.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "#FFFFFF",
                }}
              >
                {stats.average?.toFixed(1) || 0}
              </span>
              <span style={{ display: "flex", gap: "2px" }}>
                {renderStars(stats.average || 0)}
              </span>
              <span style={{ color: "#6B7280", fontSize: "0.9rem" }}>
                ({stats.total || 0} reviews)
              </span>
            </div>
          )}
          {loading && (
            <span style={{ color: "#6B7280" }}>Loading reviews...</span>
          )}
        </div>
        {isAuthenticated && !showForm && !loading && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "10px 24px",
              background: "#8B0000",
              border: "none",
              borderRadius: "8px",
              color: "#FFFFFF",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#CC0000")}
            onMouseLeave={(e) => (e.target.style.background = "#8B0000")}
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #2A2A2A",
              borderTop: "3px solid #8B0000",
              borderRadius: "50%",
              margin: "0 auto",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "#6B7280", marginTop: "12px" }}>
            Loading reviews...
          </p>
        </div>
      )}

      {/* Reviews Content */}
      {!loading && (
        <>
          {/* Write Review Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                  overflow: "hidden",
                }}
              >
                <h4
                  style={{
                    color: "#FFFFFF",
                    fontSize: "1.1rem",
                    marginBottom: "16px",
                  }}
                >
                  Write Your Review
                </h4>
                <form onSubmit={handleSubmitReview}>
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        color: "#D1D5DB",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        marginBottom: "6px",
                      }}
                    >
                      Rating
                    </label>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {renderRatingStars(newReview.rating, (val) =>
                        setNewReview({ ...newReview, rating: val }),
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        color: "#D1D5DB",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        marginBottom: "6px",
                      }}
                    >
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "#0A0A0A",
                        border: "1px solid #2A2A2A",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                        fontSize: "0.95rem",
                        transition: "all 0.3s ease",
                      }}
                      placeholder="Summarize your experience"
                      value={newReview.title}
                      onChange={(e) =>
                        setNewReview({ ...newReview, title: e.target.value })
                      }
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        color: "#D1D5DB",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        marginBottom: "6px",
                      }}
                    >
                      Review <span style={{ color: "#8B0000" }}>*</span>
                    </label>
                    <textarea
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "#0A0A0A",
                        border: "1px solid #2A2A2A",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                        fontSize: "0.95rem",
                        resize: "vertical",
                        minHeight: "100px",
                        transition: "all 0.3s ease",
                      }}
                      rows="4"
                      placeholder="Share your experience with this product..."
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({ ...newReview, comment: e.target.value })
                      }
                      required
                    />
                    <div
                      style={{
                        color: "#6B7280",
                        fontSize: "0.75rem",
                        marginTop: "4px",
                        textAlign: "right",
                      }}
                    >
                      {newReview.comment.length}/1000 characters
                    </div>
                  </div>

                  {/* ✅ IMAGE UPLOAD SECTION */}
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        color: "#D1D5DB",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        marginBottom: "6px",
                      }}
                    >
                      Add Photos (Optional, max 5)
                    </label>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          marginBottom: "10px",
                        }}
                      >
                        {imagePreviews.map((preview, index) => (
                          <div
                            key={index}
                            style={{
                              position: "relative",
                              width: "80px",
                              height: "80px",
                              borderRadius: "8px",
                              overflow: "hidden",
                              border: "1px solid #2A2A2A",
                            }}
                          >
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              style={{
                                position: "absolute",
                                top: "4px",
                                right: "4px",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                background: "rgba(239, 68, 68, 0.9)",
                                border: "none",
                                color: "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={selectedImages.length >= 5}
                      style={{
                        padding: "10px 16px",
                        background: "transparent",
                        border: "1px dashed #2A2A2A",
                        borderRadius: "8px",
                        color: "#9CA3AF",
                        cursor:
                          selectedImages.length >= 5
                            ? "not-allowed"
                            : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.3s ease",
                        opacity: selectedImages.length >= 5 ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (selectedImages.length < 5) {
                          e.target.style.borderColor = "#8B0000";
                          e.target.style.color = "#8B0000";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = "#2A2A2A";
                        e.target.style.color = "#9CA3AF";
                      }}
                    >
                      <Camera size={18} />
                      {selectedImages.length >= 5
                        ? "Max 5 images reached"
                        : "Add Photos"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: "none" }}
                    />
                    <div
                      style={{
                        color: "#6B7280",
                        fontSize: "0.75rem",
                        marginTop: "4px",
                      }}
                    >
                      {selectedImages.length}/5 images selected
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "8px" }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setSelectedImages([]);
                        setImagePreviews([]);
                      }}
                      style={{
                        padding: "10px 24px",
                        background: "transparent",
                        border: "1px solid #2A2A2A",
                        borderRadius: "8px",
                        color: "#9CA3AF",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        padding: "10px 24px",
                        background: "#8B0000",
                        border: "none",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        cursor: submitting ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.3s ease",
                        opacity: submitting ? 0.6 : 1,
                      }}
                    >
                      <Send size={16} />
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews List */}
          {reviews && reviews.length > 0 ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {reviews.map((review, index) => (
                <div
                  key={review._id || review.id || index}
                  style={{
                    padding: "16px 0",
                    borderBottom: "1px solid #2A2A2A",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "#2A2A2A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <User size={16} color="#9CA3AF" />
                      </div>
                      <span style={{ color: "#FFFFFF", fontWeight: 500 }}>
                        {review.user?.name ||
                          review.user?.fullName ||
                          "Anonymous"}
                      </span>
                      {review.verified && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "#10B981",
                            background: "rgba(16, 185, 129, 0.1)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {renderStars(review.rating || 0)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#6B7280",
                        fontSize: "0.75rem",
                        marginLeft: "auto",
                      }}
                    >
                      <Calendar size={14} />
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString()
                        : "Recent"}
                    </div>
                  </div>
                  {review.title && (
                    <div
                      style={{
                        color: "#FFFFFF",
                        fontWeight: 600,
                        fontSize: "1rem",
                        marginBottom: "4px",
                      }}
                    >
                      {review.title}
                    </div>
                  )}
                  <div
                    style={{
                      color: "#9CA3AF",
                      fontSize: "0.95rem",
                      lineHeight: "1.6",
                    }}
                  >
                    {review.comment || ""}
                  </div>

                  {/* ✅ DISPLAY REVIEW IMAGES */}
                  {review.images && review.images.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginTop: "10px",
                      }}
                    >
                      {review.images.map((img, imgIndex) => (
                        <div
                          key={imgIndex}
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "1px solid #2A2A2A",
                            cursor: "pointer",
                            transition: "transform 0.3s ease",
                          }}
                          onClick={() => window.open(img.url, "_blank")}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.borderColor = "#8B0000";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.borderColor = "#2A2A2A";
                          }}
                        >
                          <img
                            src={img.url}
                            alt={img.alt || `Review image ${imgIndex + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Admin Response */}
                  {review.adminResponse && review.adminResponse.text && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "14px 16px",
                        background: "rgba(139, 0, 0, 0.08)",
                        borderLeft: "4px solid #8B0000",
                        borderRadius: "8px",
                        border: "1px solid rgba(139, 0, 0, 0.15)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "6px",
                        }}
                      >
                        <MessageCircle size={16} color="#8B0000" />
                        <span
                          style={{
                            color: "#8B0000",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Admin Response
                        </span>
                      </div>
                      <p
                        style={{
                          color: "#E5E7EB",
                          fontSize: "0.95rem",
                          lineHeight: "1.6",
                          marginBottom: "4px",
                        }}
                      >
                        {review.adminResponse.text}
                      </p>
                      <span
                        style={{
                          color: "#6B7280",
                          fontSize: "0.7rem",
                          display: "block",
                          marginTop: "4px",
                        }}
                      >
                        {review.adminResponse.createdAt
                          ? `📅 Responded on ${new Date(
                              review.adminResponse.createdAt,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ color: "#6B7280" }}>
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductReviews;

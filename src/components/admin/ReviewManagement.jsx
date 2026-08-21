import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MessageCircle,
  Star,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  User,
  Mail,
  Calendar,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllReviews,
  approveReview,
  rejectReview,
  adminRespondToReview,
  deleteReviewAdmin,
  getReviewAnalytics,
  clearSuccess,
  clearError,
} from "../../redux/slices/reviewSlice";
import toast from "react-hot-toast";
import "../../styles/pages/ReviewManagement.css";

const ReviewManagement = () => {
  const dispatch = useDispatch();
  const { reviews, isLoading, pagination, stats } = useSelector(
    (state) => state.reviews,
  );
  const { error, success } = useSelector((state) => state.reviews);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Fetch reviews
  const fetchReviews = (
    page = currentPage,
    status = statusFilter,
    rating = ratingFilter,
    search = searchTerm,
    itemsPerPage = limit,
  ) => {
    const params = {
      page,
      limit: itemsPerPage,
      ...(status && status !== "all" && { status }),
      ...(rating && rating !== "all" && { rating }),
      ...(search && { search }),
    };
    dispatch(getAllReviews(params));
  };

  useEffect(() => {
    fetchReviews(currentPage, statusFilter, ratingFilter, searchTerm, limit);
    dispatch(getReviewAnalytics());
  }, [currentPage, statusFilter, ratingFilter, limit]);

  // ✅ Handle success/error messages
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
      fetchReviews(currentPage, statusFilter, ratingFilter, searchTerm, limit);
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error]);

  // ✅ Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleRatingFilter = (e) => {
    setRatingFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > (pagination?.pages || 1)) return;
    setCurrentPage(page);
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const handleApprove = async (id) => {
    if (window.confirm("Approve this review?")) {
      try {
        await dispatch(approveReview(id)).unwrap();
        toast.success("Review approved!");
      } catch (error) {
        toast.error(error || "Failed to approve review");
      }
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(
        rejectReview({ id: selectedReview._id, reason: rejectReason }),
      ).unwrap();
      toast.success("Review rejected!");
      setShowRejectModal(false);
      setRejectReason("");
    } catch (error) {
      toast.error(error || "Failed to reject review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespond = async () => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(
        adminRespondToReview({
          id: selectedReview._id,
          response: responseText,
        }),
      ).unwrap();
      toast.success("Response added!");
      setShowResponseModal(false);
      setResponseText("");
      setShowDetailModal(false);
    } catch (error) {
      toast.error(error || "Failed to add response");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await dispatch(deleteReviewAdmin(id)).unwrap();
        toast.success("Review deleted!");
      } catch (error) {
        toast.error(error || "Failed to delete review");
      }
    }
  };

  const handleRefresh = () => {
    fetchReviews(currentPage, statusFilter, ratingFilter, searchTerm, limit);
    dispatch(getReviewAnalytics());
    toast.success("Refreshing...");
  };

  // ✅ Render stars
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < rating ? "#D4AF37" : "none"}
        color={i < rating ? "#D4AF37" : "#444"}
      />
    ));
  };

  // ✅ Status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: "warning", label: "Pending" },
      approved: { variant: "success", label: "Approved" },
      rejected: { variant: "danger", label: "Rejected" },
      flagged: { variant: "secondary", label: "Flagged" },
    };
    const info = statusMap[status] || statusMap.pending;
    return <Badge bg={info.variant}>{info.label}</Badge>;
  };

  // ✅ Pagination
  const totalPages = pagination?.pages || 1;
  const totalItems = pagination?.total || 0;

  const getPaginationRange = () => {
    const current = currentPage;
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    return { start, end };
  };

  const { start, end } = getPaginationRange();

  if (isLoading && !reviews?.length) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="review-management">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1>Reviews</h1>
          <p>Manage customer reviews and ratings</p>
          {stats && (
            <div className="review-stats-summary">
              <span>
                <Star size={14} /> Avg: {stats.averageRating?.toFixed(1) || 0}
              </span>
              <span>📝 Total: {stats.totalReviews || 0}</span>
              <span>✅ Verified: {stats.verifiedReviews || 0}</span>
              <span>👍 Helpful: {stats.totalHelpful || 0}</span>
            </div>
          )}
        </div>
        <Button
          variant="outline-secondary"
          onClick={handleRefresh}
          disabled={isLoading}
          className="refresh-btn"
        >
          <RefreshCw size={18} className={isLoading ? "spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="management-controls">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <div className="filter-wrapper">
          <Filter size={18} />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={handleStatusFilter}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>
        <div className="filter-wrapper">
          <select
            className="filter-select"
            value={ratingFilter}
            onChange={handleRatingFilter}
          >
            <option value="all">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
            <option value="4">⭐⭐⭐⭐ (4)</option>
            <option value="3">⭐⭐⭐ (3)</option>
            <option value="2">⭐⭐ (2)</option>
            <option value="1">⭐ (1)</option>
          </select>
        </div>
        <div className="items-per-page">
          <span>Show:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="limit-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <Card className="table-card">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews?.length > 0 ? (
                  reviews.map((review) => (
                    <tr key={review._id}>
                      <td>
                        <div className="product-cell">
                          <span className="product-name">
                            {review.product?.name || "N/A"}
                          </span>
                          <span className="product-brand">
                            {review.product?.brand || ""}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span className="customer-name">
                            {review.user?.name || "Anonymous"}
                          </span>
                          {review.verified && (
                            <Badge bg="success" className="verified-badge">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="rating-cell">
                          {renderStars(review.rating)}
                        </div>
                      </td>
                      <td>
                        <div className="review-cell">
                          <span className="review-title">
                            {review.title || "No title"}
                          </span>
                          <span className="review-comment">
                            {review.comment?.substring(0, 60)}
                            {review.comment?.length > 60 ? "..." : ""}
                          </span>
                        </div>
                      </td>
                      <td>{getStatusBadge(review.status)}</td>
                      <td>
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <button
                            className="action-btn view"
                            onClick={() => handleViewReview(review)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {review.status === "pending" && (
                            <>
                              <button
                                className="action-btn approve"
                                onClick={() => handleApprove(review._id)}
                                title="Approve"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                className="action-btn reject"
                                onClick={() => {
                                  setSelectedReview(review);
                                  setShowRejectModal(true);
                                }}
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(review._id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-secondary">
                      {searchTerm ||
                      statusFilter !== "all" ||
                      ratingFilter !== "all"
                        ? "No reviews match your filters"
                        : "No reviews found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
            <div className="pagination-wrapper">
              <div className="pagination-info">
                Showing {(currentPage - 1) * limit + 1} -{" "}
                {Math.min(currentPage * limit, totalItems)} of {totalItems}{" "}
                reviews
              </div>
              <div className="pagination-controls">
                <button
                  className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="pagination-pages">
                  {start > 1 && (
                    <>
                      <button
                        className="pagination-page-btn"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </button>
                      {start > 2 && (
                        <span className="pagination-ellipsis">…</span>
                      )}
                    </>
                  )}
                  {Array.from(
                    { length: end - start + 1 },
                    (_, i) => start + i,
                  ).map((page) => (
                    <button
                      key={page}
                      className={`pagination-page-btn ${page === currentPage ? "active" : ""}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  {end < totalPages && (
                    <>
                      {end < totalPages - 1 && (
                        <span className="pagination-ellipsis">…</span>
                      )}
                      <button
                        className="pagination-page-btn"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  className={`pagination-btn ${currentPage === totalPages ? "disabled" : ""}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  className={`pagination-btn ${currentPage === totalPages ? "disabled" : ""}`}
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ========================================== */}
      {/* DETAIL MODAL */}
      {/* ========================================== */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        className="admin-modal review-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Review Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReview && (
            <div className="review-detail-content">
              <Row>
                <Col md={6}>
                  <div className="detail-section">
                    <h6>Product</h6>
                    <p className="product-name">
                      {selectedReview.product?.name || "N/A"}
                    </p>
                    <p className="product-brand">
                      {selectedReview.product?.brand || ""}
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-section">
                    <h6>Customer</h6>
                    <p className="customer-name">
                      {selectedReview.user?.name || "Anonymous"}
                    </p>
                    <p className="customer-email">
                      <Mail size={14} />
                      {selectedReview.user?.email || "N/A"}
                    </p>
                    <p className="customer-status">
                      {selectedReview.verified ? (
                        <Badge bg="success">✓ Verified Purchase</Badge>
                      ) : (
                        <Badge bg="secondary">Unverified</Badge>
                      )}
                    </p>
                  </div>
                </Col>
              </Row>

              <div className="detail-section">
                <h6>Rating</h6>
                <div className="rating-display">
                  {renderStars(selectedReview.rating)}
                  <span className="rating-number">
                    {selectedReview.rating}/5
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h6>Review Title</h6>
                <p>{selectedReview.title || "No title"}</p>
              </div>

              <div className="detail-section">
                <h6>Review Comment</h6>
                <p className="review-comment-full">{selectedReview.comment}</p>
              </div>

              {selectedReview.pros?.length > 0 && (
                <div className="detail-section">
                  <h6>✅ Pros</h6>
                  <ul className="pros-list">
                    {selectedReview.pros.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedReview.cons?.length > 0 && (
                <div className="detail-section">
                  <h6>❌ Cons</h6>
                  <ul className="cons-list">
                    {selectedReview.cons.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="detail-section">
                <h6>Status</h6>
                {getStatusBadge(selectedReview.status)}
                <span className="review-date">
                  <Clock size={14} />
                  {new Date(selectedReview.createdAt).toLocaleString()}
                </span>
              </div>

              {selectedReview.adminResponse?.text && (
                <div className="detail-section admin-response">
                  <h6>👤 Admin Response</h6>
                  <p>{selectedReview.adminResponse.text}</p>
                  <span className="response-date">
                    {new Date(
                      selectedReview.adminResponse.createdAt,
                    ).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedReview?.status === "pending" && (
            <>
              <Button
                variant="success"
                onClick={() => {
                  handleApprove(selectedReview._id);
                  setShowDetailModal(false);
                }}
              >
                <CheckCircle size={16} /> Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowDetailModal(false);
                  setShowRejectModal(true);
                }}
              >
                <XCircle size={16} /> Reject
              </Button>
            </>
          )}
          <Button
            variant="primary"
            onClick={() => {
              setShowResponseModal(true);
            }}
          >
            <MessageCircle size={16} /> Respond
          </Button>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ========================================== */}
      {/* RESPONSE MODAL */}
      {/* ========================================== */}
      <Modal
        show={showResponseModal}
        onHide={() => {
          setShowResponseModal(false);
          setResponseText("");
        }}
        centered
        className="admin-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Respond to Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Your Response</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write your response to this review..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowResponseModal(false);
              setResponseText("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRespond}
            disabled={isSubmitting || !responseText.trim()}
          >
            {isSubmitting ? "Sending..." : "Send Response"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ========================================== */}
      {/* REJECT MODAL */}
      {/* ========================================== */}
      <Modal
        show={showRejectModal}
        onHide={() => {
          setShowRejectModal(false);
          setRejectReason("");
          setSelectedReview(null);
        }}
        centered
        className="admin-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Reject Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason for Rejection</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this review..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason("");
              setSelectedReview(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={isSubmitting || !rejectReason.trim()}
          >
            {isSubmitting ? "Rejecting..." : "Reject Review"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReviewManagement;

// frontend/src/components/common/DiscountPopup.jsx

import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { X, Percent, ShoppingBag, Copy, Check, Gift } from "lucide-react";
import { getActiveBanners } from "../../redux/slices/bannerSlice";
import toast from "react-hot-toast";
import "../../styles/components/DiscountPopup.css";

const DiscountPopup = () => {
  const dispatch = useDispatch();
  const { activeBanners } = useSelector((state) => state.banners);
  const [showPopup, setShowPopup] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get popup banners
  const popupBanners =
    activeBanners?.filter(
      (banner) => banner.position === "popup" && banner.status === "active",
    ) || [];

  const popupData = popupBanners[0] || {
    title: "🎉 Welcome!",
    subtitle: "Get 10% OFF on your first order",
    description:
      "Use the coupon code below and enjoy exclusive discounts on luxury fragrances.",
    link: {
      url: "/shop",
      text: "Shop Now",
    },
    // ✅ image is optional - only used if provided in banner
  };

  // ✅ Check if banner has an image
  const hasImage = popupData.image?.url && popupData.image.url.length > 0;

  const generateCouponCode = () => {
    const timestamp = Date.now().toString().slice(-4);
    return `FIRST10${timestamp}`;
  };

  useEffect(() => {
    dispatch(getActiveBanners({ position: "popup" }));

    const timer = setTimeout(() => {
      const hasSeenPopup = sessionStorage.getItem("hasSeenDiscountPopup");
      if (!hasSeenPopup) {
        setShowPopup(true);
        setCouponCode(popupData.couponCode || generateCouponCode());
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  const handleClose = () => {
    setIsClosing(true);
    sessionStorage.setItem("hasSeenDiscountPopup", "true");
    setTimeout(() => {
      setShowPopup(false);
      setIsClosing(false);
    }, 300);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    toast.success("Coupon code copied! 🎉");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleApplyCoupon = () => {
    localStorage.setItem("appliedCoupon", couponCode);
    toast.success(`Coupon ${couponCode} applied! 🎉`);
    handleClose();
    window.location.href = popupData.link?.url || "/shop";
  };

  if (!showPopup) return null;

  return (
    <Modal
      show={showPopup}
      onHide={handleClose}
      centered
      className={`discount-popup-modal ${isClosing ? "closing" : ""}`}
      backdrop="static"
      dialogClassName="popup-dialog"
    >
      <Modal.Body className="p-0">
        <div
          className={`discount-popup-wrapper ${isMobile ? "mobile" : ""} ${hasImage ? "has-image" : "no-image"}`}
        >
          {/* Close Button */}
          <button className="popup-close-btn" onClick={handleClose}>
            <X size={isMobile ? 16 : 20} />
          </button>

          {/* ✅ Image Section - ONLY if image exists */}
          {hasImage && (
            <div className={`popup-image-wrapper ${isMobile ? "mobile" : ""}`}>
              <img
                src={popupData.image.url}
                alt={popupData.title}
                className="popup-image"
                loading="lazy"
              />
              <div className="popup-badge">
                <Gift size={isMobile ? 10 : 14} />
                <span>{isMobile ? "Limited" : "Limited Time"}</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div
            className={`popup-content ${isMobile ? "mobile" : ""} ${!hasImage ? "no-image" : ""}`}
          >
            {/* Icon - Only on desktop or no image */}
            {!hasImage && (
              <div className="popup-icon">
                <Percent size={isMobile ? 20 : 28} />
              </div>
            )}

            {/* Title */}
            <h2 className={`popup-title ${isMobile ? "mobile" : ""}`}>
              {popupData.title}
            </h2>

            {/* Subtitle */}
            <p className={`popup-subtitle ${isMobile ? "mobile" : ""}`}>
              {popupData.subtitle}
            </p>

            {/* Description */}
            <p className={`popup-description ${isMobile ? "mobile" : ""}`}>
              {popupData.description}
            </p>

            {/* Coupon Code */}
            <div className={`coupon-code-wrapper ${isMobile ? "mobile" : ""}`}>
              <div className="coupon-code-container">
                <span className="coupon-code-label">🎫 Use Code:</span>
                <div className="coupon-code-box">
                  <span className="coupon-code">{couponCode}</span>
                  <button
                    className="coupon-copy-btn"
                    onClick={handleCopyCode}
                    title="Copy code"
                  >
                    {copied ? (
                      <Check size={isMobile ? 12 : 14} />
                    ) : (
                      <Copy size={isMobile ? 12 : 14} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={`popup-actions ${isMobile ? "mobile" : ""}`}>
              <Button className="popup-primary-btn" onClick={handleApplyCoupon}>
                <ShoppingBag size={isMobile ? 14 : 16} />
                {isMobile ? "Shop" : "Shop Now & Save"}
              </Button>
              <Button
                variant="outline-secondary"
                className="popup-secondary-btn"
                onClick={handleClose}
              >
                {isMobile ? "×" : "Maybe Later"}
              </Button>
            </div>

            <p className={`popup-terms ${isMobile ? "mobile" : ""}`}>
              * Valid for first-time orders. T&C apply.
            </p>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DiscountPopup;

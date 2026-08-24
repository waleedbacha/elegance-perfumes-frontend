// frontend/src/components/common/PopupDisplay.jsx

import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { X, Percent, ShoppingBag, Copy, Check, Gift } from "lucide-react";
import {
  getActivePopup,
  recordPopupClick,
  recordPopupConversion,
} from "../../redux/slices/popupSlice";
import toast from "react-hot-toast";
import "../../styles/components/PopupDisplay.css";

const PopupDisplay = () => {
  const dispatch = useDispatch();
  const { activePopup, isLoading } = useSelector((state) => state.popups);
  const { user } = useSelector((state) => state.auth);
  const [showPopup, setShowPopup] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);

  // ✅ Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ Fetch active popup
  useEffect(() => {
    const fetchPopup = async () => {
      try {
        await dispatch(getActivePopup()).unwrap();
      } catch (error) {
        console.error("❌ Failed to fetch popup:", error);
      }
    };
    fetchPopup();
  }, [dispatch, user]);

  // ✅ Handle popup display logic
  useEffect(() => {
    if (!activePopup || isLoading) return;

    const popup = activePopup;

    // Check if popup should be shown based on frequency
    const frequencyKey = `popup_${popup._id}_lastShown`;
    const lastShown = localStorage.getItem(frequencyKey);
    const now = new Date();

    let shouldShow = true;

    if (lastShown) {
      const lastDate = new Date(lastShown);
      switch (popup.frequency) {
        case "once":
          shouldShow = false;
          break;
        case "daily":
          const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
          shouldShow = daysDiff >= 1;
          break;
        case "weekly":
          const weeksDiff = Math.floor(
            (now - lastDate) / (1000 * 60 * 60 * 24 * 7),
          );
          shouldShow = weeksDiff >= 1;
          break;
        case "monthly":
          const monthsDiff = Math.floor(
            (now - lastDate) / (1000 * 60 * 60 * 24 * 30),
          );
          shouldShow = monthsDiff >= 1;
          break;
        case "always":
          shouldShow = true;
          break;
        default:
          shouldShow = true;
      }
    }

    // Check if popup is scheduled
    if (popup.scheduleType === "scheduled") {
      const start = new Date(popup.startDate);
      const end = popup.endDate ? new Date(popup.endDate) : null;
      if (now < start || (end && now > end)) {
        shouldShow = false;
      }
    }

    // Check if user is new/returning
    if (popup.targeting?.newUsersOnly && user?.orderCount > 0) {
      shouldShow = false;
    }
    if (popup.targeting?.returningUsers && user?.orderCount === 0) {
      shouldShow = false;
    }

    // Check page targeting
    const currentPath = window.location.pathname;
    const pages = popup.targeting?.pages || ["homepage", "shop", "collections"];
    const pageMatches = pages.some((page) => {
      if (page === "homepage" && currentPath === "/") return true;
      if (currentPath.includes(page)) return true;
      return false;
    });

    if (!pageMatches) {
      shouldShow = false;
    }

    // Show popup after delay
    if (shouldShow) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem(frequencyKey, now.toISOString());
      }, popup.triggerDelay || 5000);

      return () => clearTimeout(timer);
    }
  }, [activePopup, isLoading, user]);

  // ✅ Handle close popup
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsClosing(false);
    }, 300);
  };

  // ✅ Copy coupon code
  const handleCopyCode = () => {
    if (!activePopup?.couponCode) return;
    navigator.clipboard.writeText(activePopup.couponCode);
    setCopied(true);
    toast.success("Coupon code copied! 🎉");
    setTimeout(() => setCopied(false), 3000);
  };

  // ✅ Handle primary button click
  const handlePrimaryClick = async () => {
    if (!activePopup || hasClicked) return;
    setHasClicked(true);

    // Record click
    try {
      await dispatch(recordPopupClick(activePopup._id)).unwrap();
    } catch (error) {
      console.error("❌ Failed to record click:", error);
    }

    // Apply coupon
    if (activePopup.couponCode) {
      localStorage.setItem("appliedCoupon", activePopup.couponCode);
      toast.success(`Coupon ${activePopup.couponCode} applied! 🎉`);
    }

    handleClose();

    // Redirect
    const url = activePopup.primaryButton?.url || "/shop";
    if (activePopup.primaryButton?.openInNewTab) {
      window.open(url, "_blank");
    } else {
      window.location.href = url;
    }
  };

  // ✅ Handle secondary button click
  const handleSecondaryClick = () => {
    handleClose();
  };

  if (!activePopup || !showPopup) return null;

  const popup = activePopup;
  const hasImage = popup.useImage && popup.image?.url;

  return (
    <Modal
      show={showPopup}
      onHide={handleClose}
      centered
      className={`popup-display-modal ${isClosing ? "closing" : ""}`}
      backdrop="static"
      dialogClassName={`popup-dialog ${popup.style?.size || "medium"}`}
    >
      <Modal.Body className="p-0">
        <div
          className={`popup-wrapper ${isMobile ? "mobile" : ""} ${hasImage ? "has-image" : "no-image"}`}
          style={{
            backgroundColor: popup.style?.backgroundColor || "#1a1a1a",
            borderRadius: popup.style?.borderRadius || "16px",
            ...(popup.style?.position === "bottom-right" && {
              marginBottom: "20px",
              marginRight: "20px",
            }),
          }}
        >
          {/* Close Button */}
          {popup.showCloseButton && (
            <button
              className="popup-close-btn"
              onClick={handleClose}
              style={{
                color: popup.style?.textColor || "#ffffff",
                borderColor: `${popup.style?.textColor || "#ffffff"}33`,
              }}
            >
              <X size={isMobile ? 16 : 20} />
            </button>
          )}

          {/* Image Section */}
          {hasImage && (
            <div className={`popup-image-wrapper ${isMobile ? "mobile" : ""}`}>
              <img
                src={popup.image.url}
                alt={popup.title}
                className="popup-image"
                loading="lazy"
              />
              {popup.coupon?.autoGenerate && (
                <div className="popup-badge">
                  <Gift size={isMobile ? 10 : 14} />
                  <span>{isMobile ? "🎁" : "Limited Time"}</span>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div
            className={`popup-content ${isMobile ? "mobile" : ""} ${!hasImage ? "no-image" : ""}`}
            style={{
              color: popup.style?.textColor || "#ffffff",
            }}
          >
            {/* Icon */}
            {!hasImage && (
              <div
                className="popup-icon"
                style={{
                  background: `${popup.style?.accentColor || "#8b0000"}22`,
                  color: popup.style?.accentColor || "#8b0000",
                }}
              >
                <Percent size={isMobile ? 20 : 28} />
              </div>
            )}

            {/* Title */}
            <h2 className={`popup-title ${isMobile ? "mobile" : ""}`}>
              {popup.title}
            </h2>

            {/* Subtitle */}
            {popup.subtitle && (
              <p className={`popup-subtitle ${isMobile ? "mobile" : ""}`}>
                {popup.subtitle}
              </p>
            )}

            {/* Description */}
            {popup.description && (
              <p className={`popup-description ${isMobile ? "mobile" : ""}`}>
                {popup.description}
              </p>
            )}

            {/* Coupon Code */}
            {popup.couponCode && (
              <div
                className={`coupon-code-wrapper ${isMobile ? "mobile" : ""}`}
              >
                <div className="coupon-code-container">
                  <span className="coupon-code-label">🎫 Use Code:</span>
                  <div className="coupon-code-box">
                    <span className="coupon-code">{popup.couponCode}</span>
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
            )}

            {/* Actions */}
            <div className={`popup-actions ${isMobile ? "mobile" : ""}`}>
              <Button
                className="popup-primary-btn"
                onClick={handlePrimaryClick}
                style={{
                  backgroundColor: popup.style?.buttonColor || "#8b0000",
                  color: popup.style?.buttonTextColor || "#ffffff",
                }}
              >
                <ShoppingBag size={isMobile ? 14 : 16} />
                {popup.primaryButton?.text || "Shop Now"}
              </Button>

              {popup.secondaryButton?.show && (
                <Button
                  variant="outline-secondary"
                  className="popup-secondary-btn"
                  onClick={handleSecondaryClick}
                  style={{
                    color: popup.style?.textColor || "#9ca3af",
                    borderColor: `${popup.style?.textColor || "#9ca3af"}33`,
                  }}
                >
                  {isMobile
                    ? "×"
                    : popup.secondaryButton?.text || "Maybe Later"}
                </Button>
              )}
            </div>

            {popup.coupon?.autoGenerate && (
              <p className={`popup-terms ${isMobile ? "mobile" : ""}`}>
                * Valid for first-time orders. T&C apply.
              </p>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PopupDisplay;

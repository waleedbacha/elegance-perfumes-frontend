import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const ProductImages = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const imageList =
    images?.length > 0
      ? images
      : [{ url: "https://via.placeholder.com/600x600" }];

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % imageList.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextImage();
    }
    if (touchStart - touchEnd < -75) {
      prevImage();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") setIsZoomed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="product-gallery">
      {/* Main Image */}
      <div
        className="main-image"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsZoomed(true)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            src={imageList[activeIndex]?.url}
            alt={`${productName} - Image ${activeIndex + 1}`}
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        {imageList.length > 1 && (
          <>
            <button
              className="gallery-nav prev"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className="gallery-nav next"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Image Counter */}
        {imageList.length > 1 && (
          <div className="image-counter">
            {activeIndex + 1} / {imageList.length}
          </div>
        )}

        {/* Zoom Hint */}
        <div className="zoom-hint">Click to zoom</div>
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="thumbnail-list">
          {imageList.map((img, index) => (
            <button
              key={index}
              className={`thumbnail ${activeIndex === index ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
            >
              <img
                src={img.url}
                alt={`${productName} thumbnail ${index + 1}`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {isZoomed && (
        <motion.div
          className="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsZoomed(false)}
        >
          <button className="lightbox-close" onClick={() => setIsZoomed(false)}>
            <X size={32} />
          </button>
          <img src={imageList[activeIndex]?.url} alt={productName} />
          {imageList.length > 1 && (
            <>
              <button
                className="lightbox-nav prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <ChevronLeft size={32} />
              </button>
              <button
                className="lightbox-nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ProductImages;

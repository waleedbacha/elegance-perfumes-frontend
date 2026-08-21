// frontend/src/components/common/BannerCarousel.jsx
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getActiveBanners } from "../../redux/slices/bannerSlice";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import "../../styles/components/BannerCarousel.css";

const BannerCarousel = ({
  position = "hero",
  section = "homepage",
  limit = 5,
  height = 180,
  autoPlay = true,
  autoPlayInterval = 4000,
  showArrows = true,
  showDots = true,
  pauseOnHover = true,
  className = "",
}) => {
  const dispatch = useDispatch();
  const { activeBanners, isLoading } = useSelector((state) => state.banners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    dispatch(getActiveBanners({ position, section, limit }));
  }, [dispatch, position, section, limit]);

  // Filter banners for this position and section
  const banners =
    activeBanners?.filter(
      (banner) => banner.position === position && banner.section === section,
    ) || [];

  // Auto-play functionality
  useEffect(() => {
    if (banners.length > 1 && autoPlay && !isPaused) {
      timerRef.current = setInterval(() => {
        goToNext();
      }, autoPlayInterval);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [banners.length, autoPlay, isPaused, autoPlayInterval, currentIndex]);

  // Reset timer when user manually changes slide
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (banners.length > 1 && autoPlay && !isPaused) {
      timerRef.current = setInterval(() => {
        goToNext();
      }, autoPlayInterval);
    }
  };

  const goToSlide = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    resetTimer();
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    const nextIndex = (currentIndex + 1) % banners.length;
    goToSlide(nextIndex);
  };

  const goToPrev = () => {
    if (isTransitioning) return;
    const prevIndex = (currentIndex - 1 + banners.length) % banners.length;
    goToSlide(prevIndex);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  // Mouse hover handlers
  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  // Toggle auto-play
  const toggleAutoPlay = () => {
    setIsPaused(!isPaused);
  };

  if (isLoading) {
    return (
      <div className="banner-carousel-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!banners.length) {
    return null;
  }

  return (
    <div
      className={`banner-carousel ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div
        className="banner-carousel-container"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning
            ? "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
            : "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={`banner-slide ${index === currentIndex ? "active" : ""}`}
          >
            <Link
              to={banner.link?.url || "#"}
              target={banner.link?.openInNewTab ? "_blank" : "_self"}
              className="banner-link"
            >
              {/* Background Image with overlay */}
              <div
                className="banner-image-wrapper"
                style={{ height: `${height}px` }}
              >
                <img
                  src={banner.image?.url}
                  alt={banner.image?.alt || banner.title}
                  className="banner-image"
                  loading="lazy"
                />
                <div className="banner-overlay">
                  <div className="banner-content">
                    <h2 className="banner-title">{banner.title}</h2>
                    {banner.subtitle && (
                      <p className="banner-subtitle">{banner.subtitle}</p>
                    )}
                    {banner.link?.text && (
                      <span className="banner-cta">{banner.link.text}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && banners.length > 1 && (
        <>
          <button
            className="banner-arrow prev"
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="banner-arrow next"
            onClick={goToNext}
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Progress Bar */}
      {autoPlay && banners.length > 1 && (
        <div className="banner-progress-bar">
          <div
            className="banner-progress-fill"
            style={{
              width: `${((currentIndex + 1) / banners.length) * 100}%`,
              transition: "width 0.5s ease",
            }}
          />
        </div>
      )}

      {/* Dots Indicator */}
      {showDots && banners.length > 1 && (
        <div className="banner-dots">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`banner-dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play Toggle (optional) */}
      {autoPlay && banners.length > 1 && (
        <button
          className="banner-autoplay-toggle"
          onClick={toggleAutoPlay}
          aria-label={isPaused ? "Resume auto-play" : "Pause auto-play"}
        >
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      )}
    </div>
  );
};

export default BannerCarousel;

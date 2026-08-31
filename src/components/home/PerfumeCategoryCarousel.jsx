// frontend/src/components/home/PerfumeCategoryCarousel.jsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getCategories } from "../../redux/slices/categorySlice";
import "../../styles/components/PerfumeCategoryCarousel.css";

const PerfumeCategoryCarousel = () => {
  const dispatch = useDispatch();
  const { categories: dbCategories, isLoading } = useSelector(
    (state) => state.categories,
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // ✅ Fetch categories from database on mount
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  // ✅ Transform database categories to carousel format
  const categories = React.useMemo(() => {
    if (!dbCategories || dbCategories.length === 0) return [];

    return dbCategories
      .filter((cat) => cat.isActive !== false) // Only active categories
      .map((cat, index) => ({
        id: cat._id || index + 1,
        title: cat.displayName || cat.name.toUpperCase(),
        image:
          cat.image?.url ||
          cat.imageUrl ||
          "https://via.placeholder.com/400x600",
        link: `/collections?category=${cat.name}`,
        description: cat.description || "",
        name: cat.name,
        order: cat.order || 0,
      }))
      .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order
  }, [dbCategories]);

  /*
   * Get circular position of each card relative
   * to the currently active card.
   *
   * -2 = far left
   * -1 = left
   *  0 = center
   * +1 = right
   * +2 = far right
   */
  const getPosition = useCallback(
    (index) => {
      const total = categories.length;
      if (total === 0) return 0;

      let position = index - activeIndex;

      if (position > total / 2) {
        position -= total;
      }

      if (position < -total / 2) {
        position += total;
      }

      return position;
    },
    [activeIndex, categories.length],
  );

  /*
   * Change active slide
   */
  const changeSlide = useCallback(
    (newIndex) => {
      if (isAnimating || categories.length === 0) return;

      setIsAnimating(true);

      setActiveIndex((newIndex + categories.length) % categories.length);

      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    },
    [isAnimating, categories.length],
  );

  /*
   * Previous
   */
  const handlePrevious = useCallback(() => {
    changeSlide(activeIndex - 1);
  }, [activeIndex, changeSlide]);

  /*
   * Next
   */
  const handleNext = useCallback(() => {
    changeSlide(activeIndex + 1);
  }, [activeIndex, changeSlide]);

  /*
   * Keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        handlePrevious();
      }

      if (event.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePrevious, handleNext]);

  /*
   * Auto play
   */
  useEffect(() => {
    if (categories.length === 0) return;

    const interval = setInterval(() => {
      if (!isAnimating) {
        handleNext();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [handleNext, isAnimating, categories.length]);

  /*
   * Touch start
   */
  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
    touchEndX.current = null;
  };

  /*
   * Touch move
   */
  const handleTouchMove = (event) => {
    touchEndX.current = event.touches[0].clientX;
  };

  /*
   * Touch end
   */
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) {
      return;
    }

    const distance = touchStartX.current - touchEndX.current;

    const minimumSwipeDistance = 50;

    if (distance > minimumSwipeDistance) {
      handleNext();
    }

    if (distance < -minimumSwipeDistance) {
      handlePrevious();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  /*
   * Clicking a side card makes it the active card.
   */
  const handleCardClick = (index, event) => {
    if (index !== activeIndex) {
      event.preventDefault();
      changeSlide(index);
    }
  };

  // ✅ Show loading state
  if (isLoading) {
    return (
      <section className="perfume-category-carousel">
        <div className="perfume-carousel-container">
          <div className="perfume-carousel-heading">
            <h2>
              <span className="heading-white">FOR EVERY</span>{" "}
              <span className="heading-red">YOU</span>
            </h2>
          </div>
          <div
            className="perfume-carousel-stage"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="carousel-loading-spinner">
              <div className="spinner"></div>
              <p style={{ color: "#9ca3af", marginTop: "12px" }}>
                Loading categories...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ✅ Don't render if no categories
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="perfume-category-carousel">
      <div className="perfume-carousel-container">
        {/* ======================================
            TITLE
        ====================================== */}
        <div className="perfume-carousel-heading">
          <h2>
            <span className="heading-white">FOR EVERY</span>{" "}
            <span className="heading-red">YOU</span>
          </h2>
        </div>

        {/* ======================================
            CAROUSEL
        ====================================== */}
        <div
          className="perfume-carousel-stage"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {categories.map((category, index) => {
            const position = getPosition(index);

            /*
             * Only display five cards:
             *
             * far-left
             * left
             * center
             * right
             * far-right
             */
            if (Math.abs(position) > 2) {
              return null;
            }

            const isActive = position === 0;

            let positionClass = "";

            switch (position) {
              case -2:
                positionClass = "position-far-left";
                break;

              case -1:
                positionClass = "position-left";
                break;

              case 0:
                positionClass = "position-center";
                break;

              case 1:
                positionClass = "position-right";
                break;

              case 2:
                positionClass = "position-far-right";
                break;

              default:
                positionClass = "";
            }

            return (
              <div
                key={category.id}
                className={`perfume-category-card ${positionClass}`}
              >
                <Link
                  to={category.link}
                  className="perfume-category-card-link"
                  onClick={(event) => handleCardClick(index, event)}
                  draggable="false"
                >
                  <div className="perfume-category-image-wrapper">
                    <img
                      src={category.image}
                      alt={`${category.title} perfume collection`}
                      className="perfume-category-image"
                      loading={isActive ? "eager" : "lazy"}
                      draggable="false"
                    />

                    {/* Dark bottom gradient */}
                    <div className="perfume-category-gradient" />

                    {/* Category title */}
                    <div className="perfume-category-content">
                      <h3>{category.title}</h3>

                      <div className="perfume-category-line" />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}

          {/* ======================================
              LEFT ARROW
          ====================================== */}
          <button
            type="button"
            className="perfume-carousel-arrow perfume-carousel-arrow-left"
            onClick={handlePrevious}
            disabled={isAnimating || categories.length <= 1}
            aria-label="Previous category"
          >
            <ChevronLeft />
          </button>

          {/* ======================================
              RIGHT ARROW
          ====================================== */}
          <button
            type="button"
            className="perfume-carousel-arrow perfume-carousel-arrow-right"
            onClick={handleNext}
            disabled={isAnimating || categories.length <= 1}
            aria-label="Next category"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PerfumeCategoryCarousel;

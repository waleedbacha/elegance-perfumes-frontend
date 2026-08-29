import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categories } from "../../data/categoryData";
import "../../styles/components/PerfumeCategoryCarousel.css";

const PerfumeCategoryCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

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

      let position = index - activeIndex;

      if (position > total / 2) {
        position -= total;
      }

      if (position < -total / 2) {
        position += total;
      }

      return position;
    },
    [activeIndex],
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
    [isAnimating],
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
    const interval = setInterval(() => {
      if (!isAnimating) {
        handleNext();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [handleNext, isAnimating]);

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

  return (
    <section className="perfume-category-carousel">
      <div className="perfume-carousel-container">
        {/* ======================================
            TITLE
        ====================================== */}
        <div className="perfume-carousel-heading">
          <h2>FOR EVERY YOU</h2>
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
            disabled={isAnimating}
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
            disabled={isAnimating}
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

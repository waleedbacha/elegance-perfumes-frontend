// frontend/src/components/common/Pagination.jsx
import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showItemsInfo = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className = "",
}) => {
  // Calculate range of items being displayed
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if we're near the beginning
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }

    // Adjust if we're near the end
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    // Add first page with ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page with ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  // Handle page change with validation
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  // If there's only one page or no items, don't render pagination
  if (totalPages <= 1 && totalItems <= itemsPerPage) {
    return null;
  }

  return (
    <div className={`pagination-container ${className}`}>
      <div className="pagination-wrapper">
        {/* Items info */}
        {showItemsInfo && totalItems > 0 && (
          <div className="pagination-info">
            Showing {startItem} - {endItem} of {totalItems} items
          </div>
        )}

        {/* Pagination controls */}
        <div className="pagination-controls">
          {/* First page */}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
            title="First page"
          >
            <ChevronsLeft size={16} />
          </button>

          {/* Previous page */}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          {showPageNumbers && (
            <div className="pagination-pages">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  className={`pagination-page-btn ${
                    page === currentPage ? "active" : ""
                  } ${page === "..." ? "ellipsis" : ""}`}
                  onClick={() => {
                    if (page !== "...") handlePageChange(page);
                  }}
                  disabled={page === "..."}
                  aria-label={page !== "..." ? `Page ${page}` : "More pages"}
                >
                  {page}
                </button>
              ))}
            </div>
          )}

          {/* Next page */}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            title="Next page"
          >
            <ChevronRight size={16} />
          </button>

          {/* Last page */}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
            title="Last page"
          >
            <ChevronsRight size={16} />
          </button>

          {/* Page size selector (optional) */}
          <div className="pagination-page-size">
            <span>Items per page:</span>
            <select
              className="pagination-select"
              value={itemsPerPage}
              onChange={(e) => {
                // Pass the new limit to parent
                if (onPageChange) {
                  // This will be handled by the parent
                }
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pagination-container {
          padding: 16px 24px;
          border-top: 1px solid #2a2a2a;
          background: #0a0a0a;
        }

        .pagination-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pagination-info {
          color: #9ca3af;
          font-size: 0.85rem;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          border-color: #8b0000;
          color: #ffffff;
          background: rgba(139, 0, 0, 0.1);
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pagination-pages {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pagination-page-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
          padding: 0 8px;
          border: 1px solid transparent;
          border-radius: 6px;
          background: transparent;
          color: #9ca3af;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-page-btn:hover:not(.active):not(.ellipsis) {
          border-color: #2a2a2a;
          color: #ffffff;
        }

        .pagination-page-btn.active {
          background: #8b0000;
          color: #ffffff;
          border-color: #8b0000;
        }

        .pagination-page-btn.ellipsis {
          cursor: default;
          color: #4a4a4a;
        }

        .pagination-page-btn.ellipsis:hover {
          background: transparent;
        }

        .pagination-page-size {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 12px;
          color: #9ca3af;
          font-size: 0.85rem;
        }

        .pagination-select {
          padding: 4px 8px;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          background: #0a0a0a;
          color: #ffffff;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .pagination-select:focus {
          outline: none;
          border-color: #8b0000;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .pagination-wrapper {
            flex-direction: column;
            align-items: stretch;
          }

          .pagination-info {
            text-align: center;
          }

          .pagination-controls {
            justify-content: center;
          }

          .pagination-page-size {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Pagination;

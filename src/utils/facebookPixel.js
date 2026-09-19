// frontend/src/utils/facebookPixel.js

/**
 * Meta Pixel utility for Hamama Perfumes
 * Pixel ID: 1625203179395141
 */

// Check if Facebook Pixel is loaded
export const isPixelLoaded = () => {
  return typeof window !== "undefined" && typeof window.fbq === "function";
};

// Track a standard event
export const trackEvent = (eventName, eventData = {}) => {
  if (isPixelLoaded()) {
    window.fbq("track", eventName, eventData);
    console.log(`📊 Meta Pixel: ${eventName}`, eventData);
  }
};

// ============================================
// ESSENTIAL EVENT TRACKERS
// ============================================

// PageView - fires on every page
export const trackPageView = () => {
  if (isPixelLoaded()) {
    window.fbq("track", "PageView");
  }
};

// ViewContent - fires when user views a product
export const trackViewContent = (product) => {
  trackEvent("ViewContent", {
    content_ids: [product._id || product.id],
    content_name: product.name,
    content_type: "product",
    content_category: product.category || "perfume",
    value: parseFloat(product.price) || 0,
    currency: "PKR",
  });
};

// AddToCart - fires when user adds to cart
export const trackAddToCart = (product, quantity = 1) => {
  trackEvent("AddToCart", {
    content_ids: [product._id || product.id],
    content_name: product.name,
    content_type: "product",
    value: (parseFloat(product.price) || 0) * quantity,
    currency: "PKR",
  });
};

// InitiateCheckout - fires when user starts checkout
export const trackInitiateCheckout = (cart) => {
  trackEvent("InitiateCheckout", {
    content_ids: cart.items?.map((item) => item.product?._id || item.product),
    content_type: "product",
    num_items: cart.items?.length || 0,
    value: cart.total || 0,
    currency: "PKR",
  });
};

// Purchase - fires when order is completed
export const trackPurchase = (order) => {
  trackEvent("Purchase", {
    content_ids: order.items?.map((item) => item.product) || [],
    content_type: "product",
    num_items: order.items?.length || 0,
    value: order.total || 0,
    currency: "PKR",
    order_id: order.orderNumber,
  });
};

// Search - fires when user searches
export const trackSearch = (searchQuery) => {
  trackEvent("Search", {
    search_string: searchQuery,
  });
};

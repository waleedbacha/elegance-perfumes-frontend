// frontend/src/utils/fetchManager.js

/**
 * Professional Fetch Manager - Prevents duplicate API calls
 * Singleton pattern to manage fetch states across components
 */
class FetchManager {
  constructor() {
    this.flags = {
      users: false,
      products: false,
      orders: false,
      inventory: false,
      banners: false,
      coupons: false,
    };
    this.promises = {};
    this.timestamps = {};
    this.COOLDOWN = 5000; // 5 seconds cooldown
  }

  /**
   * Check if a fetch is already in progress or recently completed
   */
  canFetch(key) {
    const now = Date.now();
    const lastFetch = this.timestamps[key] || 0;

    // If fetch is in progress, don't allow new fetch
    if (this.promises[key]) {
      console.log(`⚠️ ${key} fetch already in progress`);
      return false;
    }

    // If fetch was done recently (within cooldown), don't allow new fetch
    if (now - lastFetch < this.COOLDOWN) {
      console.log(
        `⚠️ ${key} fetch on cooldown (${Math.round((now - lastFetch) / 1000)}s ago)`,
      );
      return false;
    }

    // If already fetched and not expired, don't allow new fetch
    if (this.flags[key]) {
      console.log(`⚠️ ${key} already fetched`);
      return false;
    }

    return true;
  }

  /**
   * Mark fetch as started
   */
  startFetch(key) {
    this.flags[key] = true;
    this.timestamps[key] = Date.now();
  }

  /**
   * Mark fetch as completed
   */
  completeFetch(key) {
    this.promises[key] = null;
    this.timestamps[key] = Date.now();
  }

  /**
   * Reset fetch flag (for retry)
   */
  resetFetch(key) {
    this.flags[key] = false;
    this.promises[key] = null;
  }

  /**
   * Check if fetch is in progress
   */
  isFetching(key) {
    return !!this.promises[key];
  }

  /**
   * Get last fetch time
   */
  getLastFetchTime(key) {
    return this.timestamps[key] || 0;
  }
}

// Export singleton instance
export const fetchManager = new FetchManager();

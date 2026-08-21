import { createSlice } from "@reduxjs/toolkit";

// ============================================
// Initial State
// ============================================
const initialState = {
  isLoading: false,
  isSidebarOpen: false,
  isCartOpen: false,
  isMobileMenuOpen: false,
  error: null,
  success: null,
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  toast: {
    message: null,
    type: null,
    duration: 3000,
  },
};

// ============================================
// Slice
// ============================================
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Loading
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    startLoading: (state) => {
      state.isLoading = true;
    },
    stopLoading: (state) => {
      state.isLoading = false;
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openSidebar: (state) => {
      state.isSidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },

    // Cart
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },

    // Mobile Menu
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    openMobileMenu: (state) => {
      state.isMobileMenuOpen = true;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },

    // Error
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Success
    setSuccess: (state, action) => {
      state.success = action.payload;
    },
    clearSuccess: (state) => {
      state.success = null;
    },

    // Modal
    openModal: (state, action) => {
      state.modal.isOpen = true;
      state.modal.type = action.payload?.type || null;
      state.modal.data = action.payload?.data || null;
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.type = null;
      state.modal.data = null;
    },

    // Toast
    showToast: (state, action) => {
      state.toast.message = action.payload.message;
      state.toast.type = action.payload.type || "info";
      state.toast.duration = action.payload.duration || 3000;
    },
    hideToast: (state) => {
      state.toast.message = null;
      state.toast.type = null;
    },

    // Reset all UI
    resetUI: () => initialState,
  },
});

// ============================================
// Actions
// ============================================
export const {
  setLoading,
  startLoading,
  stopLoading,
  toggleSidebar,
  openSidebar,
  closeSidebar,
  toggleCart,
  openCart,
  closeCart,
  toggleMobileMenu,
  openMobileMenu,
  closeMobileMenu,
  setError,
  clearError,
  setSuccess,
  clearSuccess,
  openModal,
  closeModal,
  showToast,
  hideToast,
  resetUI,
} = uiSlice.actions;

// ============================================
// Selectors
// ============================================
export const selectUI = (state) => state.ui;
export const selectIsLoading = (state) => state.ui.isLoading;
export const selectError = (state) => state.ui.error;
export const selectSuccess = (state) => state.ui.success;
export const selectModal = (state) => state.ui.modal;
export const selectToast = (state) => state.ui.toast;

// ============================================
// Export
// ============================================
export default uiSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cartService from "../../services/cartService";

// ============================================
// Initial State
// ============================================
const initialState = {
  cart: null,
  items: [],
  isLoading: false,
  error: null,
  success: null,
  subtotal: 0,
  productDiscount: 0, // ✅ Product discount
  couponDiscount: 0, // ✅ Coupon discount
  discount: 0, // ✅ Total discount (product + coupon)
  // tax: 0,
  shipping: 200,
  total: 0,
  totalItems: 0,
  coupon: null,
};

// ============================================
// Async Thunks
// ============================================

// GET /api/v1/cart
export const getCart = createAsyncThunk(
  "cart/get",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch cart",
      );
    }
  },
);

// GET /api/v1/cart/summary
export const getCartSummary = createAsyncThunk(
  "cart/getSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCartSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch cart summary",
      );
    }
  },
);

// POST /api/v1/cart/items
export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ productId, size, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(productId, size, quantity);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to add item to cart",
      );
    }
  },
);

// PUT /api/v1/cart/items
export const updateCartItem = createAsyncThunk(
  "cart/update",
  async ({ productId, size, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(
        productId,
        size,
        quantity,
      );
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update cart item",
      );
    }
  },
);

// DELETE /api/v1/cart/items/:productId/:size
export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async ({ productId, size }, { rejectWithValue }) => {
    try {
      const response = await cartService.removeFromCart(productId, size);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to remove item from cart",
      );
    }
  },
);

// DELETE /api/v1/cart
export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.clearCart();
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to clear cart",
      );
    }
  },
);

// POST /api/v1/cart/coupon
export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async (code, { rejectWithValue }) => {
    try {
      const response = await cartService.applyCoupon(code);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to apply coupon",
      );
    }
  },
);

// DELETE /api/v1/cart/coupon
export const removeCoupon = createAsyncThunk(
  "cart/removeCoupon",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.removeCoupon();
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to remove coupon",
      );
    }
  },
);

// POST /api/v1/cart/merge
export const mergeCart = createAsyncThunk(
  "cart/merge",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await cartService.mergeCart(sessionId);
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to merge cart",
      );
    }
  },
);

// ============================================
// Slice
// ============================================
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    resetCart: (state) => {
      return initialState;
    },
    updateLocalQuantity: (state, action) => {
      const { productId, size, quantity } = action.payload;
      const item = state.items.find(
        (i) => i.product?._id === productId || i.product === productId,
      );
      if (item) {
        item.quantity = quantity;
        // Recalculate totals
        state.subtotal = state.items.reduce(
          (sum, i) => sum + (i.price || 0) * i.quantity,
          0,
        );
        state.totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
      }
    },
  },
  extraReducers: (builder) => {
    // ==========================================
    // GET CART
    // ==========================================
    builder
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.productDiscount = action.payload?.productDiscount || 0;
        state.couponDiscount = action.payload?.couponDiscount || 0;
        state.discount = action.payload?.discount || 0;
        state.tax = action.payload?.tax || 0;
        state.shipping = action.payload?.shipping || 0;
        state.total = action.payload?.total || 0;
        state.totalItems =
          action.payload?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
        state.coupon = action.payload?.coupon || null;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // ADD TO CART
    // ==========================================
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.productDiscount = action.payload?.productDiscount || 0;
        state.couponDiscount = action.payload?.couponDiscount || 0;
        state.discount = action.payload?.discount || 0;
        state.tax = action.payload?.tax || 0;
        state.shipping = action.payload?.shipping || 0;
        state.total = action.payload?.total || 0;
        state.totalItems =
          action.payload?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
        state.success = "Item added to cart";
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // UPDATE CART ITEM
    // ==========================================
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.productDiscount = action.payload?.productDiscount || 0;
        state.couponDiscount = action.payload?.couponDiscount || 0;
        state.discount = action.payload?.discount || 0;
        state.tax = action.payload?.tax || 0;
        state.shipping = action.payload?.shipping || 0;
        state.total = action.payload?.total || 0;
        state.totalItems =
          action.payload?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
        state.success = "Cart updated";
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // REMOVE FROM CART
    // ==========================================
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.productDiscount = action.payload?.productDiscount || 0;
        state.couponDiscount = action.payload?.couponDiscount || 0;
        state.discount = action.payload?.discount || 0;
        state.tax = action.payload?.tax || 0;
        state.shipping = action.payload?.shipping || 0;
        state.total = action.payload?.total || 0;
        state.totalItems =
          action.payload?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
        state.success = "Item removed from cart";
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // CLEAR CART
    // ==========================================
    builder
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = [];
        state.subtotal = 0;
        state.productDiscount = 0;
        state.couponDiscount = 0;
        state.discount = 0;
        state.tax = 0;
        state.shipping = 0;
        state.total = 0;
        state.totalItems = 0;
        state.coupon = null;
        state.success = "Cart cleared";
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ==========================================
    // APPLY COUPON
    // ==========================================
    builder
      .addCase(applyCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.productDiscount = action.payload?.productDiscount || 0;
        state.couponDiscount = action.payload?.couponDiscount || 0;
        state.discount = action.payload?.discount || 0;
        state.tax = action.payload?.tax || 0;
        state.shipping = action.payload?.shipping || 0;
        state.total = action.payload?.total || 0;
        state.coupon = action.payload?.coupon || null;
        state.success = "Coupon applied successfully";
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // REMOVE COUPON
    // ==========================================
    builder
      .addCase(removeCoupon.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload?.items || [];
        state.subtotal = action.payload?.subtotal || 0;
        state.productDiscount = action.payload?.productDiscount || 0;
        state.couponDiscount = action.payload?.couponDiscount || 0;
        state.discount = action.payload?.discount || 0;
        state.tax = action.payload?.tax || 0;
        state.shipping = action.payload?.shipping || 0;
        state.total = action.payload?.total || 0;
        state.coupon = null;
        state.success = "Coupon removed";
      })
      .addCase(removeCoupon.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// ============================================
// Actions
// ============================================
export const { clearError, clearSuccess, resetCart, updateLocalQuantity } =
  cartSlice.actions;

// ============================================
// Selectors
// ============================================
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartTotalItems = (state) => state.cart.totalItems;

// ============================================
// Export
// ============================================
export default cartSlice.reducer;

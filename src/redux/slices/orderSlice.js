import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "../../services/orderService";

// ============================================
// Initial State
// ============================================
const initialState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  success: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  },
  stats: null,
  tracking: null,
};

// ============================================
// Async Thunks
// ============================================

// POST /api/v1/orders
export const createOrder = createAsyncThunk(
  "orders/create",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to create order",
      );
    }
  },
);

// GET /api/v1/orders (User orders)
export const getOrders = createAsyncThunk(
  "orders/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch orders",
      );
    }
  },
);

// GET /api/v1/orders/:id
export const getOrderById = createAsyncThunk(
  "orders/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrder(id);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch order",
      );
    }
  },
);

// GET /api/v1/orders/:id/track
export const trackOrder = createAsyncThunk(
  "orders/track",
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.trackOrder(id);
      return response.data.tracking;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to track order",
      );
    }
  },
);

// PUT /api/v1/orders/:id/cancel
export const cancelOrder = createAsyncThunk(
  "orders/cancel",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await orderService.cancelOrder(id, reason);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to cancel order",
      );
    }
  },
);

// ============================================
// ADMIN THUNKS
// ============================================

// ✅ GET /api/v1/orders/admin/all - Fetch ALL orders (Admin)
export const getAllOrders = createAsyncThunk(
  "orders/admin/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getAllOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch all orders",
      );
    }
  },
);

// GET /api/v1/orders/admin/stats
export const getOrderStats = createAsyncThunk(
  "orders/admin/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderStats();
      return response.data.stats;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch order stats",
      );
    }
  },
);

// ✅ PUT /api/v1/orders/admin/:id/status - Update order status (Admin)
export const updateOrderStatus = createAsyncThunk(
  "orders/admin/updateStatus",
  async ({ id, status, note = "" }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(id, status, note);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update order status",
      );
    }
  },
);

// PUT /api/v1/orders/admin/:id/tracking
export const updateTracking = createAsyncThunk(
  "orders/admin/updateTracking",
  async ({ id, trackingNumber, provider, url = "" }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateTracking(
        id,
        trackingNumber,
        provider,
        url,
      );
      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to update tracking",
      );
    }
  },
);

// POST /api/v1/orders/admin/:id/invoice
export const generateInvoice = createAsyncThunk(
  "orders/admin/generateInvoice",
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.generateInvoice(id);
      return response.data.invoiceUrl;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to generate invoice",
      );
    }
  },
);

// ✅ GET /api/v1/orders/admin/:id - Get single order with history (Admin)
export const getOrderByIdAdmin = createAsyncThunk(
  "orders/admin/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderAdmin(id);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to fetch order details",
      );
    }
  },
);

// orderSlice.js - Replace these two thunks

// POST /api/v1/orders/admin/:id/confirm-payment
export const confirmPayment = createAsyncThunk(
  "orders/admin/confirmPayment",
  async ({ id, amount, note, paymentMethod }, { rejectWithValue }) => {
    try {
      // ✅ Use orderService instead of api
      const response = await orderService.confirmPayment(
        id,
        amount,
        note,
        paymentMethod,
      );
      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to confirm payment",
      );
    }
  },
);

// POST /api/v1/orders/admin/:id/mark-payment-failed
export const markPaymentFailed = createAsyncThunk(
  "orders/admin/markPaymentFailed",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      // ✅ Use orderService instead of api
      const response = await orderService.markPaymentFailed(id, reason);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to mark payment as failed",
      );
    }
  },
);
// ============================================
// Slice
// ============================================
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearTracking: (state) => {
      state.tracking = null;
    },
  },
  extraReducers: (builder) => {
    // ==========================================
    // CREATE ORDER
    // ==========================================
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.selectedOrder = action.payload;
        state.success = "Order created successfully";
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // GET ORDERS (User)
    // ==========================================
    builder
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // GET ORDER BY ID
    // ==========================================
    builder
      .addCase(getOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // TRACK ORDER
    // ==========================================
    builder
      .addCase(trackOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tracking = action.payload;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // CANCEL ORDER
    // ==========================================
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(
          (o) => o._id === action.payload._id,
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?._id === action.payload._id) {
          state.selectedOrder = action.payload;
        }
        state.success = "Order cancelled successfully";
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // ADMIN: GET ALL ORDERS
    // ==========================================
    builder
      .addCase(getAllOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
        console.log("📊 Admin orders fetched:", action.payload.orders?.length);
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error("❌ Failed to fetch admin orders:", action.payload);
      });

    // ==========================================
    // ADMIN: GET ORDER STATS
    // ==========================================
    builder
      .addCase(getOrderStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getOrderStats.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ==========================================
    // ADMIN: UPDATE ORDER STATUS
    // ==========================================
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(
          (o) => o._id === action.payload._id,
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?._id === action.payload._id) {
          state.selectedOrder = action.payload;
        }
        state.success = `Order status updated to ${action.payload.status}`;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ==========================================
    // ADMIN: UPDATE TRACKING
    // ==========================================
    builder
      .addCase(updateTracking.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          (o) => o._id === action.payload._id,
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?._id === action.payload._id) {
          state.selectedOrder = action.payload;
        }
        state.success = "Tracking updated successfully";
      })
      .addCase(updateTracking.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ==========================================
    // ADMIN: GENERATE INVOICE
    // ==========================================
    builder
      .addCase(generateInvoice.fulfilled, (state, action) => {
        if (state.selectedOrder) {
          state.selectedOrder.invoiceUrl = action.payload;
        }
        state.success = "Invoice generated successfully";
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.error = action.payload;
      });
    // ==========================================
    // ADMIN: GET ORDER BY ID (with history)
    // ==========================================
    builder
      .addCase(getOrderByIdAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderByIdAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(getOrderByIdAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(confirmPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(
          (o) => o._id === action.payload._id,
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?._id === action.payload._id) {
          state.selectedOrder = action.payload;
        }
        state.success = "Payment confirmed successfully";
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(markPaymentFailed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(markPaymentFailed.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(
          (o) => o._id === action.payload._id,
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?._id === action.payload._id) {
          state.selectedOrder = action.payload;
        }
        state.success = "Payment marked as failed";
      })
      .addCase(markPaymentFailed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ============================================
// Actions
// ============================================
export const { clearSelectedOrder, clearError, clearSuccess, clearTracking } =
  orderSlice.actions;

// ============================================
// Selectors
// ============================================
export const selectOrders = (state) => state.orders;
export const selectSelectedOrder = (state) => state.orders.selectedOrder;
export const selectOrderTracking = (state) => state.orders.tracking;

// ============================================
// Export
// ============================================
export default orderSlice.reducer;

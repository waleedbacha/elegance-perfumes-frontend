import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";
import wishlistReducer from "./slices/wishlistSlice";
import uiReducer from "./slices/uiSlice";
import bannerReducer from "./slices/bannerSlice"; // Add this
import couponReducer from "./slices/couponSlice";
import inventoryReducer from "./slices/inventorySlice";
import reviewReducer from "./slices/reviewSlice";
import categoryReducer from "./slices/categorySlice";
import heroReducer from "./slices/heroSlice";
import settingReducer from "./slices/settingSlice";
import navbarReducer from "./slices/navbarSlice";
import seoReducer from "./slices/seoSlice";
import cacheReducer from "./slices/cacheSlice"; // Add this

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
    banners: bannerReducer,
    coupons: couponReducer,
    reviews: reviewReducer,
    inventory: inventoryReducer,
    categories: categoryReducer,
    hero: heroReducer,
    settings: settingReducer,
    navbar: navbarReducer,
    seo: seoReducer,
    cache: cacheReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

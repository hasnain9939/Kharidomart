"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, PRODUCTS } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  provider: "email" | "google";
  joinedDate: string;
  address?: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "warning";
}

interface StoreContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  freeShippingThreshold: number;
  freeShippingProgress: number;
  discountCode: string;
  discountAmount: number;
  finalTotal: number;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  quickViewProduct: Product | null;
  wishlist: string[];
  products: Product[];
  isLoadingProducts: boolean;
  refreshProducts: () => Promise<void>;
  toasts: ToastMessage[];
  user: UserProfile | null;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  showToast: (message: string, type?: "success" | "info" | "warning") => void;
  removeToast: (id: string) => void;
  loginWithGoogle: (customData?: Partial<UserProfile>) => void;
  loginWithEmail: (email: string, password?: string, name?: string) => Promise<boolean>;
  signupWithEmail: (name: string, email: string, password?: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const FREE_SHIPPING_LIMIT = 499;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [discountCode, setDiscountCode] = useState<string>("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  const refreshProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("km_user");
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedCart = localStorage.getItem("km_cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem("km_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("km_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("km_user");
      }
    } catch {
      // ignore
    }
  }, [user]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("km_cart", JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("km_wishlist", JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.shortTitle}" to cart! 🛍️`);
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    if (item) {
      showToast(`Removed "${item.product.shortTitle}" from cart`, "info");
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const title = product?.shortTitle || "Item";
    if (wishlist.includes(productId)) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      showToast(`Removed from wishlist: ${title}`, "info");
    } else {
      setWishlist((prev) => [...prev, productId]);
      showToast(`Saved to wishlist: ${title} ❤️`);
    }
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === "MOMFIRST") {
      setDiscountCode(clean);
      showToast("Coupon MOMFIRST applied! Flat ₹50 instant discount added. 🍼");
      return true;
    }
    if (clean === "KHARIDO10" || clean === "WELCOME10") {
      setDiscountCode(clean);
      showToast("Coupon applied! 10% discount added. 🎉");
      return true;
    }
    showToast("Invalid promo code. Try MOMFIRST or KHARIDO10!", "warning");
    return false;
  };

  const removeCoupon = () => {
    setDiscountCode("");
    showToast("Coupon removed", "info");
  };

  const loginWithGoogle = (customData?: Partial<UserProfile>) => {
    const defaultEmail = customData?.email || "customer@gmail.com";
    const defaultName =
      customData?.name ||
      defaultEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const newUser: UserProfile = {
      id: "usr_goog_" + Math.random().toString(36).substring(2, 9),
      name: defaultName,
      email: defaultEmail,
      provider: "google",
      phone: customData?.phone || "",
      joinedDate: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      ...customData,
    };
    setUser(newUser);
    showToast(`Welcome, ${newUser.name.split(" ")[0]}! (Signed in with Google) 🎉`);
  };

  const loginWithEmail = async (email: string, password?: string, name?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const displayName =
      name ||
      cleanEmail
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    const newUser: UserProfile = {
      id: "usr_eml_" + Math.random().toString(36).substring(2, 9),
      name: displayName,
      email: cleanEmail,
      provider: "email",
      joinedDate: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
    };
    setUser(newUser);
    showToast(`Welcome back, ${displayName}! 🛍️`);
    return true;
  };

  const signupWithEmail = async (
    name: string,
    email: string,
    password?: string,
    phone?: string
  ): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const newUser: UserProfile = {
      id: "usr_eml_" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim(),
      provider: "email",
      joinedDate: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
    };
    setUser(newUser);
    showToast(`Account created! Welcome to KharidoMart, ${name.trim().split(" ")[0]}! 🌟`);
    return true;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("km_user");
    } catch {
      // ignore
    }
    showToast("You have been signed out.", "info");
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    showToast("Profile updated successfully!");
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const discountAmount =
    discountCode === "MOMFIRST"
      ? Math.min(subtotal, 50)
      : discountCode === "KHARIDO10" || discountCode === "WELCOME10"
      ? Math.round(subtotal * 0.1)
      : 0;

  const finalTotal = Math.max(0, subtotal - discountAmount);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_LIMIT) * 100)
  );

  return (
    <StoreContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        freeShippingThreshold: FREE_SHIPPING_LIMIT,
        freeShippingProgress,
        discountCode,
        discountAmount,
        finalTotal,
        isCartOpen,
        isSearchOpen,
        quickViewProduct,
        wishlist,
        toasts,
        user,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
        openQuickView: (product: Product) => setQuickViewProduct(product),
        closeQuickView: () => setQuickViewProduct(null),
        toggleWishlist,
        isWishlisted,
        products,
        isLoadingProducts,
        refreshProducts,
        applyCoupon,
        removeCoupon,
        showToast,
        removeToast,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

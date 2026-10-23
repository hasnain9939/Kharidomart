"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import KharidoMartLogo from "@/components/KharidoMartLogo";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore, SavedAddress } from "@/context/StoreContext";
import {
  User,
  Sms,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Logout,
  ShoppingBag,
  Heart,
  TruckFast,
  Location,
  CloseCircle,
  Add,
  Edit,
  Trash,
} from "reicon-react";

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";
  const isCheckoutRedirect = redirectUrl === "/checkout" || redirectUrl.startsWith("/checkout");

  const {
    user,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    updateUserProfile,
    wishlist,
    cartCount,
    showToast,
  } = useStore();

  // Auth Mode State
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Forgot / Reset Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Google OAuth State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);

  // Form State - Sign In
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Form State - Sign Up
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Dashboard Tab State
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "settings">("orders");
  const [pastOrders, setPastOrders] = useState<any[]>([]);

  // Saved Addresses State
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Address Modal Form State
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formType, setFormType] = useState<"home" | "work" | "other">("home");
  const [formAddressLine, setFormAddressLine] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formPincode, setFormPincode] = useState("");
  const [formIsDefault, setFormIsDefault] = useState(true);

  // Profile edit state
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [emailInvoices, setEmailInvoices] = useState(true);

  // Load orders from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("km_all_orders");
      if (stored) {
        setPastOrders(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [user]);

  // Sync profile & addresses when user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || "");

      // 1. Check if user already has savedAddresses in user object
      if (user.savedAddresses && user.savedAddresses.length > 0) {
        setAddresses(user.savedAddresses);
        return;
      }

      // 2. Otherwise check localStorage key km_addresses_{email}
      try {
        const stored = localStorage.getItem(`km_addresses_${user.email}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAddresses(parsed);
            return;
          }
        }
      } catch {
        // ignore
      }

      // 3. Fallback: If user has an address from registration/profile
      if (user.address && user.address.addressLine) {
        const initialAddr: SavedAddress = {
          id: "addr_default",
          name: user.name || "Customer",
          phone: user.phone ? user.phone.replace("+91", "").trim() : "",
          type: "home",
          addressLine: user.address.addressLine,
          city: user.address.city || "",
          state: user.address.state || "",
          pincode: user.address.pincode || "",
          isDefault: true,
        };
        setAddresses([initialAddr]);
        try {
          localStorage.setItem(`km_addresses_${user.email}`, JSON.stringify([initialAddr]));
        } catch {}
      } else {
        setAddresses([]);
      }
    }
  }, [user]);

  // Auto-redirect if already logged in and redirect param is present
  useEffect(() => {
    if (user && redirectUrl) {
      router.replace(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  // Handle Email Sign In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail) {
      showToast("Please enter your email address", "warning");
      return;
    }
    if (!signInPassword) {
      showToast("Please enter your password", "warning");
      return;
    }

    setIsLoading(true);
    const success = await loginWithEmail(signInEmail, signInPassword);
    setIsLoading(false);
    if (success && redirectUrl) {
      router.push(redirectUrl);
    }
  };

  // Handle Email Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim()) {
      showToast("Please enter your full name", "warning");
      return;
    }
    if (!signUpEmail.trim()) {
      showToast("Please enter your email address", "warning");
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      showToast("Password must be at least 6 characters long", "warning");
      return;
    }
    if (!agreeTerms) {
      showToast("Please agree to the Terms of Service & Privacy Policy", "warning");
      return;
    }

    setIsLoading(true);
    const success = await signupWithEmail(signUpName, signUpEmail, signUpPassword, signUpPhone);
    setIsLoading(false);
    if (success && redirectUrl) {
      router.push(redirectUrl);
    }
  };

  // Handle Real Google Login
  const handleGoogleLogin = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // If client ID is not configured in .env, show configuration guidance modal
    if (!googleClientId) {
      setShowGoogleSetupModal(true);
      return;
    }

    // Google Identity Services OAuth 2.0 Token Client (Popup flow)
    if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2) {
      try {
        setIsGoogleLoading(true);
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "email profile openid",
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setIsGoogleLoading(false);
              showToast("Google sign in was cancelled or failed", "warning");
              return;
            }
            if (tokenResponse?.access_token) {
              try {
                const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoRes.json();
                if (userInfo?.email) {
                  const success = await loginWithGoogle({
                    email: userInfo.email,
                    name: userInfo.name || userInfo.email.split("@")[0],
                    googleId: userInfo.sub,
                    picture: userInfo.picture,
                  });
                  if (success && redirectUrl) {
                    router.push(redirectUrl);
                  }
                } else {
                  showToast("Could not retrieve email from Google", "warning");
                }
              } catch (err) {
                console.error("Google userinfo error:", err);
                showToast("Failed to fetch Google profile. Please try again.", "warning");
              } finally {
                setIsGoogleLoading(false);
              }
            }
          },
        });
        client.requestAccessToken({ prompt: "select_account" });
      } catch (err) {
        setIsGoogleLoading(false);
        console.error("Google init error:", err);
        showToast("Google Sign-In failed to initialize. Please check your Client ID.", "warning");
      }
    } else {
      showToast("Google Services are loading. Please try again in a few seconds.", "info");
    }
  };

  // Open Add Address Modal
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setFormName(user?.name || "");
    setFormPhone(user?.phone ? user.phone.replace("+91", "").trim() : "");
    setFormType("home");
    setFormAddressLine("");
    setFormCity("");
    setFormState("");
    setFormPincode("");
    setFormIsDefault(addresses.length === 0);
    setIsAddressModalOpen(true);
  };

  // Open Edit Address Modal
  const handleOpenEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setFormName(addr.name || user?.name || "");
    setFormPhone(addr.phone ? addr.phone.replace("+91", "").trim() : "");
    setFormType(addr.type || "home");
    setFormAddressLine(addr.addressLine || "");
    setFormCity(addr.city || "");
    setFormState(addr.state || "");
    setFormPincode(addr.pincode || "");
    setFormIsDefault(addr.isDefault);
    setIsAddressModalOpen(true);
  };

  // Auto-fill City & State on typing 6 digit PIN
  const handleFormPincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setFormPincode(val);
    if (val.length === 6) {
      const pin = parseInt(val, 10);
      if (pin >= 110000 && pin <= 119999) {
        if (!formCity) setFormCity("New Delhi");
        if (!formState) setFormState("Delhi");
      } else if (pin >= 400000 && pin <= 400099) {
        if (!formCity) setFormCity("Mumbai");
        if (!formState) setFormState("Maharashtra");
      } else if (pin >= 560000 && pin <= 560099) {
        if (!formCity) setFormCity("Bengaluru");
        if (!formState) setFormState("Karnataka");
      } else if (pin >= 700000 && pin <= 700099) {
        if (!formCity) setFormCity("Kolkata");
        if (!formState) setFormState("West Bengal");
      } else if (pin >= 600000 && pin <= 600099) {
        if (!formCity) setFormCity("Chennai");
        if (!formState) setFormState("Tamil Nadu");
      } else if (pin >= 500000 && pin <= 500099) {
        if (!formCity) setFormCity("Hyderabad");
        if (!formState) setFormState("Telangana");
      } else if (pin >= 380000 && pin <= 380099) {
        if (!formCity) setFormCity("Ahmedabad");
        if (!formState) setFormState("Gujarat");
      } else if (pin >= 302000 && pin <= 302099) {
        if (!formCity) setFormCity("Jaipur");
        if (!formState) setFormState("Rajasthan");
      }
    }
  };

  // Submit Address Form (Add or Edit)
  const handleSaveAddressForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Please enter recipient name", "warning");
      return;
    }
    if (!formPhone || formPhone.length < 10) {
      showToast("Please enter a valid 10-digit mobile number", "warning");
      return;
    }
    if (!formAddressLine.trim()) {
      showToast("Please enter flat, building & street details", "warning");
      return;
    }
    if (!formCity.trim() || !formState.trim()) {
      showToast("Please enter city and state", "warning");
      return;
    }
    if (!formPincode || formPincode.length !== 6) {
      showToast("Please enter a valid 6-digit PIN code", "warning");
      return;
    }

    const isDefault = formIsDefault || addresses.length === 0;
    let updatedList: SavedAddress[] = [];

    if (editingAddressId) {
      // Update existing
      updatedList = addresses.map((item) => {
        if (item.id === editingAddressId) {
          return {
            ...item,
            name: formName.trim(),
            phone: formPhone.trim(),
            type: formType,
            addressLine: formAddressLine.trim(),
            city: formCity.trim(),
            state: formState.trim(),
            pincode: formPincode.trim(),
            isDefault: isDefault ? true : item.isDefault,
          };
        }
        return isDefault ? { ...item, isDefault: false } : item;
      });
      showToast("Address updated successfully! ✅");
    } else {
      // Add new
      const newAddr: SavedAddress = {
        id: `addr_${Date.now()}`,
        name: formName.trim(),
        phone: formPhone.trim(),
        type: formType,
        addressLine: formAddressLine.trim(),
        city: formCity.trim(),
        state: formState.trim(),
        pincode: formPincode.trim(),
        isDefault,
      };
      if (isDefault) {
        updatedList = [newAddr, ...addresses.map((a) => ({ ...a, isDefault: false }))];
      } else {
        updatedList = [...addresses, newAddr];
      }
      showToast("New address added successfully! 🎉");
    }

    setAddresses(updatedList);
    if (user?.email) {
      try {
        localStorage.setItem(`km_addresses_${user.email}`, JSON.stringify(updatedList));
      } catch {}
    }

    const defaultAddr = updatedList.find((a) => a.isDefault) || updatedList[0];
    if (defaultAddr) {
      updateUserProfile({
        savedAddresses: updatedList,
        address: {
          addressLine: defaultAddr.addressLine,
          city: defaultAddr.city,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode,
        },
      });
    } else {
      updateUserProfile({ savedAddresses: updatedList });
    }

    setIsAddressModalOpen(false);
  };

  // Set Address as Default
  const handleSetDefaultAddress = (addrId: string) => {
    const updatedList = addresses.map((a) => ({
      ...a,
      isDefault: a.id === addrId,
    }));
    setAddresses(updatedList);
    if (user?.email) {
      try {
        localStorage.setItem(`km_addresses_${user.email}`, JSON.stringify(updatedList));
      } catch {}
    }
    const newDefault = updatedList.find((a) => a.id === addrId);
    if (newDefault) {
      updateUserProfile({
        savedAddresses: updatedList,
        address: {
          addressLine: newDefault.addressLine,
          city: newDefault.city,
          state: newDefault.state,
          pincode: newDefault.pincode,
        },
      });
      showToast(`Set "${newDefault.name}" as default delivery address`);
    }
  };

  // Delete Address
  const handleDeleteAddress = (addrId: string) => {
    if (addresses.length <= 1) {
      showToast("You need to keep at least one delivery address", "warning");
      return;
    }
    const target = addresses.find((a) => a.id === addrId);
    const remaining = addresses.filter((a) => a.id !== addrId);
    let updatedList = remaining;
    if (target?.isDefault && remaining.length > 0) {
      updatedList = remaining.map((a, idx) => ({ ...a, isDefault: idx === 0 }));
    }
    setAddresses(updatedList);
    if (user?.email) {
      try {
        localStorage.setItem(`km_addresses_${user.email}`, JSON.stringify(updatedList));
      } catch {}
    }
    const newDefault = updatedList.find((a) => a.isDefault) || updatedList[0];
    if (newDefault) {
      updateUserProfile({
        savedAddresses: updatedList,
        address: {
          addressLine: newDefault.addressLine,
          city: newDefault.city,
          state: newDefault.state,
          pincode: newDefault.pincode,
        },
      });
    }
    showToast("Address deleted");
  };

  // Handle Save Profile Settings
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
    });
  };

  // Handle Direct Password Reset
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      showToast("Please enter a valid registered email address", "warning");
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      showToast("New password must be at least 6 characters", "warning");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, newPassword: forgotNewPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || "Could not reset password", "warning");
        setForgotLoading(false);
        return;
      }

      setForgotSubmitted(true);
      showToast("Password reset successfully! You can now log in.", "success");
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotSubmitted(false);
        setForgotEmail("");
        setForgotNewPassword("");
        setForgotLoading(false);
      }, 2500);
    } catch {
      showToast("Network error. Please try again.", "warning");
      setForgotLoading(false);
    }
  };

  // ==========================================
  // VIEW: AUTHENTICATED (ACCOUNT DASHBOARD)
  // ==========================================
  if (user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-8 sm:py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#584237]/70 font-medium">
            <Link href="/" className="hover:text-[#f97316] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#0b1c30] font-semibold">My Account</span>
          </nav>

          {/* User Hero Banner Card */}
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-orange-100/60 to-transparent pointer-events-none -mr-20 -mt-20 rounded-full blur-2xl" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-[#f97316] text-white flex items-center justify-center shrink-0 shadow-md font-space font-bold text-2xl sm:text-3xl border-2 border-white/60">
                  <span>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                  {user.provider === "google" && (
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white p-0.5 shadow-xs border border-slate-200 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold font-sans text-[#0b1c30]">
                      {user.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <CheckCircle size={13} weight="Filled" />
                      <span>{user.provider === "google" ? "Google Verified" : "Verified Customer"}</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#584237]/80 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>{user.email}</span>
                    {user.phone && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span>{user.phone}</span>
                      </>
                    )}
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-mono">Member since {user.joinedDate}</span>
                  </p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                id="sign-out-btn"
                type="button"
                onClick={() => {
                  logout();
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-medium text-xs sm:text-sm transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <Logout size={16} weight="Outline" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#f1f5f9]">
              <div className="bg-[#f8fafc] p-3.5 rounded-2xl border border-[#e2e8f0]/80">
                <span className="text-[11px] text-[#584237]/70 font-medium block">Total Orders</span>
                <span className="text-lg sm:text-xl font-bold font-space text-[#0b1c30]">
                  {pastOrders.length}
                </span>
              </div>

              <Link
                href="/shop?filter=wishlist"
                className="bg-[#f8fafc] hover:bg-rose-50/50 p-3.5 rounded-2xl border border-[#e2e8f0]/80 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#584237]/70 font-medium block">Wishlist</span>
                  <Heart size={14} weight="Filled" className="text-rose-500" />
                </div>
                <span className="text-lg sm:text-xl font-bold font-space text-[#0b1c30] group-hover:text-rose-600 transition-colors">
                  {wishlist.length} items
                </span>
              </Link>

              <Link
                href="/cart"
                className="bg-[#f8fafc] hover:bg-orange-50/50 p-3.5 rounded-2xl border border-[#e2e8f0]/80 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#584237]/70 font-medium block">Active Cart</span>
                  <ShoppingBag size={14} weight="Filled" className="text-[#f97316]" />
                </div>
                <span className="text-lg sm:text-xl font-bold font-space text-[#0b1c30] group-hover:text-[#f97316] transition-colors">
                  {cartCount} items
                </span>
              </Link>

              <div className="bg-[#f8fafc] p-3.5 rounded-2xl border border-[#e2e8f0]/80">
                <span className="text-[11px] text-[#584237]/70 font-medium block">Kharido Club</span>
                <span className="text-lg sm:text-xl font-bold font-space text-amber-600">
                  250 Coins 🪙
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-[#0b1c30] text-white shadow-xs font-semibold"
                  : "text-[#584237] hover:bg-white hover:text-[#0b1c30]"
              }`}
            >
              <TruckFast size={16} weight={activeTab === "orders" ? "Filled" : "Outline"} />
              <span>Orders & Deliveries ({pastOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "addresses"
                  ? "bg-[#0b1c30] text-white shadow-xs font-semibold"
                  : "text-[#584237] hover:bg-white hover:text-[#0b1c30]"
              }`}
            >
              <Location size={16} weight={activeTab === "addresses" ? "Filled" : "Outline"} />
              <span>Saved Delivery Address</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "settings"
                  ? "bg-[#0b1c30] text-white shadow-xs font-semibold"
                  : "text-[#584237] hover:bg-white hover:text-[#0b1c30]"
              }`}
            >
              <User size={16} weight={activeTab === "settings" ? "Filled" : "Outline"} />
              <span>Account Settings & Preferences</span>
            </button>
          </div>

          {/* TAB 1: RECENT ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {pastOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#e2e8f0] p-10 text-center space-y-4 shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#f97316] flex items-center justify-center mx-auto">
                    <ShoppingBag size={28} weight="Filled" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-[#0b1c30]">No Orders Yet</h2>
                    <p className="text-xs sm:text-sm text-[#584237]/70 max-w-sm mx-auto">
                      Explore our hand-picked collection of smart gadgets, mom & baby essentials, and trending clever finds!
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs sm:text-sm font-semibold rounded-full transition-all shadow-xs"
                  >
                    <span>Start Shopping</span>
                    <ArrowRight size={14} weight="Outline" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastOrders.map((order, idx) => (
                    <div
                      key={order.orderId || idx}
                      className="bg-white rounded-3xl border border-[#e2e8f0] p-5 sm:p-6 shadow-xs space-y-4 hover:border-orange-200 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f1f5f9]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-space text-[#0b1c30]">
                              Order #{order.orderId}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                              Order Confirmed & Processing
                            </span>
                          </div>
                          <span className="text-xs text-[#584237]/70 font-mono">
                            Placed on {order.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm sm:text-base font-bold font-space text-[#0b1c30]">
                            ₹{order.grandTotal?.toLocaleString("en-IN") || order.total?.toLocaleString("en-IN")}
                          </span>
                          <Link
                            href={`/track-order?id=${order.orderId}`}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-orange-50 text-[#f97316] hover:bg-[#f97316] hover:text-white text-xs font-semibold transition-all"
                          >
                            <TruckFast size={14} weight="Filled" />
                            <span>Track Order</span>
                          </Link>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="divide-y divide-[#f1f5f9]">
                        {order.items?.map((item: any, iIdx: number) => (
                          <div key={iIdx} className="py-2.5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                {item.product?.image ? (
                                  <Image
                                    src={item.product.image}
                                    alt={item.product.title || "Product"}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <ShoppingBag size={18} weight="Outline" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-xs sm:text-sm font-semibold text-[#0b1c30] line-clamp-1">
                                  {item.product?.title || item.product?.shortTitle || "Product Item"}
                                </h3>
                                <span className="text-xs text-[#584237]/70">
                                  Qty: {item.quantity} × ₹{item.product?.price}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold font-space text-[#0b1c30] shrink-0">
                              ₹{(item.product?.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address Snapshot */}
                      {order.customer && (
                        <div className="p-3 bg-[#f8fafc] rounded-xl text-xs text-[#584237]/80 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Location size={14} weight="Outline" className="text-[#f97316]" />
                            <span>
                              Delivering to: <strong className="text-[#0b1c30]">{order.customer.fullName}</strong>, {order.customer.city}, {order.customer.state} ({order.customer.pincode})
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                            Est. Express Delivery in 2-4 days
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              {/* Header bar with "+ Add Another Address" button */}
              <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-[#0b1c30]">Saved Delivery Addresses</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#ea580c] text-xs font-bold font-mono">
                      {addresses.length} {addresses.length === 1 ? "Address" : "Addresses"}
                    </span>
                  </div>
                  <p className="text-xs text-[#584237]/70 mt-1">
                    Manage delivery locations. Your default address is automatically pre-selected during checkout.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer shrink-0"
                >
                  <Add size={18} weight="Outline" />
                  <span>Add Another Address</span>
                </button>
              </div>

              {/* Addresses Grid or Empty State */}
              {addresses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#e2e8f0] p-10 text-center space-y-4 shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-[#ea580c] flex items-center justify-center mx-auto">
                    <Location size={28} weight="Outline" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0b1c30]">No Saved Addresses Yet</h3>
                    <p className="text-xs text-[#584237]/70 max-w-sm mx-auto mt-1">
                      Add your home or office address to enable 1-tap checkout and speedy delivery updates.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Add size={16} weight="Outline" />
                    <span>Add Delivery Address</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-xs transition-all flex flex-col justify-between relative ${
                        addr.isDefault
                          ? "border-orange-300 ring-2 ring-orange-400/20 bg-orange-50/15"
                          : "border-[#e2e8f0] hover:border-slate-300"
                      }`}
                    >
                      {/* Top row: tag and default status badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          addr.type === "home"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : addr.type === "work"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}>
                          {addr.type === "home" ? "🏠 Home" : addr.type === "work" ? "🏢 Work" : "📍 Other"}
                        </span>

                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            <CheckCircle size={12} weight="Filled" />
                            <span>Default Address</span>
                          </span>
                        )}
                      </div>

                      {/* Address Details */}
                      <div className="space-y-1.5 flex-1">
                        <h3 className="text-sm font-bold text-[#0b1c30]">{addr.name}</h3>
                        <p className="text-xs text-[#584237]/85 leading-relaxed">
                          {addr.addressLine}
                        </p>
                        <p className="text-xs text-[#0b1c30] font-semibold">
                          {addr.city}, {addr.state} - <span className="font-mono text-[#ea580c]">{addr.pincode}</span>
                        </p>
                        {addr.phone && (
                          <p className="text-xs text-[#584237]/75 font-mono pt-1">
                            📞 +91 {addr.phone.replace("+91", "").trim()}
                          </p>
                        )}
                      </div>

                      {/* Bottom Actions Row */}
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 text-[#0b1c30] hover:text-[#ea580c] text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
                          >
                            <Edit size={14} weight="Outline" />
                            <span>Edit</span>
                          </button>

                          {addresses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
                              title="Delete this address"
                            >
                              <Trash size={14} weight="Outline" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          )}
                        </div>

                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-xs font-bold text-[#f97316] hover:text-[#ea580c] hover:underline cursor-pointer"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#0b1c30]">Profile & Notifications</h2>
                <p className="text-xs text-[#584237]/70">
                  Manage your personal information and dispatch notification channels.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm focus:border-[#f97316] focus:outline-none bg-[#f8fafc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Account email is managed securely via {user.provider === "google" ? "Google OAuth" : "primary login credentials"}.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                    Phone Number (for SMS & WhatsApp Tracking)
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm focus:border-[#f97316] focus:outline-none bg-[#f8fafc]"
                  />
                </div>

                {/* Notifications Preferences */}
                <div className="pt-2 space-y-3">
                  <span className="block text-xs font-bold text-[#0b1c30]">
                    Order Notification Preferences
                  </span>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappUpdates}
                      onChange={(e) => setWhatsappUpdates(e.target.checked)}
                      className="w-4 h-4 text-[#f97316] rounded border-[#e2e8f0] focus:ring-[#f97316]"
                    />
                    <span className="text-xs text-[#0b1c30]">
                      Receive automated WhatsApp live tracking updates when out for delivery
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailInvoices}
                      onChange={(e) => setEmailInvoices(e.target.checked)}
                      className="w-4 h-4 text-[#f97316] rounded border-[#e2e8f0] focus:ring-[#f97316]"
                    />
                    <span className="text-xs text-[#0b1c30]">
                      Send digital order invoices and dispatch confirmation to my email
                    </span>
                  </label>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Address Modal (Add / Edit) */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-[#e2e8f0] animate-in fade-in zoom-in-95 duration-200 my-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-[#ea580c] flex items-center justify-center shrink-0">
                    <Location size={20} weight="Filled" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#0b1c30]">
                      {editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}
                    </h2>
                    <p className="text-xs text-[#584237]/70">
                      {editingAddressId ? "Update your saved location details" : "Add a new destination for fast ordering"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer transition-colors"
                >
                  <CloseCircle size={20} weight="Outline" />
                </button>
              </div>

              <form onSubmit={handleSaveAddressForm} className="space-y-4">
                {/* Recipient Name and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm focus:border-[#f97316] focus:outline-none bg-[#f8fafc]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-[#e2e8f0] bg-[#f8fafc] overflow-hidden focus-within:border-[#f97316]">
                      <span className="px-3 text-xs font-bold text-slate-500 bg-slate-100/80 border-r border-slate-200 py-2.5">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="9876543210"
                        className="w-full px-3 py-2.5 text-xs sm:text-sm focus:outline-none bg-transparent font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Type Tag Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                    Address Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: "home", label: "🏠 Home", desc: "All-day delivery" },
                      { type: "work", label: "🏢 Work", desc: "10 AM - 6 PM" },
                      { type: "other", label: "📍 Other", desc: "Friends / Family" },
                    ].map((t) => (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() => setFormType(t.type as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          formType === t.type
                            ? "border-[#f97316] bg-orange-50/50 text-[#ea580c] font-bold shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 text-slate-600 font-medium"
                        }`}
                      >
                        <div className="text-xs font-bold">{t.label}</div>
                        <div className="text-[10px] text-[#584237]/60 mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Street / Flat address */}
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Flat, House no., Building, Street, Area <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formAddressLine}
                    onChange={(e) => setFormAddressLine(e.target.value)}
                    placeholder="e.g. Flat 302, Green Acres, 14th Main Road, Indiranagar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm focus:border-[#f97316] focus:outline-none bg-[#f8fafc] resize-none"
                  />
                </div>

                {/* PIN Code, City, State */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={formPincode}
                      onChange={handleFormPincodeChange}
                      placeholder="560038"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm focus:border-[#f97316] focus:outline-none bg-[#f8fafc] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                      City / District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="Bengaluru"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm focus:border-[#f97316] focus:outline-none bg-[#f8fafc]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      placeholder="Karnataka"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm focus:border-[#f97316] focus:outline-none bg-[#f8fafc]"
                    />
                  </div>
                </div>

                {/* Default toggle checkbox */}
                <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-[#f97316] focus:ring-[#f97316] border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs text-[#0b1c30] font-medium">
                    Make this my default delivery address
                  </span>
                </label>

                {/* Modal Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {editingAddressId ? "Save Changes" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: UNAUTHENTICATED (LOGIN / REGISTER)
  // ==========================================
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] pt-6 sm:pt-10 pb-16 flex items-start justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo & Back to Home */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group mb-2" aria-label="KharidoMart Home">
            <KharidoMartLogo className="h-9 sm:h-10 w-auto mx-auto group-hover:opacity-90 transition-opacity" />
          </Link>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
              {isCheckoutRedirect
                ? (authMode === "signin" ? "Sign In & Checkout" : "Create Account & Checkout")
                : (authMode === "signin" ? "Welcome Back" : "Create an Account")}
            </h1>
            <p className="text-xs sm:text-sm text-[#584237]/80 mt-1">
              {isCheckoutRedirect
                ? "Sign in or create an account to proceed directly to secure checkout"
                : (authMode === "signin"
                    ? "Sign in to manage your orders, deliveries, and saved items"
                    : "Join KharidoMart for faster checkout, order tracking & rewards")}
            </p>
          </div>
        </div>

        {/* Auth Main Card */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-8 shadow-sm space-y-6">

          {/* Checkout Guidance Alert */}
          {isCheckoutRedirect && (
            <div className="p-4 bg-orange-50 border border-orange-200/90 rounded-2xl flex items-start gap-3 text-xs text-[#0b1c30]">
              <div className="w-8 h-8 rounded-xl bg-[#f97316] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Lock size={16} weight="Filled" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#0b1c30] text-sm">Sign in to complete your checkout</p>
                <p className="text-[#584237]/80 text-xs leading-relaxed">
                  Log in with your existing account or create a new one below. We will immediately transfer your cart items directly into checkout!
                </p>
              </div>
            </div>
          )}

          {/* Toggle Tabs: Sign In / Create Account */}
          <div className="flex bg-[#f1f5f9] p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setAuthMode("signin")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === "signin"
                  ? "bg-white text-[#0b1c30] shadow-xs"
                  : "text-[#584237]/70 hover:text-[#0b1c30]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === "signup"
                  ? "bg-white text-[#0b1c30] shadow-xs"
                  : "text-[#584237]/70 hover:text-[#0b1c30]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* SIGN IN FORM */}
          {authMode === "signin" && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#584237]/60">
                    <Sms size={16} weight="Outline" />
                  </span>
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs sm:text-sm text-[#0b1c30] focus:border-[#f97316] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#0b1c30]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[11px] font-semibold text-[#f97316] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#584237]/60">
                    <Lock size={16} weight="Outline" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs sm:text-sm text-[#0b1c30] focus:border-[#f97316] focus:bg-white focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[11px] font-semibold text-[#584237]/70 hover:text-[#0b1c30] cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#584237]/80">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#f97316] rounded border-[#e2e8f0] focus:ring-[#f97316]"
                  />
                  <span>Remember me on this browser</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#f97316] hover:bg-[#ea580c] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isCheckoutRedirect ? "Sign In & Proceed to Checkout" : "Sign In to KharidoMart"}</span>
                    <ArrowRight size={16} weight="Outline" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {authMode === "signup" && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#584237]/60">
                    <User size={16} weight="Outline" />
                  </span>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Ananya Sen"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs sm:text-sm text-[#0b1c30] focus:border-[#f97316] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#584237]/60">
                    <Sms size={16} weight="Outline" />
                  </span>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs sm:text-sm text-[#0b1c30] focus:border-[#f97316] focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                  Mobile Number (for SMS Tracking & Delivery Updates)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-[#0b1c30]/70 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit number"
                    className="w-full pl-12 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs sm:text-sm text-[#0b1c30] focus:border-[#f97316] focus:bg-white focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                  Create Password
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#584237]/60">
                    <Lock size={16} weight="Outline" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-12 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs sm:text-sm text-[#0b1c30] focus:border-[#f97316] focus:bg-white focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[11px] font-semibold text-[#584237]/70 hover:text-[#0b1c30] cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <label className="flex items-start gap-2 cursor-pointer text-[#584237]/80">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#f97316] rounded border-[#e2e8f0] focus:ring-[#f97316]"
                  />
                  <span className="text-[11px] leading-relaxed">
                    I agree to KharidoMart&apos;s{" "}
                    <Link href="/policies/terms" className="text-[#f97316] underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/policies/privacy-policy" className="text-[#f97316] underline">
                      Privacy Policy
                    </Link>{" "}
                    in compliance with DPDPA 2023.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#f97316] hover:bg-[#ea580c] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isCheckoutRedirect ? "Create Account & Proceed to Checkout" : "Create My Account"}</span>
                    <ArrowRight size={16} weight="Outline" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Google Sign In */}
          <div className="pt-1">
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#f1f5f9]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[#584237]/60 font-medium">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-[#e2e8f0] rounded-2xl text-xs sm:text-sm font-semibold text-[#0b1c30] flex items-center justify-center gap-2.5 transition-all shadow-2xs active:scale-[0.99] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-orange-500/40 border-t-[#ea580c] rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              )}
              <span>{isGoogleLoading ? "Connecting to Google..." : (isCheckoutRedirect ? "Sign In with Google & Checkout" : "Continue with Google")}</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pt-2 border-t border-[#f1f5f9] flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#584237]/70">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck size={14} weight="Filled" className="text-emerald-600" />
              <span>256-Bit SSL Secured</span>
            </span>
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle size={14} weight="Filled" className="text-emerald-600" />
              <span>DPDPA 2023 Compliant</span>
            </span>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#584237]/80 hover:text-[#f97316] transition-colors"
          >
            <ArrowLeft size={14} weight="Outline" />
            <span>Return to KharidoMart Store</span>
          </Link>
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-[#e2e8f0] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0b1c30]">Reset Account Password</h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotSubmitted(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <CloseCircle size={20} weight="Outline" />
              </button>
            </div>

            <p className="text-xs text-[#584237]/80">
              Enter your registered email and choose a new password. Your password will be updated directly in your account.
            </p>

            {forgotSubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-medium space-y-1 text-center">
                <CheckCircle size={24} weight="Filled" className="text-emerald-600 mx-auto" />
                <p className="font-bold">Password Updated Successfully!</p>
                <p className="text-[11px] text-emerald-700">You can now sign in with your new password.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0b1c30] mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm focus:border-[#f97316] focus:outline-none bg-[#f8fafc]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#0b1c30] mb-1">
                    New Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm focus:border-[#f97316] focus:outline-none bg-[#f8fafc]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {forgotLoading ? "Updating Password..." : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Google Identity Services SDK Script */}
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />

      {/* Google OAuth Configuration Guide Modal */}
      {showGoogleSetupModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#e2e8f0] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-[#ea580c] flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} weight="Filled" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#0b1c30]">Google Sign-In Configuration Required</h2>
                  <p className="text-[11px] text-[#584237]/70">Connect with your Google Cloud project</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoogleSetupModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <CloseCircle size={20} weight="Outline" />
              </button>
            </div>

            <p className="text-xs text-[#584237] leading-relaxed">
              Real Google Sign-In requires your Google Cloud OAuth Client ID to securely connect Google accounts and prevent unauthorized mock logins.
            </p>

            <div className="bg-[#f8fafc] p-3.5 rounded-2xl border border-[#e2e8f0] space-y-2 text-xs">
              <p className="font-semibold text-[#0b1c30] text-[11px]">How to enable Google OAuth in 2 minutes:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[#584237]/90 text-[11px]">
                <li>Open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-[#ea580c] underline font-semibold">Google Cloud Console &rarr; Credentials</a>.</li>
                <li>Create an <strong>OAuth 2.0 Client ID</strong> (Web application).</li>
                <li>Add <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">http://localhost:3000</code> and your live domain to Authorized JavaScript origins.</li>
                <li>Add to your <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">.env</code> file:
                  <pre className="mt-1.5 p-2 bg-[#0b1c30] text-emerald-400 rounded-lg text-[10px] overflow-x-auto font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID=&quot;your-client-id.apps.googleusercontent.com&quot;</pre>
                </li>
              </ol>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowGoogleSetupModal(false)}
                className="w-full py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer text-center"
              >
                Sign In with Email &amp; Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-orange-500/20 border-t-[#ea580c] rounded-full animate-spin" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}

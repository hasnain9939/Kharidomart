/**
 * Shared Pincode and Delivery Calculation Utilities for Kharido Mart
 * Consolidates Indian PIN validation, local storage synchronization, and delivery estimation.
 */

export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export function isValidPincode(code: string | null | undefined): boolean {
  if (!code) return false;
  const clean = code.trim().replace(/\D/g, "");
  return clean.length === 6 && PINCODE_REGEX.test(clean);
}

export function getStoredPincode(): string {
  if (typeof window === "undefined") return "";
  try {
    const val = localStorage.getItem("km_user_pincode");
    return val && isValidPincode(val) ? val : "";
  } catch {
    return "";
  }
}

export function setStoredPincode(code: string): void {
  if (typeof window === "undefined") return;
  try {
    if (isValidPincode(code)) {
      localStorage.setItem("km_user_pincode", code.trim());
    }
  } catch {
    // Ignore storage quota or access errors
  }
}

export interface DeliveryEstimate {
  startDate: string;
  endDate: string;
  region: string;
  speed: "Same-Day Express" | "Express Air" | "Standard Surface";
}

export function getDeliveryEstimate(code?: string): DeliveryEstimate {
  const now = new Date();
  const cleanCode = (code || "").trim().replace(/\D/g, "");
  const prefix2 = cleanCode.substring(0, 2);

  // Metro Hubs (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Kolkata, Chennai) get 2-3 day delivery
  const isMetro = ["11", "12", "20", "40", "41", "56", "50", "70", "60"].includes(prefix2);

  const startDays = isMetro ? 2 : 3;
  const endDays = isMetro ? 3 : 5;

  const start = new Date(now);
  start.setDate(now.getDate() + startDays);

  const end = new Date(now);
  end.setDate(now.getDate() + endDays);

  const formatOpt: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };

  let regionName = "All India Serviceable Hub";
  if (["11", "12", "20"].includes(prefix2)) regionName = "Delhi NCR Hub";
  else if (["40", "41"].includes(prefix2)) regionName = "Mumbai / Pune Hub";
  else if (["56", "57"].includes(prefix2)) regionName = "Bengaluru Hub";
  else if (["50", "52"].includes(prefix2)) regionName = "Hyderabad Hub";
  else if (["60", "64"].includes(prefix2)) regionName = "Chennai Hub";
  else if (["70"].includes(prefix2)) regionName = "Kolkata Hub";

  return {
    startDate: start.toLocaleDateString("en-IN", formatOpt),
    endDate: end.toLocaleDateString("en-IN", formatOpt),
    region: regionName,
    speed: isMetro ? "Express Air" : "Standard Surface",
  };
}

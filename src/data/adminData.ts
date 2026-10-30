export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  destination: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  paymentMethod: "COD" | "UPI / Prepaid";
  courier: string;
  awb: string;
  status: "Pending Dispatch" | "In Transit" | "Delivered" | "RTO / Cancelled" | "Cancelled";
  createdAt: string;
  dispatchTime?: string;
  trackingStep: number;
  // Warehouse / Fulfillment Specific Fields
  supplierName?: "Shopify Warehouse" | "Shopify Central Warehouse" | string;
  supplierCost?: number; // COGS
  supplierStatus?: "Pushed to Supplier" | "Awaiting 1-Click Push" | "Supplier Dispatched" | "Pushed to Shopify";
  codVerification?: "WhatsApp OTP Confirmed" | "IVR Confirmed" | "Prepaid Verified" | "Awaiting Confirmation";
  estimatedNetProfit?: number;
}

export interface AdminSupplier {
  id: string;
  name: string;
  type: "Shopify Store API" | "Shopify Warehouse" | "Shopify Central Warehouse" | "Roposo Clout" | "CJ Dropshipping" | "IndiaDropship" | "Private Warehouse" | string;
  city: string;
  state: string;
  currentStock: number;
  capacityPercentage: number;
  dispatchesToday: number;
  status?: "Optimal" | "Degraded" | "Offline";
  courierPartners: string[];
  apiStatus: "Connected (Live)" | "Syncing" | "Needs Re-auth" | "Not Connected";
  avgDispatchTime: string;
  apiKey?: string;
  merchantId?: string;
  pendingOrders: number;
  walletBalance: number;
  portalUrl?: string;
  appUrl?: string;
  description?: string;
  autoFulfill?: boolean;
}

export const DEFAULT_DROPSHIP_SUPPLIERS: AdminSupplier[] = [
  {
    id: "shopify-central",
    name: "Shopify Central Warehouse",
    type: "Shopify Store API",
    city: "Okhla Node, New Delhi",
    state: "Delhi",
    currentStock: 120,
    capacityPercentage: 94,
    dispatchesToday: 5,
    status: "Optimal",
    courierPartners: ["BlueDart Express", "Delhivery Direct"],
    apiStatus: "Connected (Live)",
    avgDispatchTime: "Same Day (Before 3 PM)",
    pendingOrders: 0,
    walletBalance: 0,
    portalUrl: "https://admin.shopify.com",
    description: "Primary fulfillment hub connected directly to your Shopify store engine (cgxx12-ek.myshopify.com).",
    autoFulfill: true,
  },
  {
    id: "roposo-clout",
    name: "Roposo Clout Fulfillment",
    type: "Roposo Clout",
    city: "Gurugram Node",
    state: "Haryana",
    currentStock: 450,
    capacityPercentage: 88,
    dispatchesToday: 0,
    status: "Optimal",
    courierPartners: ["BlueDart Express", "Delhivery Direct", "Shadowfax"],
    apiStatus: "Connected (Live)",
    avgDispatchTime: "24–48 Hours",
    pendingOrders: 0,
    walletBalance: 0,
    portalUrl: "https://clout.roposo.com",
    appUrl: "https://apps.shopify.com/roposo-clout",
    description: "Leading Indian dropshipping network with automated COD WhatsApp OTP/IVR verification and fast domestic dispatches.",
    autoFulfill: true,
  },
  {
    id: "cj-dropshipping",
    name: "CJ Dropshipping India Express",
    type: "CJ Dropshipping",
    city: "Mumbai Air Cargo Node",
    state: "Maharashtra",
    currentStock: 320,
    capacityPercentage: 92,
    dispatchesToday: 0,
    status: "Optimal",
    courierPartners: ["BlueDart Air", "Delhivery Air"],
    apiStatus: "Not Connected",
    avgDispatchTime: "24–48 Hours",
    pendingOrders: 0,
    walletBalance: 0,
    portalUrl: "https://cjdropshipping.com",
    appUrl: "https://apps.shopify.com/cjdropshipping",
    description: "Global & domestic winning product sourcing with dedicated India fast air delivery and automated variant mapping.",
    autoFulfill: false,
  },
  {
    id: "indiadropship",
    name: "IndiaDropship Sourcing Hub",
    type: "IndiaDropship",
    city: "Surat & Bengaluru Nodes",
    state: "Karnataka",
    currentStock: 280,
    capacityPercentage: 85,
    dispatchesToday: 0,
    status: "Optimal",
    courierPartners: ["XpressBees", "BlueDart", "Ecom Express"],
    apiStatus: "Not Connected",
    avgDispatchTime: "24 Hours",
    pendingOrders: 0,
    walletBalance: 0,
    portalUrl: "https://indiadropship.com",
    description: "B2B direct factory dropshipping with verified Surat and South India warehouse hubs and local courier pickups.",
    autoFulfill: false,
  },
];

export interface AdminDiscount {
  id: string;
  code: string;
  type: "percentage" | "fixed_amount" | "free_shipping";
  value: number;
  minSpend: number;
  usageCount: number;
  usageLimit?: number;
  status: "Active" | "Scheduled" | "Expired";
  expiryDate: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  ordersCount: number;
  lifetimeValue: number;
  lastOrderDate: string;
  tier: "VIP Customer" | "Repeat Buyer" | "First-Time";
}

export interface AdminTeamMember {
  id: string;
  name: string;
  email: string;
  role: "Store Owner" | "Media Buyer (Meta/TikTok)" | "Customer Care & COD OTP" | "Fulfillment Agent";
  hubAccess: string;
  lastActive: string;
  status: "Active" | "Invited";
}

export const ADMIN_CUSTOMERS: AdminCustomer[] = [];

export const ADMIN_TEAM: AdminTeamMember[] = [
  {
    id: "team-1",
    name: "Store Administrator",
    email: "admin@kharidomart.com",
    role: "Store Owner",
    hubAccess: "Full Master Access",
    lastActive: "Active Now",
    status: "Active",
  },
];

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
  type: "Shopify Store API" | "Shopify Warehouse" | "Shopify Central Warehouse" | "Private Warehouse" | string;
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
}

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

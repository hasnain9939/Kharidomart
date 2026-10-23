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
  status: "Pending Dispatch" | "In Transit" | "Delivered" | "RTO / Cancelled";
  createdAt: string;
  dispatchTime?: string;
  trackingStep: number;
  // Dropshipping Specific Fields
  supplierName: "Roposo Clout" | "CJ Dropshipping" | "IndiaDropship" | "Shiprocket 3PL";
  supplierCost: number; // COGS
  supplierStatus: "Pushed to Supplier" | "Awaiting 1-Click Push" | "Supplier Dispatched";
  codVerification: "WhatsApp OTP Confirmed" | "IVR Confirmed" | "Prepaid Verified" | "Awaiting Confirmation";
  estimatedNetProfit: number;
}

export interface AdminSupplier {
  id: string;
  name: string;
  type: "Roposo Clout" | "CJ Dropshipping" | "IndiaDropship" | "Shiprocket 3PL" | "Private Agent";
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

export type AdminHub = AdminSupplier;

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

export interface DropshipWinningProduct {
  id: string;
  title: string;
  sku: string;
  supplier: string;
  supplierCost: number; // COGS
  sellingPrice: number;
  cpa: number; // Cost Per Acquisition / Ad Spend per order
  shippingFee: number;
  netProfit: number;
  marginPercent: number;
  roas: number;
  stage: "Scaling 🔥" | "Testing 🧪" | "Consistent Winner" | "Break-Even";
  dailyOrders: number;
}

export const ADMIN_METRICS = {
  todaySales: 0,
  yesterdaySales: 0,
  salesGrowth: 0,
  todayAdSpend: 0,
  todayNetProfit: 0,
  blendedROAS: 0,
  cpa: 0,
  totalOrders: 0,
  pendingOrders: 0,
  inTransitOrders: 0,
  deliveredToday: 0,
  avgOrderValue: 0,
  codRate: 0,
  codConfirmedRate: 0,
  rtoRate: 0,
  activeCoupons: 0,
  stockHealth: 100,
  storePlatform: "Next.js + Prisma Store Engine",
};

export const DROPSHIP_WINNING_PRODUCTS: DropshipWinningProduct[] = [];


export const ADMIN_ORDERS: AdminOrder[] = [];

export const DROPSHIP_SUPPLIERS: AdminSupplier[] = [
  {
    id: "sup-1",
    name: "Roposo Clout Fulfillment",
    type: "Roposo Clout",
    city: "Gurugram Node",
    state: "Haryana",
    currentStock: 0,
    capacityPercentage: 100,
    dispatchesToday: 0,
    status: "Optimal",
    courierPartners: ["BlueDart Express", "Delhivery Direct", "Shadowfax"],
    apiStatus: "Not Connected",
    avgDispatchTime: "24 Hours",
    pendingOrders: 0,
    walletBalance: 0,
  },
  {
    id: "sup-2",
    name: "CJ Dropshipping India Express",
    type: "CJ Dropshipping",
    city: "Mumbai Air Node",
    state: "Maharashtra",
    currentStock: 0,
    capacityPercentage: 100,
    dispatchesToday: 0,
    status: "Optimal",
    courierPartners: ["BlueDart Air", "Delhivery Air"],
    apiStatus: "Not Connected",
    avgDispatchTime: "24 Hours",
    pendingOrders: 0,
    walletBalance: 0,
  },
  {
    id: "sup-3",
    name: "IndiaDropship Sourcing Node",
    type: "IndiaDropship",
    city: "Surat / Bengaluru",
    state: "Karnataka",
    currentStock: 0,
    capacityPercentage: 100,
    dispatchesToday: 0,
    status: "Optimal",
    courierPartners: ["XpressBees", "BlueDart"],
    apiStatus: "Not Connected",
    avgDispatchTime: "24 Hours",
    pendingOrders: 0,
    walletBalance: 0,
  },
];

export const ADMIN_HUBS = DROPSHIP_SUPPLIERS;

export const ADMIN_DISCOUNTS: AdminDiscount[] = [
  {
    id: "disc-1",
    code: "FIRST10",
    type: "percentage",
    value: 10,
    minSpend: 499,
    usageCount: 0,
    status: "Active",
    expiryDate: "Dec 31, 2026",
  },
  {
    id: "disc-2",
    code: "PREPAID50",
    type: "fixed_amount",
    value: 50,
    minSpend: 299,
    usageCount: 0,
    status: "Active",
    expiryDate: "Ongoing",
  },
  {
    id: "disc-3",
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    minSpend: 499,
    usageCount: 0,
    status: "Active",
    expiryDate: "Dec 31, 2026",
  },
  {
    id: "disc-4",
    code: "MOMBABY20",
    type: "percentage",
    value: 20,
    minSpend: 999,
    usageCount: 0,
    status: "Active",
    expiryDate: "Nov 30, 2026",
  },
  {
    id: "disc-5",
    code: "WHATSAPP5",
    type: "percentage",
    value: 5,
    minSpend: 399,
    usageCount: 0,
    status: "Active",
    expiryDate: "Dec 31, 2026",
  },
  {
    id: "disc-6",
    code: "FLASH100",
    type: "fixed_amount",
    value: 100,
    minSpend: 1499,
    usageCount: 0,
    status: "Active",
    expiryDate: "Oct 31, 2026",
  },
];

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

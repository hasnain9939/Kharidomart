export interface PolicySection {
  title: string;
  paragraphs: string[];
}

export interface Policy {
  slug: string;
  title: string;
  lastUpdated: string;
  summary: string;
  sections: PolicySection[];
  content: string[]; // for backward compatibility
}

export const POLICIES: Record<string, Policy> = {
  "privacy-policy": {
    slug: "privacy-policy",
    title: "Privacy Policy",
    lastUpdated: "October 2026",
    summary:
      "This Privacy Policy outlines how Kharido Mart Direct collects, uses, processes, stores, and protects your personal data in accordance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act (DPDPA), 2023.",
    sections: [
      {
        title: "1. Scope and Applicability",
        paragraphs: [
          "This Privacy Policy applies to all users, visitors, and customers accessing or purchasing through our e-commerce platform kharidomart.com ('Website') and associated mobile-optimized interfaces operated by Kharido Mart Direct ('Kharido Mart', 'We', 'Us', or 'Our').",
          "By accessing our platform, browsing our product listings, or placing an order, you explicitly consent to the collection, storage, transfer, and processing of your personal information as set out in this Policy."
        ]
      },
      {
        title: "2. Information We Collect",
        paragraphs: [
          "Personal Identifiable Information (PII): When you place an order, create an inquiry, or subscribe to updates, we collect your full legal name, delivery shipping address, billing address, active mobile telephone number, and email address.",
          "Payment & Transactional Information: We facilitate payments through PCI-DSS Level 1 compliant licensed payment aggregators (e.g., Razorpay, Cashfree, PayU). We DO NOT collect, view, or store your credit/debit card numbers, CVV codes, UPI MPINs, or internet banking passwords on our servers.",
          "Technical & Device Information: When you browse our Website, we automatically record device IP addresses, browser types, operating systems, access timestamps, and referring URLs to prevent malicious traffic and optimize checkout performance.",
          "Cookies and Local Storage: We use essential session cookies and local storage tokens to retain your cart items, remember your recently viewed products, and support seamless multi-step checkout navigation."
        ]
      },
      {
        title: "3. Lawful Purpose of Data Processing",
        paragraphs: [
          "To process, confirm, pack, dispatch, and fulfill your orders.",
          "To transmit operational delivery status notifications, courier tracking links (AWB), and dispatch receipts via SMS, WhatsApp, and email.",
          "To facilitate doorstep Cash on Delivery (COD) verification and prevent fraud or fake order bookings.",
          "To provide timely customer assistance, process eligible replacement requests, and address product queries.",
          "To comply with applicable legal regulations and store order record mandates."
        ]
      },
      {
        title: "4. Data Sharing & Third-Party Logistics Disclosures",
        paragraphs: [
          "We strictly adhere to a zero-data-monetization policy: We NEVER sell, lease, rent, or trade your personal information to third-party advertisers or data brokers.",
          "Authorized Logistics Partners: Your name, contact number, and destination delivery address are shared solely with our integrated courier partners (including BlueDart Express, Delhivery Ltd., Shadowfax Technologies, and India Post) exclusively for fulfilling the physical delivery of your order.",
          "Regulatory & Statutory Authorities: We may disclose personal records if formally subpoenaed or required by law enforcement authorities under lawful process as per the Information Technology Act, 2000."
        ]
      },
      {
        title: "5. Data Security & Storage Architecture",
        paragraphs: [
          "All communications between your web browser and our servers are encrypted using modern 256-bit Secure Sockets Layer (SSL/TLS) encryption protocol.",
          "Access to customer delivery data is strictly restricted on a need-to-know basis to authorized fulfillment center staff bound by non-disclosure and privacy obligations."
        ]
      },
      {
        title: "6. User Rights & Data Requests",
        paragraphs: [
          "Right to Access & Rectify: You have the right to request a summary of personal information held by us and request correction of inaccurate delivery records.",
          "Right to Withdraw Consent & Erasure: You may request deletion of your personal records, subject to retention required for order fulfillment and dispute resolution.",
          "To exercise these rights, submit a request through our Contact page."
        ]
      }
    ],
    content: [
      "At Kharido Mart, we respect your privacy and are committed to protecting your personal data in full compliance with applicable Indian data protection principles.",
      "When you purchase from our store, we collect personal information you provide such as your name, shipping address, email address, and phone number exclusively to fulfill and deliver your orders safely.",
      "We never sell, rent, or trade your personal information to third parties. We use industry-standard 256-bit SSL encryption to ensure your checkout details and payment information are completely secure."
    ]
  },

  "refund-policy": {
    slug: "refund-policy",
    title: "Replacement Policy (Strictly No Returns & No Refunds)",
    lastUpdated: "October 2026",
    summary:
      "Kharido Mart operates under a strict REPLACEMENT-ONLY POLICY. We do NOT offer monetary refunds or product returns under any circumstances. Free doorstep replacements are provided exclusively for products that arrive physically damaged, defective, or incorrect, provided the claim is submitted within 24 hours of delivery with a mandatory, continuous product unboxing video.",
    sections: [
      {
        title: "1. Strict No-Refund & No-Return Policy",
        paragraphs: [
          "All sales and orders placed on Kharido Mart are final and non-refundable.",
          "We do NOT provide cash, UPI, bank transfer, card, or store credit refunds for any purchases, whether paid via online prepaid methods or Cash on Delivery (COD).",
          "Returns for monetary refunds, exchanges for other products, or returns citing buyer's remorse, change of mind, perceived expectation differences, or accidental ordering are strictly NOT accepted.",
          "Kharido Mart exclusively offers identical product replacements when eligible items satisfy the strict damage or defect criteria outlined in this policy."
        ]
      },
      {
        title: "2. Mandatory 24-Hour Reporting Window",
        paragraphs: [
          "Any request for product replacement MUST be officially submitted within exactly 24 hours of delivery.",
          "The 24-hour window commences from the exact delivery timestamp recorded by our logistics partner's delivery tracking system (BlueDart, Delhivery, XpressBees, or Shadowfax).",
          "Important: Claims submitted after the 24-hour delivery window will be automatically rejected without exception, as courier insurance coverage expires 24 hours post-delivery."
        ]
      },
      {
        title: "3. Mandatory Uncut Product Unboxing Video Requirement",
        paragraphs: [
          "To be eligible for a replacement, a continuous, uncut, single-take video recording of the unboxing is 100% MANDATORY.",
          "The unboxing video must strictly meet the following conditions:",
          "a) The video must begin BEFORE opening the parcel, clearly displaying the intact outer courier bag/box and the shipping label containing your Name, Address, and Tracking AWB number in clear focus.",
          "b) The unsealing and opening of the parcel must be recorded in one continuous shot without any pauses, cuts, stops, fast-forwarding, or video edits.",
          "c) The product and all accessories must be removed and inspected on camera in the same uninterrupted clip, clearly demonstrating the physical damage, missing component, or functional defect.",
          "Claims submitted without a valid unboxing video, or with videos recorded after the package has already been opened, will be summarily declined."
        ]
      },
      {
        title: "4. Eligible Conditions for Free Replacement",
        paragraphs: [
          "A free doorstep replacement will be approved only under the following verified conditions:",
          "a) Physical In-Transit Damage: The outer item arrived crushed, broken, shattered, or visibly compromised during transit.",
          "b) Dead on Arrival (DOA) / Manufacturing Malfunction: Electrical components, motors, batteries, or mechanisms fail to operate upon initial unboxing.",
          "c) Wrong Product Delivered: The received item or model is entirely different from the product ordered.",
          "d) Missing Essential Parts: Factory-sealed box is missing core components, power cables, or attachments specified in the package contents."
        ]
      },
      {
        title: "5. How to Submit a 24-Hour Replacement Request",
        paragraphs: [
          "Step 1: Immediately upon receiving the delivery, record your uncut unboxing video showing the outer shipping label.",
          "Step 2: Within 24 hours of delivery, contact our official support team via WhatsApp (+91 99394 85740) or through our Contact page (kharidomart.com/contact).",
          "Step 3: Provide your Order ID, registered phone number, a clear photo of the courier shipping label, and the continuous unboxing video.",
          "Step 4: Our quality assurance team will inspect the footage within 12 to 24 business hours.",
          "Step 5: Upon validation, an identical brand-new replacement unit will be dispatched to your address with priority express shipping at zero cost to you."
        ]
      },
      {
        title: "6. Non-Eligible Items & Claim Rejection Criteria",
        paragraphs: [
          "Requests will be declined under the following circumstances:",
          "• Claims submitted after 24 hours from the courier's confirmed delivery timestamp.",
          "• Inability to provide an uncut, continuous unboxing video showing the sealed parcel and shipping label.",
          "• Normal wear and tear, cosmetic marks from regular use, liquid damage (unless device is IPX-rated), or physical damage resulting from customer dropping, mishandling, or improper assembly.",
          "• Opened or used personal hygiene, grooming, or infant feeding accessories due to strict sanitary and child-safety protocols.",
          "• Items returned incomplete without the original brand box, packaging materials, manuals, and bundled attachments."
        ]
      }
    ],
    content: [
      "Kharido Mart operates under a strict Replacement-Only Policy. We do NOT provide returns or cash/UPI refunds under any circumstances.",
      "If your order arrives damaged, defective, or incorrect, you must report it within 24 hours of delivery with a mandatory, uncut unboxing video.",
      "Upon review and verification of the unboxing video, we dispatch an identical brand-new replacement unit to your doorstep at zero cost."
    ]
  },

  "terms-of-service": {
    slug: "terms-of-service",
    title: "Terms of Service",
    lastUpdated: "October 2026",
    summary:
      "These Terms of Service constitute a legally binding electronic agreement between you ('Customer', 'User') and Kharido Mart Direct ('Kharido Mart') governing your usage of kharidomart.com.",
    sections: [
      {
        title: "1. Acceptance of Terms",
        paragraphs: [
          "By accessing, browsing, registering, or transacting on kharidomart.com, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service along with our Privacy Policy and Shipping Policy.",
          "If you do not agree with any provision of these Terms, you must discontinue your use of the website."
        ]
      },
      {
        title: "2. Eligibility & Account Integrity",
        paragraphs: [
          "Use of the website is available only to persons who can form legally binding contracts under the Indian Contract Act, 1872 (persons who are 18 years of age or older). Minors may access the website only under the supervision of a parent or legal guardian.",
          "You are responsible for maintaining the confidentiality of your account information and for restricting access to your personal devices to prevent unauthorized transactions."
        ]
      },
      {
        title: "3. Product Descriptions, Pricing & Order Invoicing",
        paragraphs: [
          "We strive for maximum accuracy in product specifications, dimensions, features, and photographic depictions. However, minor color variations may occur due to individual digital screen calibrations.",
          "All product prices listed on the website are displayed in Indian National Rupees (INR) and are inclusive of all applicable taxes.",
          "In the event of a technical typographical error in price or inventory, Kharido Mart reserves the right to notify the customer and cancel the unfulfilled order with a 100% full refund."
        ]
      },
      {
        title: "4. Contract Formation & Order Acceptance",
        paragraphs: [
          "Placing an order on the Website constitutes an offer to purchase. Order confirmation is generated upon successful payment gateway authorization or upon completing Cash on Delivery (COD) verification.",
          "Kharido Mart reserves the right to decline or cancel orders with unserviceable delivery pincodes, suspected bulk reseller purchases violating consumer order limits, or orders suspected of fraudulent intent."
        ]
      },
      {
        title: "5. Intellectual Property Rights",
        paragraphs: [
          "All intellectual property, including but not limited to the brand name 'Kharido Mart', the Kharido Mart shopping cart logo, graphic iconography, website design, product descriptions, banners, and layout structures, are the exclusive property of Kharido Mart Direct.",
          "Unauthorized reproduction, copying, distribution, scraping, or commercial exploitation of any site content is strictly prohibited under the Copyright Act, 1957 and the Trade Marks Act, 1999."
        ]
      },
      {
        title: "6. Limitation of Liability & Warranties",
        paragraphs: [
          "Products sold on Kharido Mart are intended for lawful consumer use. To the maximum extent permitted by applicable Indian law, Kharido Mart's total cumulative liability for any claim arising from a product shall not exceed the invoice price actually paid by the customer for that product.",
          "Warranty claims for electronic products are serviced directly according to the product warranty card terms included inside the packaging."
        ]
      },
      {
        title: "7. Governing Law & Dispute Jurisdiction",
        paragraphs: [
          "These Terms shall be interpreted, construed, and enforced exclusively in accordance with the laws of the Republic of India.",
          "Any dispute, claim, or controversy arising out of or relating to your use of the platform shall be subject to the exclusive jurisdiction of the competent courts situated in New Delhi, India."
        ]
      }
    ],
    content: [
      "By accessing and shopping at kharidomart.com, you agree to be bound by these Terms of Service.",
      "All product descriptions, pricing, and availability are subject to change without prior notice. We strive to provide the most accurate product representations and specifications possible.",
      "Orders placed on Kharido Mart are confirmed upon successful checkout verification or Cash on Delivery (COD) confirmation.",
      "All transactions conducted through kharidomart.com are governed by the laws of India and subject to the jurisdiction of the courts of New Delhi."
    ]
  },

  "shipping-policy": {
    slug: "shipping-policy",
    title: "Shipping & Delivery Policy",
    lastUpdated: "October 2026",
    summary:
      "Kharido Mart operates a dedicated fulfillment network delivering safely to over 26,000+ postal pin codes across India with verified tracking on every order.",
    sections: [
      {
        title: "1. Serviceable Pincodes & Nationwide Reach",
        paragraphs: [
          "We deliver across all 28 states and 8 union territories in India, covering major metro centers, Tier 2, Tier 3 cities, and regional postal zones.",
          "To verify if your specific location is serviceable for express delivery and Cash on Delivery, you can enter your 6-digit postal code on any product page or during checkout."
        ]
      },
      {
        title: "2. Order Processing & Dispatch Timelines",
        paragraphs: [
          "All confirmed orders placed before 3:00 PM IST on business days are processed, quality-checked, and packed on the same day.",
          "Standard warehouse dispatch takes place within 24 to 48 business hours (excluding Sundays and gazetted national holidays).",
          "Upon dispatch, you will immediately receive an automated SMS and WhatsApp update containing your carrier name and live Airway Bill (AWB) tracking link."
        ]
      },
      {
        title: "3. Delivery Transit Time Estimates",
        paragraphs: [
          "Metro Cities (Delhi NCR, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata, Pune): 2 to 4 business days.",
          "Rest of India (Tier 2 & Tier 3 Cities): 3 to 6 business days.",
          "Remote, Hill Stations & North-Eastern States: 5 to 8 business days.",
          "Please note that natural disruptions, heavy monsoon conditions, or regional holidays may occasionally affect carrier transit schedules."
        ]
      },
      {
        title: "4. Shipping Charges & Free Delivery Threshold",
        paragraphs: [
          "FREE Standard Express Shipping is provided on all prepaid orders (UPI, Card, NetBanking) regardless of cart value.",
          "FREE Shipping applies on all orders totaling ₹499 or higher.",
          "For orders below ₹499 opting for Cash on Delivery, a nominal handling and shipping fee of ₹50 is applied at checkout to offset carrier cash-collection tariffs.",
          "Priority Express Air Dispatch is optionally available for ₹99 for customers requiring fast-tracked priority handling."
        ]
      },
      {
        title: "5. Courier Partners & Real-time Live Tracking",
        paragraphs: [
          "We partner exclusively with tier-1 logistics providers including BlueDart Express, Delhivery Ltd., Shadowfax Technologies, and India Post Speed Post.",
          "You can track your parcel anytime on our dedicated tracking portal at kharidomart.com/track-order or via the courier tracking link sent to your phone."
        ]
      },
      {
        title: "6. Package Receipt & Damaged Parcels",
        paragraphs: [
          "All Kharido Mart packages are sealed with tamper-evident security tape. If you observe that the outer parcel is torn, opened, or tampered with, please REFUSE to accept delivery from the delivery agent and notify us immediately.",
          "In case of any missing item or inner transit damage, contact us within 24 hours of delivery through our Contact page with photographs of the package."
        ]
      }
    ],
    content: [
      "Kharido Mart delivers across all serviceable pincodes throughout India via trusted courier partners including BlueDart, Delhivery, Shadowfax, and India Post.",
      "Orders are dispatched within 24 to 48 hours from our fulfillment center.",
      "Standard delivery typically takes 2 to 5 business days depending on your delivery location and pincode.",
      "Enjoy FREE Express Shipping on all prepaid orders or orders above ₹499! A nominal shipping charge of ₹50 applies on smaller COD orders."
    ]
  },

  "contact-information": {
    slug: "contact-information",
    title: "Customer Support & Contact Help",
    lastUpdated: "October 2026",
    summary:
      "Our customer support team is dedicated to providing prompt assistance for orders, delivery tracking, and doorstep replacements.",
    sections: [
      {
        title: "1. Dedicated Customer Support Channels",
        paragraphs: [
          "Online Support Desk: Submit your inquiry anytime via our Contact page for priority assistance.",
          "Live Order Tracking: Track your shipment in real time at kharidomart.com/track-order.",
          "Response Time: Our team typically responds to all customer inquiries within 12 to 24 business hours.",
          "Operational Hours: Monday to Saturday, 10:00 AM to 6:00 PM IST (Excluding National Holidays)."
        ]
      },
      {
        title: "2. Order Tracking & Delivery Inquiries",
        paragraphs: [
          "Every order placed on Kharido Mart receives an automated SMS and WhatsApp dispatch alert containing your courier tracking number.",
          "You can enter your Order ID directly on our Track Order page to check real-time courier updates from dispatch to doorstep delivery."
        ]
      },
      {
        title: "3. Replacement Support (No Returns / No Refunds)",
        paragraphs: [
          "If your order arrived damaged, defective, or incomplete, submit a claim through our Contact page or WhatsApp within 24 hours of delivery along with your mandatory, uncut unboxing video.",
          "We offer a 24-Hour Doorstep Replacement Guarantee on all eligible products."
        ]
      }
    ],
    content: [
      "Have questions, feedback, or need help with your order? Our customer support team is here for you!",
      "Submit an inquiry anytime through our online Contact form or track your parcel directly on our Track Order page."
    ]
  },

  "legal-notice": {
    slug: "legal-notice",
    title: "Store Disclaimer & Terms of Use",
    lastUpdated: "October 2026",
    summary:
      "Important store information, general usage terms, and buyer protections for shopping on Kharido Mart.",
    sections: [
      {
        title: "1. Online Storefront & Platform Operations",
        paragraphs: [
          "Kharido Mart operates as an online direct-to-consumer dropshipping and retail storefront offering curated everyday home essentials, educational toys, and smart gadgets.",
          "All transactions conducted on kharidomart.com are subject to our Terms of Service, Privacy Policy, and Replacement Policy."
        ]
      },
      {
        title: "2. Product Authenticity & Quality Verification",
        paragraphs: [
          "All products listed on kharidomart.com are quality checked prior to dispatch and sourced from verified manufacturing and distribution partners.",
          "Product descriptions, specifications, dimensions, and images are provided to help customers make informed purchasing decisions."
        ]
      },
      {
        title: "3. Pricing & Tax Inclusivity",
        paragraphs: [
          "All prices displayed across kharidomart.com are in Indian Rupees (INR) and are inclusive of all applicable taxes.",
          "We do not employ hidden fees or unexpected surcharges at checkout."
        ]
      },
      {
        title: "4. Customer Inquiries & Dispute Resolution",
        paragraphs: [
          "For any questions regarding product orders, delivery, or replacements, please submit an inquiry through our dedicated Contact page.",
          "Our support team handles all customer requests within 12 to 24 business hours."
        ]
      }
    ],
    content: [
      "Kharido Mart is an online direct-to-consumer shopping platform specializing in everyday smart gadgets, educational learning products, and lifestyle essentials.",
      "All purchases are protected by our 24-Hour Replacement Guarantee (unboxing video mandatory) and 256-bit secure checkout."
    ]
  }
};

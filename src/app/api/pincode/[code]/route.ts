import { NextRequest, NextResponse } from "next/server";

// In-memory cache for fast repeated lookups (TTL 24 hours)
const pincodeCache = new Map<string, { city: string; state: string; district: string; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Fallback regional prefixes for instant response if external postal API is temporarily unavailable
const PREFIX_FALLBACKS: Record<string, { city: string; state: string }> = {
  "11": { city: "New Delhi", state: "Delhi" },
  "12": { city: "Gurugram / Faridabad", state: "Haryana" },
  "13": { city: "Ambala / Karnal", state: "Haryana" },
  "14": { city: "Ludhiana / Jalandhar", state: "Punjab" },
  "16": { city: "Chandigarh", state: "Chandigarh" },
  "17": { city: "Shimla", state: "Himachal Pradesh" },
  "18": { city: "Jammu", state: "Jammu and Kashmir" },
  "19": { city: "Srinagar", state: "Jammu and Kashmir" },
  "20": { city: "Noida / Ghaziabad", state: "Uttar Pradesh" },
  "21": { city: "Prayagraj", state: "Uttar Pradesh" },
  "22": { city: "Lucknow", state: "Uttar Pradesh" },
  "24": { city: "Dehradun", state: "Uttarakhand" },
  "28": { city: "Agra / Jhansi", state: "Uttar Pradesh" },
  "30": { city: "Jaipur", state: "Rajasthan" },
  "34": { city: "Jodhpur", state: "Rajasthan" },
  "38": { city: "Ahmedabad", state: "Gujarat" },
  "39": { city: "Surat / Vadodara", state: "Gujarat" },
  "40": { city: "Mumbai", state: "Maharashtra" },
  "41": { city: "Pune", state: "Maharashtra" },
  "44": { city: "Nagpur", state: "Maharashtra" },
  "45": { city: "Indore", state: "Madhya Pradesh" },
  "46": { city: "Bhopal", state: "Madhya Pradesh" },
  "49": { city: "Raipur", state: "Chhattisgarh" },
  "50": { city: "Hyderabad", state: "Telangana" },
  "52": { city: "Vijayawada", state: "Andhra Pradesh" },
  "53": { city: "Visakhapatnam", state: "Andhra Pradesh" },
  "56": { city: "Bengaluru", state: "Karnataka" },
  "57": { city: "Mangaluru / Mysuru", state: "Karnataka" },
  "60": { city: "Chennai", state: "Tamil Nadu" },
  "64": { city: "Coimbatore", state: "Tamil Nadu" },
  "68": { city: "Kochi", state: "Kerala" },
  "69": { city: "Thiruvananthapuram", state: "Kerala" },
  "70": { city: "Kolkata", state: "West Bengal" },
  "75": { city: "Bhubaneswar", state: "Odisha" },
  "78": { city: "Guwahati", state: "Assam" },
  "80": { city: "Patna", state: "Bihar" },
  "83": { city: "Ranchi / Jamshedpur", state: "Jharkhand" },
  "85": { city: "Purnia / Bhagalpur", state: "Bihar" },
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const cleanCode = (code || "").replace(/\D/g, "");

    if (cleanCode.length !== 6) {
      return NextResponse.json(
        { success: false, error: "PIN code must be exactly 6 digits." },
        { status: 400 }
      );
    }

    // 1. Check in-memory cache
    const cached = pincodeCache.get(cleanCode);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        pincode: cleanCode,
        city: cached.city,
        state: cached.state,
        district: cached.district,
        source: "cache",
      });
    }

    // 2. Fetch live data from official India Post API with 3.5s timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const postalRes = await fetch(`https://api.postalpincode.in/pincode/${cleanCode}`, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "User-Agent": "KharidoMart-Storefront/1.0",
        },
      });

      clearTimeout(timeoutId);

      if (postalRes.ok) {
        const data = await postalRes.json();
        if (Array.isArray(data) && data[0]?.Status === "Success" && Array.isArray(data[0]?.PostOffice) && data[0].PostOffice.length > 0) {
          const po = data[0].PostOffice[0];
          const district = po.District || po.Division || po.Name || "";
          const state = po.State || "";
          const city = district;

          if (city && state) {
            pincodeCache.set(cleanCode, { city, state, district, timestamp: Date.now() });

            return NextResponse.json(
              {
                success: true,
                pincode: cleanCode,
                city,
                state,
                district,
                postOffice: po.Name,
                source: "indiapost",
              },
              {
                headers: {
                  "Cache-Control": "public, max-age=86400, s-maxage=86400",
                },
              }
            );
          }
        }
      }
    } catch (networkErr: any) {
      console.warn("India Post API lookup timed out or network error, falling back to prefix map:", networkErr?.message);
    }

    // 3. Fallback to regional prefix lookup
    const prefix2 = cleanCode.substring(0, 2);
    const fallback = PREFIX_FALLBACKS[prefix2];

    if (fallback) {
      return NextResponse.json({
        success: true,
        pincode: cleanCode,
        city: fallback.city,
        state: fallback.state,
        district: fallback.city,
        source: "prefix_fallback",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Could not auto-detect location for this PIN code. Please type City and State manually.",
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("PIN code lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve PIN code." },
      { status: 500 }
    );
  }
}

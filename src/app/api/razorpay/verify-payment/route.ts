import { NextRequest } from "next/server";
import { POST as verifyPaymentHandler } from "@/app/api/verify-payment/route";

export async function POST(req: NextRequest) {
  return verifyPaymentHandler(req);
}

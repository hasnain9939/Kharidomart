import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Returns an authenticated Razorpay instance.
 * Returns null if the API keys have not been configured in .env yet.
 */
export function getRazorpayClient(): Razorpay | null {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || key_id.includes("YOUR_KEY_ID") || key_secret.includes("YOUR_KEY_SECRET")) {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

/**
 * Cryptographically verifies Razorpay payment signature using HMAC SHA-256.
 * Ensures the payment was genuine and authorized by Razorpay.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || secret.includes("YOUR_KEY_SECRET")) {
    return false;
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

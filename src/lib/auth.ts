import crypto from "crypto";



/**
 * Hash a plain password using scrypt with a unique random 16-byte salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Securely verify a plain password against a stored salt:hash string
 */
export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(":");
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(derivedKey, "hex"));
  } catch {
    return false;
  }
}

export {
  createAdminSessionToken,
  verifyAdminSessionToken,
  createUserSessionToken,
  verifyUserSessionToken,
} from "./session";
export type { AdminSessionPayload, UserSessionPayload } from "./session";



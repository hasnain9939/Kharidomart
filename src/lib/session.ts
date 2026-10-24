/**
 * Edge-compatible and Node-compatible Session Token Handler
 * Built with standard Web Crypto API (crypto.subtle) so it runs flawlessly
 * in Next.js Edge Middleware, API Routes, and Browser runtimes.
 */

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "kharidomart-secure-admin-secret-key-2026";

export interface AdminSessionPayload {
  email: string;
  role: "admin";
  issuedAt: number;
}

export interface UserSessionPayload {
  userId: string;
  email: string;
  role: "user";
  issuedAt: number;
}

function bufToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBuf(b64url: string): ArrayBuffer {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64UrlEncodeJson(obj: unknown): string {
  const jsonStr = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(jsonStr);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecodeJson<T>(b64url: string): T | null {
  try {
    let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

/**
 * Generic HMAC-SHA256 session token generator using Web Crypto
 */
export async function signSessionToken<T>(
  payload: T,
  secret: string = SESSION_SECRET
): Promise<string> {
  const data = base64UrlEncodeJson(payload);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return `${data}.${bufToBase64Url(sig)}`;
}

/**
 * Generic HMAC-SHA256 session token verifier using Web Crypto
 */
export async function verifySessionToken<T>(
  token: string | null | undefined,
  secret: string = SESSION_SECRET,
  validator?: (data: any) => T | null
): Promise<T | null> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBuf(sig),
      enc.encode(data)
    );

    if (!isValid) return null;

    const parsed = base64UrlDecodeJson<T>(data);
    if (!parsed) return null;

    return validator ? validator(parsed) : parsed;
  } catch {
    return null;
  }
}

/**
 * Creates an HMAC-SHA256 signed session token for administrators
 */
export async function createAdminSessionToken(
  payload: AdminSessionPayload
): Promise<string> {
  return signSessionToken(payload);
}

/**
 * Verifies an HMAC-SHA256 signed session token for administrators
 */
export async function verifyAdminSessionToken(
  token: string | null | undefined
): Promise<AdminSessionPayload | null> {
  return verifySessionToken<AdminSessionPayload>(
    token,
    SESSION_SECRET,
    (p) => (p && p.role === "admin" && p.email ? p : null)
  );
}

/**
 * Creates an HMAC-SHA256 signed session token for customers
 */
export async function createUserSessionToken(
  payload: UserSessionPayload
): Promise<string> {
  return signSessionToken(payload);
}

/**
 * Verifies an HMAC-SHA256 signed session token for customers
 */
export async function verifyUserSessionToken(
  token: string | null | undefined
): Promise<UserSessionPayload | null> {
  return verifySessionToken<UserSessionPayload>(
    token,
    SESSION_SECRET,
    (p) => (p && p.role === "user" && p.userId && p.email ? p : null)
  );
}

import fs from "fs";
import path from "path";
import crypto from "crypto";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const shop = searchParams.get("shop") || process.env.SHOPIFY_STORE_DOMAIN || "";
  const hmac = searchParams.get("hmac");

  // Validate shop domain format strictly
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
  if (!shop || !shopRegex.test(shop)) {
    return new Response(
      `<html><body style="font-family:system-ui,sans-serif;padding:40px;text-align:center;">
        <h2 style="color:#ef4444;">Invalid Shop Domain</h2>
        <p>The shop domain provided is invalid.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" }, status: 400 }
    );
  }

  if (!code) {
    return new Response(
      `<html><body style="font-family:system-ui,sans-serif;padding:40px;text-align:center;">
        <h2 style="color:#ef4444;">Missing Authorization Code</h2>
        <p>Could not complete Shopify authorization.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" }, status: 400 }
    );
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(
      `<html><body style="font-family:system-ui,sans-serif;padding:40px;text-align:center;">
        <h2 style="color:#ef4444;">Shopify Client Configuration Missing</h2>
        <p>SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET must be configured in environment variables.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" }, status: 500 }
    );
  }

  // Verify HMAC signature from Shopify if present
  if (hmac) {
    const params: string[] = [];
    searchParams.forEach((val, key) => {
      if (key !== "hmac" && key !== "signature") {
        params.push(`${key}=${val}`);
      }
    });
    params.sort();
    const message = params.join("&");
    const generatedHmac = crypto
      .createHmac("sha256", clientSecret)
      .update(message)
      .digest("hex");

    const hmacBuf = Buffer.from(hmac, "utf-8");
    const genBuf = Buffer.from(generatedHmac, "utf-8");
    if (hmacBuf.length !== genBuf.length || !crypto.timingSafeEqual(hmacBuf, genBuf)) {
      return new Response(
        `<html><body style="font-family:system-ui,sans-serif;padding:40px;text-align:center;">
          <h2 style="color:#ef4444;">Invalid HMAC Signature</h2>
          <p>Could not verify the authenticity of the Shopify request.</p>
        </body></html>`,
        { headers: { "Content-Type": "text/html" }, status: 401 }
      );
    }
  }

  try {
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json().catch(() => ({}));

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[Shopify OAuth] Failed to exchange token");
      return new Response(
        `<html><body style="font-family:system-ui,sans-serif;padding:40px;text-align:center;">
          <h2 style="color:#ef4444;">Shopify Authorization Failed</h2>
          <p>Failed to exchange authorization token. Please check your credentials.</p>
        </body></html>`,
        { headers: { "Content-Type": "text/html" }, status: 400 }
      );
    }

    const accessToken = tokenData.access_token;
    console.log(`[Shopify OAuth] Successfully exchanged token for store: ${shop}`);

    // In local development, attempt updating .env if writable
    try {
      const envPath = path.join(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, "utf-8");

        if (envContent.includes("SHOPIFY_STORE_DOMAIN=")) {
          envContent = envContent.replace(
            /SHOPIFY_STORE_DOMAIN=.*/g,
            `SHOPIFY_STORE_DOMAIN="${shop}"`
          );
        } else {
          envContent += `\nSHOPIFY_STORE_DOMAIN="${shop}"`;
        }

        if (envContent.includes("SHOPIFY_ADMIN_ACCESS_TOKEN=")) {
          envContent = envContent.replace(
            /SHOPIFY_ADMIN_ACCESS_TOKEN=.*/g,
            `SHOPIFY_ADMIN_ACCESS_TOKEN="${accessToken}"`
          );
        } else {
          envContent += `\nSHOPIFY_ADMIN_ACCESS_TOKEN="${accessToken}"`;
        }

        fs.writeFileSync(envPath, envContent, "utf-8");
      }
    } catch {
      // In serverless / read-only production environments, file write is ignored
    }

    // Return friendly HTML success screen
    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shopify Connected Successfully | Kharido Mart</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.08);
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    .icon-badge {
      width: 70px;
      height: 70px;
      background: #e6f9ed;
      color: #008060;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      font-size: 32px;
    }
    h1 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
    }
    p {
      color: #64748b;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .info-box {
      background: #f1f5f9;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 28px;
      text-align: left;
      font-size: 0.85rem;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .info-row:last-child { margin-bottom: 0; }
    .btn {
      display: inline-block;
      background: #008060;
      color: white;
      padding: 12px 28px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn:hover { background: #004c3f; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-badge">✓</div>
    <h1>Shopify Warehouse Connected!</h1>
    <p>Kharido Mart is now successfully connected to your Shopify store. All placed orders and live courier tracking will sync automatically.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span style="color:#64748b;">Connected Store:</span>
        <strong style="color:#0f172a;">${escapeHtml(shop)}</strong>
      </div>
      <div class="info-row">
        <span style="color:#64748b;">API Status:</span>
        <strong style="color:#008060;">Active &amp; Verified</strong>
      </div>
      <div class="info-row">
        <span style="color:#64748b;">Orders Sync:</span>
        <strong style="color:#008060;">Enabled</strong>
      </div>
    </div>

    <a href="/admin" class="btn">Open Admin Dashboard</a>
  </div>
</body>
</html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err: any) {
    console.error("[Shopify OAuth] Exception during token exchange:", err);
    return new Response(
      `<html><body style="font-family:system-ui,sans-serif;padding:40px;text-align:center;">
        <h2 style="color:#ef4444;">Server Error</h2>
        <p>${err.message || "Failed to communicate with Shopify API"}</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" }, status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { verifyAdminSessionToken } from "@/lib/session";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB maximum limit
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm"]);

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization: Only authenticated administrators can upload assets
    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    const admin = await verifyAdminSessionToken(sessionCookie);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required to upload files" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided in upload request" },
        { status: 400 }
      );
    }

    // 2. Pre-buffer Size Check: Mitigate Memory Exhaustion / DoS
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds 10MB size limit. Please upload an optimized file." },
        { status: 413 }
      );
    }

    // 3. Extension & MIME Whitelist: Block Executables, SVG scripts, and Stored XSS vectors
    const originalName = file.name || "upload";
    const rawExt = path.extname(originalName).toLowerCase();
    const mime = (file.type || "").toLowerCase();

    if (rawExt && !ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only JPG, PNG, WEBP, GIF, MP4, and WEBM files are allowed." },
        { status: 400 }
      );
    }

    let ext = rawExt;
    if (!ext) {
      if (mime.includes("png")) ext = ".png";
      else if (mime.includes("webp")) ext = ".webp";
      else if (mime.includes("gif")) ext = ".gif";
      else if (mime.includes("mp4")) ext = ".mp4";
      else if (mime.includes("webm")) ext = ".webm";
      else if (mime.includes("jpeg") || mime.includes("jpg")) ext = ".jpg";
      else {
        return NextResponse.json(
          { success: false, error: "Unsupported media type. Only standard images and videos are permitted." },
          { status: 400 }
        );
      }
    }

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { success: false, error: "Forbidden file extension." },
        { status: 403 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Safe Filename Sanitization: Prevent Path Traversal
    const safeStem = path
      .basename(originalName, rawExt)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 32);

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `${Date.now()}-${safeStem || "media"}-${randomSuffix}${ext}`;

    // Try saving locally to public/uploads
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      const fullPath = path.join(uploadsDir, filename);
      await writeFile(fullPath, buffer);

      return NextResponse.json({

        success: true,
        url: `/uploads/${filename}`,
        filename,
        size: file.size,
        type: mime,
      });
    } catch (fsErr: any) {
      console.error("Local filesystem write failed in /api/upload:", fsErr?.message);
      return NextResponse.json(
        {
          success: false,
          error:
            "Local storage is unavailable on this environment. Please configure cloud storage (S3/R2/Cloudinary) or use external media URLs.",
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process file upload" },
      { status: 500 }
    );
  }
}

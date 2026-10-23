import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided in upload request" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine extension and safe filename
    const originalName = file.name || "upload";
    const rawExt = path.extname(originalName).toLowerCase();
    const mime = file.type || "";
    
    let ext = rawExt;
    if (!ext) {
      if (mime.includes("png")) ext = ".png";
      else if (mime.includes("webp")) ext = ".webp";
      else if (mime.includes("gif")) ext = ".gif";
      else if (mime.includes("svg")) ext = ".svg";
      else if (mime.includes("mp4")) ext = ".mp4";
      else if (mime.includes("webm")) ext = ".webm";
      else ext = ".jpg";
    }

    const safeStem = path
      .basename(originalName, rawExt)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 32);

    const filename = `${Date.now()}-${safeStem || "file"}${ext}`;

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
      console.warn("Local filesystem write failed, using fallback:", fsErr?.message);

      // Serverless fallback: For images or files under 4MB, convert to base64 Data URL
      if (file.size <= 4.5 * 1024 * 1024) {
        const base64Data = buffer.toString("base64");
        const dataUrl = `data:${mime || "image/jpeg"};base64,${base64Data}`;
        return NextResponse.json({
          success: true,
          url: dataUrl,
          filename,
          size: file.size,
          type: mime,
          isDataUrl: true,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: "File is too large for serverless memory storage. Please use a video under 4MB or paste an external link (YouTube / Vimeo / CDN).",
        },
        { status: 413 }
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

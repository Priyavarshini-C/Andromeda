// =============================================================================
// Andromeda — Local File Upload API Route
// POST /api/upload
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: { message: "No file provided in form data." } },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save folder inside public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Generate safe file name with timestamp and random string
    const ext = path.extname(file.name) || ".jpg";
    const cleanBase = path.basename(file.name, ext).replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    const fileName = `${cleanBase}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file locally
    await writeFile(filePath, buffer);

    // Return public relative path
    const fileUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({
      success: true,
      url: fileUrl,
    });
  } catch (err) {
    console.error("Local file upload error:", err);
    return NextResponse.json(
      { error: { message: "Failed to upload file to local server." } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Configure Cloudinary with environment variables
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
    secure: true,
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function uploadToCloudinary(buffer: Buffer, folder: string = "santechs/products"): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Only image files are allowed" }, { status: 400 });
    }

    // Max 10MB per file
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. If Cloudinary credentials are configured (Production / Cloud)
    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    );

    if (isCloudinaryConfigured) {
      const uploadResult = await uploadToCloudinary(buffer);

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        provider: "cloudinary",
      });
    }

    // 2. Local Fallback for offline development without Cloudinary credentials
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadsDir, { recursive: true });

    const localFilePath = path.join(uploadsDir, `${timestamp}-${safeName}`);
    await writeFile(localFilePath, buffer);

    const localUrl = `/uploads/products/${timestamp}-${safeName}`;

    return NextResponse.json({
      success: true,
      url: localUrl,
      provider: "local-storage",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

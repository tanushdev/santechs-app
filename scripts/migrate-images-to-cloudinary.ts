import { config } from "dotenv";
config({ path: ".env" });
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

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

async function migrateImages() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI in environment.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Failed to get MongoDB database instance");
  }

  const productsCollection = db.collection("products");
  const products = await productsCollection.find({}).toArray();

  console.log(`Found ${products.length} products in database.`);

  let migratedCount = 0;
  let base64Migrated = 0;
  let urlMigrated = 0;
  let alreadyCloudinary = 0;

  const activeCloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    (process.env.CLOUDINARY_URL ? process.env.CLOUDINARY_URL.split("@")[1] : "");

  for (const product of products) {
    const images: string[] = product.images || [];
    let updated = false;
    const newImages: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      // If already on the active new Cloudinary account, keep it
      if (activeCloudName && img.includes(`res.cloudinary.com/${activeCloudName}/`)) {
        newImages.push(img);
        alreadyCloudinary++;
        continue;
      }

      console.log(`\nMigrating image for product "${product.name}" (${i + 1}/${images.length})...`);
      
      try {
        const isBase64 = img.startsWith("data:image");
        const uploadRes = await cloudinary.uploader.upload(img, {
          folder: "santechs/products",
          resource_type: "image",
        });

        console.log(` -> Success! New Cloudinary URL: ${uploadRes.secure_url}`);
        newImages.push(uploadRes.secure_url);
        updated = true;

        if (isBase64) {
          base64Migrated++;
        } else {
          urlMigrated++;
        }
      } catch (err: any) {
        console.error(` -> Failed to migrate image for "${product.name}":`, err.message || err);
        // Retain existing image if upload failed
        newImages.push(img);
      }
    }

    if (updated) {
      await productsCollection.updateOne(
        { _id: product._id },
        { $set: { images: newImages } }
      );
      migratedCount++;
    }
  }

  console.log("\n==========================================");
  console.log(" MIGRATION SUMMARY");
  console.log("==========================================");
  console.log(`Products updated in MongoDB: ${migratedCount}`);
  console.log(`Base64 images migrated:     ${base64Migrated}`);
  console.log(`External images migrated:   ${urlMigrated}`);
  console.log(`Already on Cloudinary:      ${alreadyCloudinary}`);
  console.log("==========================================\n");

  await mongoose.disconnect();
  console.log("MongoDB connection closed. Done!");
}

migrateImages().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});

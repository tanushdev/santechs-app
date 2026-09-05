import { config } from "dotenv";
config({ path: ".env" });
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

async function restoreDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in .env");
    process.exit(1);
  }

  const latestDir = path.join(process.cwd(), "backups", "latest");
  if (!fs.existsSync(latestDir)) {
    console.error(`Backup folder not found at: ${latestDir}`);
    process.exit(1);
  }

  console.log(`Connecting to destination MongoDB to restore data...`);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database instance not available");

  const files = fs.readdirSync(latestDir).filter((f) => f.endsWith(".json") && f !== "manifest.json");

  console.log(`Found ${files.length} collections to restore from backup...`);

  for (const file of files) {
    const colName = file.replace(".json", "");
    const raw = fs.readFileSync(path.join(latestDir, file), "utf-8");
    const docs = JSON.parse(raw);

    if (docs.length === 0) {
      console.log(` -> Skipping empty collection "${colName}"`);
      continue;
    }

    // Convert string $oid and $date if needed
    const parsedDocs = docs.map((doc: any) => {
      const copy = { ...doc };
      if (copy._id && typeof copy._id === "string" && mongoose.Types.ObjectId.isValid(copy._id)) {
        copy._id = new mongoose.Types.ObjectId(copy._id);
      }
      return copy;
    });

    console.log(`Restoring "${colName}" (${parsedDocs.length} documents)...`);
    const col = db.collection(colName);
    
    // Upsert each document to preserve IDs and avoid duplicates
    for (const doc of parsedDocs) {
      await col.replaceOne({ _id: doc._id }, doc, { upsert: true });
    }

    console.log(` -> Restored "${colName}" successfully!`);
  }

  console.log("\n==========================================");
  console.log(" RESTORE TO TARGET DATABASE COMPLETED");
  console.log("==========================================\n");

  await mongoose.disconnect();
}

restoreDatabase().catch((err) => {
  console.error("Restore failed:", err);
  process.exit(1);
});

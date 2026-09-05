import { config } from "dotenv";
config({ path: ".env" });
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

async function backupDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in .env");
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups", `mongodb-backup-${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`Connecting to MongoDB to create full snapshot backup...`);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database instance not available");

  const collections = await db.listCollections().toArray();
  console.log(`Found ${collections.length} collections. Exporting to ${backupDir}...`);

  const manifest: Record<string, number> = {};

  for (const colInfo of collections) {
    const colName = colInfo.name;
    const docs = await db.collection(colName).find({}).toArray();
    const filePath = path.join(backupDir, `${colName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), "utf-8");
    manifest[colName] = docs.length;
    console.log(` -> Exported ${docs.length} documents from "${colName}"`);
  }

  // Also create a "latest" pointer
  const latestDir = path.join(process.cwd(), "backups", "latest");
  fs.mkdirSync(latestDir, { recursive: true });
  for (const colName of Object.keys(manifest)) {
    fs.copyFileSync(
      path.join(backupDir, `${colName}.json`),
      path.join(latestDir, `${colName}.json`)
    );
  }

  fs.writeFileSync(
    path.join(backupDir, "manifest.json"),
    JSON.stringify({ timestamp, collections: manifest }, null, 2),
    "utf-8"
  );
  fs.writeFileSync(
    path.join(latestDir, "manifest.json"),
    JSON.stringify({ timestamp, collections: manifest }, null, 2),
    "utf-8"
  );

  console.log("\n==========================================");
  console.log(" FULL DATABASE BACKUP COMPLETE");
  console.log(` Stored in: ${backupDir}`);
  console.log(` Latest copy in: ${latestDir}`);
  console.log("==========================================\n");

  await mongoose.disconnect();
}

backupDatabase().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});

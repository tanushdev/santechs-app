import mongoose from "mongoose";

const LOCAL_URI = "mongodb://localhost:27017/santechs";
const REMOTE_URI = "mongodb+srv://db:db123@xeecluster.mnci11j.mongodb.net/santechs?retryWrites=true&w=majority&appName=XeeCluster";

async function runMigration() {
  console.log("🚀 Starting database migration from local MongoDB to online Atlas...");

  let localConn;
  let remoteConn;

  try {
    console.log("🔌 Connecting to Local MongoDB...");
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log("✅ Connected to Local MongoDB");

    console.log("🔌 Connecting to Remote MongoDB Atlas...");
    remoteConn = await mongoose.createConnection(REMOTE_URI).asPromise();
    console.log("✅ Connected to Remote MongoDB Atlas");

    // List of collections to migrate
    const collections = [
      "users",
      "categories",
      "brands",
      "companies",
      "products",
      "enquiries",
      "messages",
      "notifications",
      "wishlists",
      "activitylogs"
    ];

    for (const colName of collections) {
      console.log(`\n📦 Migrating collection: "${colName}"`);
      
      const localCol = localConn.collection(colName);
      const remoteCol = remoteConn.collection(colName);

      const docs = await localCol.find({}).toArray();
      
      if (docs.length === 0) {
        console.log(`ℹ️ Collection "${colName}" has no local documents. Skipping.`);
        continue;
      }

      console.log(`📥 Found ${docs.length} documents locally. Clearing remote collection...`);
      await remoteCol.deleteMany({});
      
      console.log(`📤 Uploading ${docs.length} documents to MongoDB Atlas...`);
      await remoteCol.insertMany(docs);
      
      console.log(`✅ Successfully migrated "${colName}".`);
    }

    console.log("\n🏁 Migration complete! All local database collections have been copied online.");
  } catch (error) {
    console.error("❌ Migration failed with error:", error);
  } finally {
    if (localConn) await localConn.close();
    if (remoteConn) await remoteConn.close();
    process.exit(0);
  }
}

runMigration();

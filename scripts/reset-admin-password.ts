import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const REMOTE_URI = "mongodb+srv://db:db123@xeecluster.mnci11j.mongodb.net/santechs?retryWrites=true&w=majority&appName=XeeCluster";

async function reset() {
  console.log("🔌 Connecting to MongoDB Atlas...");
  await mongoose.connect(REMOTE_URI);
  console.log("✅ Connected");

  const hashed = await bcrypt.hash("Admin@123456", 12);
  
  const UserSchema = new mongoose.Schema({
    name: { type: String, default: "Super Admin" },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String },
    status: { type: String }
  });

  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  
  console.log("🔑 Updating credentials for admin@santechs.com...");
  const result = await User.findOneAndUpdate(
    { email: "admin@santechs.com" },
    { 
      name: "Super Admin",
      email: "admin@santechs.com",
      password: hashed,
      role: "SUPER_ADMIN",
      status: "ACTIVE"
    },
    { upsert: true, new: true }
  );
  
  console.log("✅ Super Admin credentials updated successfully to:", {
    email: result.email,
    password: "Admin@123456",
    role: result.role,
    status: result.status
  });

  await mongoose.disconnect();
  process.exit(0);
}

reset().catch(err => {
  console.error("❌ Reset failed:", err);
  process.exit(1);
});

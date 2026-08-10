import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const REMOTE_URI = "mongodb+srv://db:db123@xeecluster.mnci11j.mongodb.net/santechs?retryWrites=true&w=majority&appName=XeeCluster";

async function verify() {
  console.log("🔌 Connecting to MongoDB Atlas...");
  await mongoose.connect(REMOTE_URI);
  console.log("✅ Connected");

  const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: { type: String, select: true },
    role: String,
    status: String
  });

  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  
  const user = await User.findOne({ email: "admin@santechs.com" });
  
  if (!user) {
    console.log("❌ User admin@santechs.com not found!");
  } else {
    console.log("👤 User document found:", {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      hasPassword: !!user.password,
      passwordHash: user.password
    });

    if (user.password) {
      const match = await bcrypt.compare("Admin@123456", user.password);
      console.log(`🔐 password matching 'Admin@123456': ${match ? "✅ MATCHES" : "❌ DOES NOT MATCH"}`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

verify().catch(err => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});

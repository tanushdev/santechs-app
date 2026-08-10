/**
 * Seed Script — run with: npx tsx scripts/seed.ts
 * Creates: Super Admin user, categories, brands
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/santechs";

// Inline schemas to avoid next.js module issues
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "BUYER" },
    status: { type: String, default: "ACTIVE" },
    emailVerified: Date,
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    type: String,
    description: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const BrandSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    country: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);

const categories = [
  // Machines
  { name: "DTY Machines", slug: "dty-machines", type: "MACHINE", order: 1 },
  { name: "FDY Machines", slug: "fdy-machines", type: "MACHINE", order: 2 },
  { name: "POY Machines", slug: "poy-machines", type: "MACHINE", order: 3 },
  { name: "Spinning Machines", slug: "spinning-machines", type: "MACHINE", order: 4 },
  { name: "False Twist Machines", slug: "false-twist-machines", type: "MACHINE", order: 5 },
  { name: "Texturizing Machines", slug: "texturizing-machines", type: "MACHINE", order: 6 },
  { name: "Twisting Machines", slug: "twisting-machines", type: "MACHINE", order: 7 },
  { name: "Extrusion Machines", slug: "extrusion-machines", type: "MACHINE", order: 8 },
  { name: "Polymerization Plants", slug: "polymerization-plants", type: "MACHINE", order: 9 },
  { name: "Recycling Plants", slug: "recycling-plants", type: "MACHINE", order: 10 },
  { name: "Dryers", slug: "dryers", type: "MACHINE", order: 11 },
  { name: "Crushers", slug: "crushers", type: "MACHINE", order: 12 },
  { name: "Pelletizers", slug: "pelletizers", type: "MACHINE", order: 13 },
  // Raw Materials
  { name: "PET Flakes", slug: "pet-flakes", type: "RAW_MATERIAL", order: 1 },
  { name: "PET Chips", slug: "pet-chips", type: "RAW_MATERIAL", order: 2 },
  { name: "PET Films", slug: "pet-films", type: "RAW_MATERIAL", order: 3 },
  { name: "PET Lumps", slug: "pet-lumps", type: "RAW_MATERIAL", order: 4 },
  { name: "Fabric Waste", slug: "fabric-waste", type: "RAW_MATERIAL", order: 5 },
  { name: "Yarn Waste", slug: "yarn-waste", type: "RAW_MATERIAL", order: 6 },
  { name: "Polymer", slug: "polymer", type: "RAW_MATERIAL", order: 7 },
  { name: "Masterbatch", slug: "masterbatch", type: "RAW_MATERIAL", order: 8 },
  // Spare Parts
  { name: "Godet Rolls", slug: "godet-rolls", type: "SPARE_PART", order: 1 },
  { name: "Filter Screen Changers", slug: "filter-screen-changers", type: "SPARE_PART", order: 2 },
  { name: "Spindles", slug: "spindles", type: "SPARE_PART", order: 3 },
  { name: "Heaters", slug: "heaters", type: "SPARE_PART", order: 4 },
  { name: "Bearings", slug: "bearings", type: "SPARE_PART", order: 5 },
  // Services
  { name: "Installation Services", slug: "installation-services", type: "SERVICE", order: 1 },
  { name: "Commissioning Services", slug: "commissioning-services", type: "SERVICE", order: 2 },
  { name: "Relocation Services", slug: "relocation-services", type: "SERVICE", order: 3 },
  { name: "Inspection Services", slug: "inspection-services", type: "SERVICE", order: 4 },
  { name: "Dismantling Services", slug: "dismantling-services", type: "SERVICE", order: 5 },
];

const brands = [
  { name: "Barmag", slug: "barmag", country: "Germany" },
  { name: "Rieter", slug: "rieter", country: "Switzerland" },
  { name: "TMT Machinery", slug: "tmt-machinery", country: "Japan" },
  { name: "SSM", slug: "ssm", country: "Switzerland" },
  { name: "Murata", slug: "murata", country: "Japan" },
  { name: "Oerlikon", slug: "oerlikon", country: "Switzerland" },
  { name: "Truetzschler", slug: "truetzschler", country: "Germany" },
  { name: "Lakshmi Machine Works", slug: "lakshmi-machine-works", country: "India" },
  { name: "ATIRA", slug: "atira", country: "India" },
  { name: "Saurer", slug: "saurer", country: "Switzerland" },
  { name: "Jing Wei", slug: "jing-wei", country: "China" },
  { name: "KAIAO", slug: "kaiao", country: "China" },
];

async function seed() {
  console.log("🌱 Starting seed...");

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  // Create Super Admin
  const adminEmail = process.env.SUPER_ADMIN_EMAIL ?? "admin@santechs.com";
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD ?? "Admin@123456";

  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashed,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    });
    console.log(`✅ Super Admin created: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Super Admin already exists: ${adminEmail}`);
  }

  // Seed categories
  let catCreated = 0;
  for (const cat of categories) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (!exists) {
      await Category.create(cat);
      catCreated++;
    }
  }
  console.log(`✅ Categories: ${catCreated} created, ${categories.length - catCreated} already existed`);

  // Seed brands
  let brandCreated = 0;
  for (const brand of brands) {
    const exists = await Brand.findOne({ slug: brand.slug });
    if (!exists) {
      await Brand.create(brand);
      brandCreated++;
    }
  }
  console.log(`✅ Brands: ${brandCreated} created, ${brands.length - brandCreated} already existed`);

  await mongoose.disconnect();
  console.log("✅ Seed complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

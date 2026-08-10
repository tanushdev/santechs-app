import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/santechs";

// Inline schemas to avoid Next.js module conflicts in node environment
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  role: { type: String, required: true },
  status: { type: String, required: true },
  emailVerified: { type: Date },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
}, { timestamps: true });

const CompanySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  address: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
  },
  isVerified: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  type: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const BrandSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  country: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  referenceNumber: { type: String, required: true, unique: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
  status: { type: String, required: true },
  condition: { type: String, required: true },
  machineType: { type: String },
  machineModel: { type: String },
  manufacturer: { type: String },
  yearOfManufacture: { type: Number },
  productionCapacity: { type: String },
  numberOfPositions: { type: Number },
  numberOfSpindles: { type: Number },
  price: { type: Number },
  priceNegotiable: { type: Boolean, default: true },
  currency: { type: String, default: "USD" },
  quantity: { type: Number, default: 1 },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
  },
  images: [{ type: String }],
  utilitiesIncluded: { type: Boolean, default: true },
  accessoriesIncluded: { type: Boolean, default: true },
  sparePartsIncluded: { type: Boolean, default: true },
  installationSupport: { type: Boolean, default: true },
  commissioningSupport: { type: Boolean, default: true },
  relocationSupport: { type: Boolean, default: true },
  dismantlingSupport: { type: Boolean, default: true },
  inspectionAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isVerifiedSeller: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  enquiryCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  publishedAt: { type: Date },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Company = mongoose.models.Company || mongoose.model("Company", CompanySchema);
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const santechsProducts = [
  {
    name: "0001 Polyester High Speed Spinning Machine",
    categorySlug: "spinning-machines",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "0001-FDY",
    price: 180000,
    link: "https://www.santechs.co.in/0001-polyester-high-speed-spinning-machine.htm",
    tags: ["spinning", "polyester", "filament", "santechs"],
  },
  {
    name: "002 Polyester High Speed Spinning Machine",
    categorySlug: "spinning-machines",
    condition: "GOOD",
    manufacturer: "Santechs",
    model: "002-POY",
    price: 145000,
    link: "https://www.santechs.co.in/002-polyester-high-speed-spinning-machine.htm",
    tags: ["spinning", "polyester", "poy", "santechs"],
  },
  {
    name: "007 Pilot Spinning Machine",
    categorySlug: "spinning-machines",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "007-PILOT",
    price: 65000,
    link: "https://www.santechs.co.in/007-pilot-spinning-machine.htm",
    tags: ["pilot", "lab scale", "spinning", "santechs"],
  },
  {
    name: "018 Polyester High Speed Spinning Machine",
    categorySlug: "spinning-machines",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "018-FDY",
    price: 210000,
    link: "https://www.santechs.co.in/018-polyester-high-speed-spinning-machine.htm",
    tags: ["spinning", "polyester", "filament", "santechs"],
  },
  {
    name: "031 Pilot Spinning Machine",
    categorySlug: "spinning-machines",
    condition: "GOOD",
    manufacturer: "Santechs",
    model: "031-LAB",
    price: 48000,
    link: "https://www.santechs.co.in/031-pilot-spinning-machine.htm",
    tags: ["pilot", "spinning", "lab", "santechs"],
  },
  {
    name: "Air Bearing Separator Rolls",
    categorySlug: "godet-rolls",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "AB-80",
    price: 1800,
    link: "https://www.santechs.co.in/air-bearing-separator-rolls.htm",
    tags: ["rolls", "air bearing", "spare parts", "santechs"],
  },
  {
    name: "BCF Spinning Machine",
    categorySlug: "spinning-machines",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "BCF-3E",
    price: 290000,
    link: "https://www.santechs.co.in/bcf-spinning-machine.htm",
    tags: ["bcf", "carpet yarn", "spinning", "santechs"],
  },
  {
    name: "Cooled Godet Rolls",
    categorySlug: "godet-rolls",
    condition: "GOOD",
    manufacturer: "Santechs",
    model: "CG-220",
    price: 4200,
    link: "https://www.santechs.co.in/cooled-godet-rolls.htm",
    tags: ["godet", "roll", "cooling", "spare parts"],
  },
  {
    name: "CSFprimus Series Filter Screen Changer",
    categorySlug: "filter-screen-changers",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "CSF-120",
    price: 13500,
    link: "https://www.santechs.co.in/csfprimus-series-filter-screen-changer.htm",
    tags: ["filter", "screen changer", "extrusion", "santechs"],
  },
  {
    name: "Externally-Driven Heated Godet Rolls",
    categorySlug: "godet-rolls",
    condition: "GOOD",
    manufacturer: "Santechs",
    model: "EHG-250",
    price: 5400,
    link: "https://www.santechs.co.in/externally-driven-heated-godet-rolls.htm",
    tags: ["godet", "roll", "heated", "santechs"],
  },
  {
    name: "Heated Draw Pins",
    categorySlug: "godet-rolls",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "HDP-45",
    price: 950,
    link: "https://www.santechs.co.in/heated-draw-pins.htm",
    tags: ["draw pin", "heated", "spare parts", "santechs"],
  },
  {
    name: "Heated Godet Rolls",
    categorySlug: "godet-rolls",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "HG-300",
    price: 6800,
    link: "https://www.santechs.co.in/heated-godet-rolls.htm",
    tags: ["godet", "roll", "heated", "induction"],
  },
  {
    name: "High-Temperature Godet Rolls",
    categorySlug: "godet-rolls",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "HTG-280",
    price: 7900,
    link: "https://www.santechs.co.in/high-temperature-godet-rolls.htm",
    tags: ["godet", "roll", "high temp", "santechs"],
  },
  {
    name: "Homogenizer or Finisher Machine",
    categorySlug: "polymerization-plants",
    condition: "GOOD",
    manufacturer: "Santechs",
    model: "HM-500",
    price: 95000,
    link: "https://www.santechs.co.in/homogenizer-or-finisher-machine.htm",
    tags: ["finisher", "homogenizer", "polymerization", "santechs"],
  },
  {
    name: "HY-10 False Twist Texturing Machine",
    categorySlug: "false-twist-machines",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "HY-10",
    price: 140000,
    link: "https://www.santechs.co.in/hy-10-false-twist-texturing-machine.htm",
    tags: ["texturizing", "false twist", "dty", "santechs"],
  },
  {
    name: "HY-12 False Twist Texturing Machine",
    categorySlug: "false-twist-machines",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "HY-12",
    price: 175000,
    link: "https://www.santechs.co.in/hy-12-false-twist-texturing-machine.htm",
    tags: ["texturizing", "dty", "false twist", "santechs"],
  },
  {
    name: "HY-7 Series False Twist Texturing Machine",
    categorySlug: "false-twist-machines",
    condition: "GOOD",
    manufacturer: "Santechs",
    model: "HY-7",
    price: 95000,
    link: "https://www.santechs.co.in/hy-7-series-false-twist-texturing-machine.htm",
    tags: ["texturizing", "false twist", "dty", "santechs"],
  },
  {
    name: "HY-9 Automatic Doffer False Twisting Machine",
    categorySlug: "false-twist-machines",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "HY-9",
    price: 125000,
    link: "https://www.santechs.co.in/hy-9-automatic-doffer-false-twisting-machine.htm",
    tags: ["doffer", "texturizing", "automatic", "santechs"],
  },
  {
    name: "KSF Series Filter Screen Changer",
    categorySlug: "filter-screen-changers",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "KSF-90",
    price: 11000,
    link: "https://www.santechs.co.in/ksf-series-filter-screen-changer.htm",
    tags: ["filter", "screen changer", "extrusion", "santechs"],
  },
  {
    name: "Liquid Color Injection System For Dope Dyeing Polyester",
    categorySlug: "spinning-machines",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "LCI-10",
    price: 28000,
    link: "https://www.santechs.co.in/liquid-color-injection-system-for-dope-dyeing-polyester.htm",
    tags: ["dope dyeing", "injection", "color", "spinning"],
  },
  {
    name: "Low Melt Point Fiber Spinning Machine",
    categorySlug: "spinning-machines",
    condition: "EXCELLENT",
    manufacturer: "Santechs",
    model: "LM-BC-12",
    price: 245000,
    link: "https://www.santechs.co.in/low-melt-point-fiber-spinning-machine.htm",
    tags: ["low melt", "bicomponent", "spinning", "santechs"],
  }
];

function generateRef(): string {
  return `SAN-WL-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;
}

function toSlug(name: string, ref: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 60) +
    "-" +
    ref.toLowerCase()
  );
}

async function seed() {
  console.log("🌱 Starting clean Santechs.co.in products import...");

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  // 1. CLEAR ALL OLD PRODUCTS
  console.log("🗑️ Deleting all existing products to remove mock data...");
  const deleteResult = await Product.deleteMany({});
  console.log(`✅ Deleted ${deleteResult.deletedCount} old products.`);

  const targetEmail = "tanushshyam32@gmail.com";
  let user = await User.findOne({ email: targetEmail });

  if (!user) {
    console.log(`Creating user ${targetEmail} as SELLER...`);
    const hashedPassword = await bcrypt.hash("Sarita880", 12);
    user = await User.create({
      name: "Tanush Shyam",
      email: targetEmail,
      password: hashedPassword,
      role: "SELLER",
      status: "ACTIVE",
    });
  }

  let company = await Company.findOne({ owner: user._id });
  if (!company) {
    console.log(`Creating company for ${targetEmail}...`);
    company = await Company.create({
      owner: user._id,
      name: "Santech Machinery And Equipment Pvt. Ltd.",
      slug: "santech-machinery",
      phone: "+91 98765 43210",
      email: "santtossh@santechs.net",
      address: {
        city: "Navi Mumbai",
        state: "Maharashtra",
        country: "India",
      },
      isVerified: true,
      isApproved: true,
    });
  }

  // Bind company to user
  user.company = company._id;
  await user.save();

  // Get or create category maps
  const categoryDocs = await Category.find({});
  const catMap: Record<string, any> = {};
  categoryDocs.forEach(c => {
    catMap[c.slug] = c._id;
  });

  // Ensure false twist machines exists
  if (!catMap["false-twist-machines"]) {
    const c = await Category.create({ name: "False Twist Machines", slug: "false-twist-machines", type: "MACHINE" });
    catMap["false-twist-machines"] = c._id;
  }

  let count = 0;
  for (const item of santechsProducts as any[]) {
    const ref = generateRef();
    const slug = toSlug(item.name, ref);
    const catId = catMap[item.categorySlug];

    if (!catId) {
      console.log(`⚠️ Category ${item.categorySlug} not found in DB. Skipping ${item.name}`);
      continue;
    }

    // Fetch the live HTML content to scrape actual og:image and og:description
    let liveImage = "";
    let liveDesc = "";
    try {
      console.log(`Scraping page: ${item.link}...`);
      const response = await fetch(item.link);
      if (response.ok) {
        const html = await response.text();
        
        const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
        if (ogImageMatch && ogImageMatch[1]) {
          liveImage = ogImageMatch[1].trim();
        }
        
        const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);
        if (ogDescMatch && ogDescMatch[1]) {
          // Decode HTML entities
          liveDesc = ogDescMatch[1]
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .trim();
        }
      }
    } catch (fetchErr) {
      console.log(`⚠️ Failed to fetch live metadata for ${item.name}. Using fallbacks.`);
    }

    const finalImage = liveImage || `https://via.placeholder.com/800x600.png?text=${encodeURIComponent(item.name)}`;
    const finalDesc = liveDesc || `High-quality ${item.name} supplied by Santech Machinery And Equipment Pvt. Ltd. Vetted and verified.`;

    await Product.create({
      referenceNumber: ref,
      seller: user._id,
      company: company._id,
      name: item.name,
      slug,
      description: finalDesc,
      category: catId,
      status: "APPROVED",
      condition: item.condition,
      manufacturer: item.manufacturer,
      machineModel: item.model,
      yearOfManufacture: 2020,
      productionCapacity: "N/A",
      numberOfPositions: item.numberOfPositions || 1,
      price: item.price || 0,
      priceNegotiable: true,
      currency: "INR",
      quantity: 1,
      location: {
        city: "Navi Mumbai",
        state: "Maharashtra",
        country: "India",
      },
      images: [finalImage],
      tags: item.tags,
      isFeatured: Math.random() > 0.6,
      isVerifiedSeller: true,
      views: Math.floor(Math.random() * 50) + 10,
      publishedAt: new Date(),
    });

    console.log(`✅ Scraped & Imported: "${item.name}"`);
    console.log(`   Image: ${finalImage}`);
    count++;
  }

  console.log(`🏁 Done! Imported ${count} products.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});

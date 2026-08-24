import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/santechs";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["MACHINE", "SPARE_PART", "RAW_MATERIAL", "SERVICE"],
      default: "MACHINE",
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    type: { type: String, default: "MACHINE" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  },
  { strict: false }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

interface ExactCategory {
  name: string;
  slug: string;
  type: "MACHINE" | "SPARE_PART" | "RAW_MATERIAL" | "SERVICE";
  subcategories?: {
    name: string;
    slug: string;
  }[];
}

// ONLY AND EXACTLY WHAT IS IN Lists page.xlsx - NO MOCK DATA
const exactListFromExcel: ExactCategory[] = [
  // 1. Synthetic filament spinning machine
  {
    name: "Synthetic filament spinning machine",
    slug: "synthetic-filament-spinning-machine",
    type: "MACHINE",
    subcategories: [
      { name: "POY filament spinning machine", slug: "poy-filament-spinning-machine" },
      { name: "FDY filament spinning machine", slug: "fdy-filament-spinning-machine" },
      { name: "IDY filament spinning machine", slug: "idy-filament-spinning-machine" },
      { name: "Mother Yarn filament spinning machine", slug: "mother-yarn-filament-spinning-machine" },
      { name: "BCF Spinning filament spinning machine", slug: "bcf-spinning-filament-spinning-machine" },
      { name: "Bi-Component filament spinning machine", slug: "bi-component-filament-spinning-machine" },
      { name: "Low Melt Point filament spinning machine", slug: "low-melt-point-filament-spinning-machine" },
    ],
  },

  // 2. Non-Woven Machine
  {
    name: "Non-Woven Machine",
    slug: "non-woven-machine",
    type: "MACHINE",
    subcategories: [
      { name: "Spunbond", slug: "spunbond" },
      { name: "MeltBond", slug: "meltbond" },
      { name: "SMS", slug: "sms" },
      { name: "Needle Punching", slug: "needle-punching" },
      { name: "Spunlace", slug: "spunlace" },
      { name: "Thermal Bonding", slug: "thermal-bonding" },
      { name: "Chemical Bonding", slug: "chemical-bonding" },
      { name: "Wet Laid non-woven", slug: "wet-laid-non-woven" },
      { name: "Air Laid non-woven", slug: "air-laid-non-woven" },
    ],
  },

  // 3. STAPLE FIBER Spinning Plant
  {
    name: "STAPLE FIBER Spinning Plant",
    slug: "staple-fiber-spinning-plant",
    type: "MACHINE",
    subcategories: [
      { name: "Polyester Staple Fiber Production Line", slug: "polyester-staple-fiber-production-line" },
      { name: "High-Tenacity PSF Production Line", slug: "high-tenacity-psf-production-line" },
      { name: "ES Fiber Production Line", slug: "es-fiber-production-line" },
      { name: "Hollow Polyester Staple Fiber Production", slug: "hollow-polyester-staple-fiber-production" },
    ],
  },

  // 4. Plastic Extrusion Machines
  {
    name: "Plastic Extrusion Machines",
    slug: "plastic-extrusion-machines",
    type: "MACHINE",
    subcategories: [
      { name: "HDPE", slug: "hdpe" },
      { name: "LDPE", slug: "ldpe" },
      { name: "ABS", slug: "abs" },
      { name: "PVC", slug: "pvc" },
      { name: "PS", slug: "ps" },
      { name: "PET", slug: "pet" },
    ],
  },

  // 5. Spare Parts
  {
    name: "Spare Parts",
    slug: "spare-parts",
    type: "SPARE_PART",
    subcategories: [
      { name: "Dryer", slug: "dryer" },
      { name: "Extruder", slug: "extruder" },
      { name: "CPF", slug: "cpf" },
      { name: "Candles", slug: "candles" },
      { name: "Spinnerets", slug: "spinnerets" },
      { name: "Spin packs", slug: "spin-packs" },
      { name: "Spin Beams", slug: "spin-beams" },
      { name: "Metering Pumps", slug: "metering-pumps" },
      { name: "Quenching stacks", slug: "quenching-stacks" },
      { name: "Hot godet rollers", slug: "hot-godet-rollers" },
      { name: "cold godet rollers", slug: "cold-godet-rollers" },
      { name: "Intermingling nozzles", slug: "intermingling-nozzles" },
      { name: "Migration Nozzles", slug: "migration-nozzles" },
      { name: "Suction Guns", slug: "suction-guns" },
      { name: "Winders", slug: "winders" },
      { name: "Baling machine", slug: "baling-machine" },
      { name: "Drafter", slug: "drafter" },
    ],
  },

  // 6. DTY
  {
    name: "DTY",
    slug: "dty",
    type: "MACHINE",
  },

  // 7. ATY
  {
    name: "ATY",
    slug: "aty",
    type: "MACHINE",
  },

  // 8. Splitting Machine
  {
    name: "Splitting Machine",
    slug: "splitting-machine",
    type: "MACHINE",
  },

  // 9. Splitting Warping Machine
  {
    name: "Splitting Warping Machine",
    slug: "splitting-warping-machine",
    type: "MACHINE",
  },

  // 10. PET BOTTLE WASHING LINE
  {
    name: "PET BOTTLE WASHING LINE",
    slug: "pet-bottle-washing-line",
    type: "MACHINE",
  },

  // 11. Continuous Polymerization
  {
    name: "Continuous Polymerization",
    slug: "continuous-polymerization",
    type: "MACHINE",
  },

  // 12. Solid State Polymerization
  {
    name: "Solid State Polymerization",
    slug: "solid-state-polymerization",
    type: "MACHINE",
  },

  // 13. Extruder Palletising line
  {
    name: "Extruder Palletising line",
    slug: "extruder-palletising-line",
    type: "MACHINE",
  },

  // 14. Pilot Filament Spinning Machine
  {
    name: "Pilot Filament Spinning Machine",
    slug: "pilot-filament-spinning-machine",
    type: "MACHINE",
  },

  // 15. Pilot Polyester Chemical Recycling Plant
  {
    name: "Pilot Polyester Chemical Recycling Plant",
    slug: "pilot-polyester-chemical-recycling-plant",
    type: "MACHINE",
  },

  // 16. Lab Equipment
  {
    name: "Lab Equipment",
    slug: "lab-equipment",
    type: "MACHINE",
  },
];

async function seedExactExcel() {
  console.log("🔗 Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected successfully to Atlas.");

  console.log("🧹 Clearing all old/mock categories...");
  await Category.deleteMany({});

  const createdCategoryMap = new Map<string, mongoose.Types.ObjectId>();
  const createdSubCategoryMap = new Map<string, mongoose.Types.ObjectId>();

  console.log("\n📦 Inserting EXACT Categories & Sub-Categories from Lists page.xlsx...");

  for (let i = 0; i < exactListFromExcel.length; i++) {
    const item = exactListFromExcel[i];
    const rootCat = await Category.create({
      name: item.name,
      slug: item.slug,
      type: item.type,
      parent: null,
      isActive: true,
      order: i,
    });

    createdCategoryMap.set(item.slug, rootCat._id);
    console.log(`📁 [${item.type}] Category: ${item.name} (${item.slug})`);

    if (item.subcategories && item.subcategories.length > 0) {
      for (let j = 0; j < item.subcategories.length; j++) {
        const sub = item.subcategories[j];
        const subCat = await Category.create({
          name: sub.name,
          slug: sub.slug,
          type: item.type,
          parent: rootCat._id,
          isActive: true,
          order: j,
        });
        createdSubCategoryMap.set(sub.slug, subCat._id);
        console.log(`   ↳ [SUB-CATEGORY] ${sub.name} (${sub.slug})`);
      }
    }
  }

  console.log("\n🔄 Remapping existing Products...");
  const products = await Product.find({});

  const catFilament = createdCategoryMap.get("synthetic-filament-spinning-machine");
  const subPoy = createdSubCategoryMap.get("poy-filament-spinning-machine");
  const subFdy = createdSubCategoryMap.get("fdy-filament-spinning-machine");
  const catNonWoven = createdCategoryMap.get("non-woven-machine");
  const subSpunbond = createdSubCategoryMap.get("spunbond");
  const catDty = createdCategoryMap.get("dty");
  const catAty = createdCategoryMap.get("aty");
  const catExtrusion = createdCategoryMap.get("plastic-extrusion-machines");
  const subHdpe = createdSubCategoryMap.get("hdpe");
  const catParts = createdCategoryMap.get("spare-parts");
  const subGodet = createdSubCategoryMap.get("hot-godet-rollers");
  const catWashing = createdCategoryMap.get("pet-bottle-washing-line");
  const catStaple = createdCategoryMap.get("staple-fiber-spinning-plant");
  const subPsf = createdSubCategoryMap.get("polyester-staple-fiber-production-line");

  for (const prod of products) {
    const pName = (prod.name || "").toLowerCase();
    const pSlug = (prod.slug || "").toLowerCase();

    let targetCatId = catFilament;
    let targetSubCatId = subPoy;
    let targetType = "MACHINE";

    if (pName.includes("dty") || pSlug.includes("dty") || pName.includes("texturiz")) {
      targetCatId = catDty;
      targetSubCatId = undefined;
      targetType = "MACHINE";
    } else if (pName.includes("aty") || pSlug.includes("aty")) {
      targetCatId = catAty;
      targetSubCatId = undefined;
      targetType = "MACHINE";
    } else if (pName.includes("fdy") || pSlug.includes("fdy")) {
      targetCatId = catFilament;
      targetSubCatId = subFdy;
      targetType = "MACHINE";
    } else if (pName.includes("staple") || pName.includes("psf")) {
      targetCatId = catStaple;
      targetSubCatId = subPsf;
      targetType = "MACHINE";
    } else if (pName.includes("non-woven") || pName.includes("spunbond") || pName.includes("meltblown")) {
      targetCatId = catNonWoven;
      targetSubCatId = subSpunbond;
      targetType = "MACHINE";
    } else if (pName.includes("bottle") || pName.includes("washing")) {
      targetCatId = catWashing;
      targetSubCatId = undefined;
      targetType = "MACHINE";
    } else if (pName.includes("extru")) {
      targetCatId = catExtrusion;
      targetSubCatId = subHdpe;
      targetType = "MACHINE";
    } else if (pName.includes("godet") || pName.includes("part") || pName.includes("heater") || pName.includes("spindle")) {
      targetCatId = catParts;
      targetSubCatId = subGodet;
      targetType = "SPARE_PART";
    }

    await Product.findByIdAndUpdate(prod._id, {
      type: targetType,
      category: targetCatId,
      ...(targetSubCatId ? { subCategory: targetSubCatId } : { $unset: { subCategory: 1 } }),
    });
  }

  console.log(`✅ Remapped ${products.length} products to exact categories.`);
  console.log("\n🎉 Exact Taxonomy from Lists page.xlsx Seeded Successfully!");
  process.exit(0);
}

seedExactExcel().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});

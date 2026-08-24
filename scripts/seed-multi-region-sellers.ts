import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../lib/db/models/User.model";
import Company from "../lib/db/models/Company.model";
import Product from "../lib/db/models/Product.model";
import Category from "../lib/db/models/Category.model";
import { connectToDatabase } from "../lib/db/connection";
import { UserRole, UserStatus, ProductStatus, ProductCondition } from "../types";
import { getContinentFromCountry } from "../lib/utils/continent";

async function seedMultiRegionSellers() {
  console.log("\n============================================================");
  console.log("🌍 SEEDING MULTI-REGION SELLERS & SAME-CATEGORY PRODUCTS");
  console.log("============================================================\n");

  await connectToDatabase();

  // Find exact POY filament spinning machine subcategory
  let subCategory = await Category.findOne({
    parent: { $exists: true, $ne: null },
    name: { $regex: /POY filament spinning machine/i },
  }).populate("parent");

  if (!subCategory) {
    subCategory = await Category.findOne({
      parent: { $exists: true, $ne: null },
      name: { $regex: /spinning/i },
    }).populate("parent");
  }

  if (!subCategory) {
    console.error("❌ Target sub-category not found!");
    process.exit(1);
  }

  const parentCategory = subCategory.parent;

  console.log(`📌 Found Target Sub-Category: "${subCategory.name}" (ID: ${subCategory._id})`);
  console.log(`📌 Parent Category: "${(parentCategory as any)?.name}" (ID: ${(parentCategory as any)?._id})\n`);

  const hashedPassword = await bcrypt.hash("Password@123", 10);

  // Define 4 Regional Sellers
  const sellersData = [
    {
      name: "Rajesh Sharma",
      email: "seller.india@santechs.com",
      companyName: "Bharat Filament Tech Pvt Ltd",
      country: "India",
      state: "Gujarat",
      city: "Surat",
      phone: "+91 98765 43210",
      products: [
        {
          name: "High Speed POY Spinning Machine - Bharat 600",
          machineModel: "BFT-POY-600",
          price: 1850000,
          yearOfManufacture: 2022,
          condition: ProductCondition.EXCELLENT,
          images: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800"],
          referenceNumber: "SAN-IN-POY-01",
        },
        {
          name: "Microfiber POY Dual Beam Spinning Unit",
          machineModel: "BFT-MB-200",
          price: 2400000,
          yearOfManufacture: 2021,
          condition: ProductCondition.GOOD,
          images: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800"],
          referenceNumber: "SAN-IN-POY-02",
        },
      ],
    },
    {
      name: "Mehmet Demir",
      email: "seller.turkey@santechs.com",
      companyName: "Anatolia Synthetic Machinery AS",
      country: "Turkey",
      state: "Bursa",
      city: "Bursa",
      phone: "+90 224 123 4567",
      products: [
        {
          name: "Eurasia POY Filament Extrusion Line",
          machineModel: "ASM-POY-TURK",
          price: 2100000,
          yearOfManufacture: 2023,
          condition: ProductCondition.EXCELLENT,
          images: ["https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800"],
          referenceNumber: "SAN-TR-POY-01",
        },
      ],
    },
    {
      name: "Hans Mueller",
      email: "seller.germany@santechs.com",
      companyName: "Bavaria Precision Spinning GmbH",
      country: "Germany",
      state: "Bavaria",
      city: "Munich",
      phone: "+49 89 1234567",
      products: [
        {
          name: "German Engineered POY Filament Spinning Machine",
          machineModel: "BPS-GER-9000",
          price: 4500000,
          yearOfManufacture: 2020,
          condition: ProductCondition.REFURBISHED,
          images: ["https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800"],
          referenceNumber: "SAN-DE-POY-01",
        },
        {
          name: "Precision Take-up POY Spinning Extruder",
          machineModel: "BPS-EX-400",
          price: 3200000,
          yearOfManufacture: 2019,
          condition: ProductCondition.USED,
          images: ["https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800"],
          referenceNumber: "SAN-DE-POY-02",
        },
      ],
    },
    {
      name: "Michael Scott",
      email: "seller.usa@santechs.com",
      companyName: "Apex American Textile Machinery LLC",
      country: "USA",
      state: "North Carolina",
      city: "Charlotte",
      phone: "+1 704 555 0199",
      products: [
        {
          name: "Apex Super-Draw POY Continuous Spinning System",
          machineModel: "APX-POY-US1",
          price: 3900000,
          yearOfManufacture: 2022,
          condition: ProductCondition.EXCELLENT,
          images: ["https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800"],
          referenceNumber: "SAN-US-POY-01",
        },
      ],
    },
  ];

  for (const s of sellersData) {
    const continent = getContinentFromCountry(s.country) || "Asia";

    // 1. Create or Update User
    let user = await User.findOne({ email: s.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: s.name,
        email: s.email.toLowerCase(),
        password: hashedPassword,
        role: UserRole.SELLER,
        phone: s.phone,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
      });
      console.log(`✅ Created Seller Account: ${user.name} (${user.email})`);
    } else {
      user.status = UserStatus.ACTIVE;
      await user.save();
      console.log(`ℹ️ Updated Existing Seller Account: ${user.name} (${user.email})`);
    }

    // 2. Create or Update Company
    let company = await Company.findOne({ owner: user._id });
    if (!company) {
      company = await Company.create({
        owner: user._id,
        name: s.companyName,
        slug: s.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        email: s.email.toLowerCase(),
        phone: s.phone,
        address: {
          city: s.city,
          state: s.state,
          country: s.country,
        },
        isApproved: true,
        isVerified: true,
      });
      console.log(`   🏢 Company Created: ${company.name} [${s.country}, ${continent}]`);
    } else {
      company.isApproved = true;
      company.isVerified = true;
      company.address.country = s.country;
      company.address.city = s.city;
      company.address.state = s.state;
      await company.save();
      console.log(`   🏢 Company Updated: ${company.name} [${s.country}, ${continent}]`);
    }

    // Link company to user
    user.company = company._id as any;
    await user.save();

    // 3. Create Same Sub-Category Products
    for (const p of s.products) {
      let existingProd = await Product.findOne({ referenceNumber: p.referenceNumber });
      if (!existingProd) {
        existingProd = await Product.create({
          name: p.name,
          slug: `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
          referenceNumber: p.referenceNumber,
          machineModel: p.machineModel,
          category: (parentCategory as any)._id,
          subCategory: subCategory._id,
          seller: user._id,
          company: company._id,
          price: p.price,
          currency: "INR",
          yearOfManufacture: p.yearOfManufacture,
          condition: p.condition,
          status: ProductStatus.APPROVED,
          images: p.images,
          description: `${p.name} - high precision industrial textile machinery. Located in ${s.city}, ${s.country}.`,
          location: {
            city: s.city,
            state: s.state,
            country: s.country,
            continent: continent,
          },
          publishedAt: new Date(),
        });
        console.log(`      📦 Added Machine: "${(existingProd as any).name}" (${(existingProd as any).referenceNumber}) in ${s.country}`);
      } else {
        existingProd.seller = user._id;
        existingProd.company = company._id;
        existingProd.subCategory = subCategory._id;
        existingProd.category = (parentCategory as any)._id;
        existingProd.location.country = s.country;
        existingProd.location.continent = continent;
        existingProd.status = ProductStatus.APPROVED;
        await existingProd.save();
        console.log(`      📦 Updated Machine: "${(existingProd as any).name}" in ${s.country}`);
      }
    }
  }

  console.log("\n============================================================");
  console.log("🎉 SEEDING COMPLETE! Multi-Region Sellers and POY Machines Ready for Testing!");
  console.log("============================================================\n");

  await mongoose.disconnect();
}

seedMultiRegionSellers().catch(console.error);

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import mongoose from "mongoose";
import { connectToDatabase } from "../lib/db/connection";
import Product from "../lib/db/models/Product.model";
import { getContinentFromCountry } from "../lib/utils/continent";

async function backfillContinents() {
  console.log("\n============================================================");
  console.log("🌍 BACKFILLING PRODUCT CONTINENTS FOR GEOGRAPHIC ENGINE");
  console.log("============================================================\n");

  await connectToDatabase();

  const products = await Product.find();
  console.log(`📦 Found ${products.length} total products in database.`);

  let updatedCount = 0;

  for (const product of products) {
    const country = product.location?.country || "India";
    const resolvedContinent = getContinentFromCountry(country) || "Asia";

    if (!product.location?.continent || product.location.continent !== resolvedContinent) {
      if (!product.location) {
        product.location = {
          city: "Surat",
          state: "Gujarat",
          country: country,
          continent: resolvedContinent,
        };
      } else {
        product.location.continent = resolvedContinent;
        if (!product.location.country) {
          product.location.country = country;
        }
      }
      await product.save();
      updatedCount++;
      console.log(`   ✓ Updated "${product.name}" -> ${product.location.country} (${resolvedContinent})`);
    }
  }

  console.log(`\n🎉 Backfill complete! Updated ${updatedCount} products. 100% now have continent tags.`);
  console.log("============================================================\n");

  await mongoose.disconnect();
}

backfillContinents().catch(console.error);

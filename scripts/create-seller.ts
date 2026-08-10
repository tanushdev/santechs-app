import dotenv from "dotenv";
// Load environment variables from .env or .env.local
dotenv.config({ path: ".env.local" });
dotenv.config();

import { connectToDatabase } from "../lib/db/connection";
import User from "../lib/db/models/User.model";
import Company from "../lib/db/models/Company.model";
import Product from "../lib/db/models/Product.model";
import { UserRole, UserStatus } from "../types";
import bcrypt from "bcryptjs";

async function run() {
  console.log("🚀 Starting Seller Seeding Script...");
  try {
    await connectToDatabase();
    
    const email = "tanushshyam32@gmail.com";
    const password = "Sarita880";
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Find or create User
    let user = await User.findOne({ email, role: UserRole.SELLER });
    if (!user) {
      user = new User({
        name: "Tanush",
        email,
        password: hashedPassword,
        role: UserRole.SELLER,
        status: UserStatus.ACTIVE,
        phone: "+91 91676 55133",
      });
      await user.save();
      console.log(`✅ Created Seller user: ${email}`);
    } else {
      user.password = hashedPassword;
      user.status = UserStatus.ACTIVE;
      user.name = "Tanush";
      user.phone = "+91 91676 55133";
      await user.save();
      console.log(`✅ Updated existing Seller user password and settings: ${email}`);
    }

    // Find or create Company storefront
    let company = await Company.findOne({ owner: user._id });
    if (!company) {
      company = new Company({
        owner: user._id,
        name: "Tanush Textiles",
        slug: "tanush-textiles",
        description: "Premier supplier of machinery and logistics infrastructure on Santechs.",
        phone: "+91 91676 55133",
        email: email,
        address: {
          street: "Balaji Bhavan, Sector 11",
          city: "Cbd Belapur, Navi Mumbai",
          state: "Maharashtra",
          country: "India",
          pincode: "400614",
        },
        isApproved: true, // Auto approved!
        isVerified: true, // Auto verified!
        subscriptionTier: "FREE",
      });
      await company.save();
      console.log(`✅ Created approved company storefront: ${company.name}`);
    } else {
      company.name = "Tanush Textiles";
      company.isApproved = true;
      company.isVerified = true;
      await company.save();
      console.log(`✅ Restored approved status on company storefront: ${company.name}`);
    }

    // Link user to company
    user.company = company._id;
    await user.save();

    // Associate ALL products in the database to this seller and company
    console.log("🔄 Re-associating all products to the new seller...");
    const updateResult = await Product.updateMany(
      {},
      {
        seller: user._id,
        company: company._id,
        isVerifiedSeller: true,
      }
    );
    console.log(`✅ Successfully updated ${updateResult.modifiedCount} products!`);

    console.log("\n🎉 Seeding completed successfully!");
    console.log(`User email: ${email}`);
    console.log("Password: " + password);
    console.log("Role: SELLER");
    console.log("Status: APPROVED (ACTIVE)");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
    process.exit(1);
  }
}

run();

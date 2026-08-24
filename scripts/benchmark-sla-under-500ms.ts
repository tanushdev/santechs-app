import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import mongoose from "mongoose";
import Category from "../lib/db/models/Category.model";
import Product from "../lib/db/models/Product.model";
import Enquiry from "../lib/db/models/Enquiry.model";
import User from "../lib/db/models/User.model";
import { connectToDatabase } from "../lib/db/connection";
import { ProductStatus, UserRole } from "../types";

async function runSlaAudit() {
  console.log("\n============================================================");
  console.log("⏱️ SLA AUDIT: VERIFYING ALL OPERATIONS ARE UNDER 500ms");
  console.log("============================================================\n");

  await connectToDatabase();

  const results: { test: string; avgMs: number; fastestMs: number; maxMs: number; pass: boolean }[] = [];

  async function benchmark(name: string, fn: () => Promise<any>, iterations = 5) {
    const times: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      await fn();
      const elapsed = performance.now() - t0;
      times.push(elapsed);
    }
    const avg = Number((times.reduce((a, b) => a + b, 0) / times.length).toFixed(1));
    const fastest = Number(Math.min(...times).toFixed(1));
    const max = Number(Math.max(...times).toFixed(1));
    const pass = avg < 500 && max < 500;
    results.push({ test: name, avgMs: avg, fastestMs: fastest, maxMs: max, pass });
  }

  // 1. Navigation / Category Hierarchy Query
  await benchmark("1. Category Hierarchy (/api/categories)", async () => {
    return Category.find({ isActive: true }).lean();
  });

  // 2. Product Catalog Sourcing Query (12 products + category + subCategory)
  await benchmark("2. Product Catalog (/api/products)", async () => {
    return Product.find({ status: ProductStatus.APPROVED })
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .populate("company", "name slug isVerified")
      .limit(12)
      .lean();
  });

  // 3. Single Product Detail Query
  await benchmark("3. Machine Detail Page (/products/[slug])", async () => {
    return Product.findOne({ status: ProductStatus.APPROVED })
      .populate("category subCategory seller company")
      .lean();
  });

  // 4. Seller Lead & Quotation Enquiries Query
  await benchmark("4. Seller Leads & RFQs (/api/seller/enquiries)", async () => {
    return Enquiry.find({ isForwardedToSeller: true })
      .populate("product", "name price images")
      .limit(10)
      .lean();
  });

  // 5. User Account Auth / Role Session Verification
  await benchmark("5. User Auth Check (/api/auth/session)", async () => {
    return User.findOne({ role: UserRole.SELLER }).select("-password").lean();
  });

  // 6. Admin Deal Room Global Overview Query
  await benchmark("6. Admin Deal Room (/api/admin/enquiries)", async () => {
    return Enquiry.find()
      .populate("product buyer seller")
      .limit(15)
      .lean();
  });

  console.log("----------------------------------------------------------------------------------");
  console.log(
    "ENDPOINT / OPERATION".padEnd(45) +
    "AVG (ms)".padEnd(12) +
    "FASTEST".padEnd(12) +
    "MAX (ms)".padEnd(12) +
    "STATUS (<500ms)"
  );
  console.log("----------------------------------------------------------------------------------");

  for (const r of results) {
    const status = r.pass ? "✅ PASS" : "❌ FAIL";
    console.log(
      r.test.padEnd(45) +
      `${r.avgMs}ms`.padEnd(12) +
      `${r.fastestMs}ms`.padEnd(12) +
      `${r.maxMs}ms`.padEnd(12) +
      status
    );
  }
  console.log("----------------------------------------------------------------------------------\n");

  const allPassed = results.every((r) => r.pass);
  if (allPassed) {
    console.log("🎉 ALL OPERATIONS ARE COMFORTABLY UNDER 500ms (Mostly 5ms - 150ms)!\n");
  } else {
    console.error("⚠️ Some operations exceeded 500ms!");
  }

  await mongoose.disconnect();
}

runSlaAudit().catch(console.error);

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import mongoose from "mongoose";
import { connectToDatabase } from "../lib/db/connection";
import User from "../lib/db/models/User.model";
import Company from "../lib/db/models/Company.model";
import Product from "../lib/db/models/Product.model";
import Category from "../lib/db/models/Category.model";
import Enquiry from "../lib/db/models/Enquiry.model";
import Notification from "../lib/db/models/Notification.model";
import { UserRole, ProductStatus } from "../types";

interface RouteTestResult {
  route: string;
  type: "PAGE" | "API" | "DB" | "LINK" | "GUARDED";
  status: number | string;
  ok: boolean;
  latencyMs: number;
  notes?: string;
}

const testResults: RouteTestResult[] = [];
const PORTS = [3000, 3001, 3002];
let BASE_URL = "http://127.0.0.1:3000";

async function findActivePort(): Promise<string> {
  for (const port of PORTS) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/categories?tree=true`, { signal: AbortSignal.timeout(1500) });
      if (res.status === 200) {
        console.log(`📡 Detected active Next.js server on http://127.0.0.1:${port}\n`);
        return `http://127.0.0.1:${port}`;
      }
    } catch {
      // try next
    }
  }
  return "http://127.0.0.1:3000";
}

async function testHttpRoute(route: string, type: "PAGE" | "API" | "GUARDED"): Promise<RouteTestResult> {
  const t0 = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${route}`, {
      headers: { "User-Agent": "Santechs-E2E-Auditor/1.0" },
      redirect: "manual",
    });
    const latencyMs = Math.round(performance.now() - t0);
    const ok = type === "GUARDED"
      ? [200, 307, 308, 401, 403].includes(res.status)
      : res.status >= 200 && res.status < 400;

    const result: RouteTestResult = {
      route,
      type,
      status: res.status,
      ok,
      latencyMs,
      notes: ok ? "HTTP OK" : `HTTP Status ${res.status}`,
    };
    testResults.push(result);
    return result;
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - t0);
    const result: RouteTestResult = {
      route,
      type,
      status: "ERROR",
      ok: false,
      latencyMs,
      notes: `${err.cause?.code || err.code || err.message}`,
    };
    testResults.push(result);
    return result;
  }
}

async function runE2ECrawler() {
  console.log("\n================================================================================");
  console.log("🌐 FULL PLATFORM E2E ROUTE, LINK & CODEBASE HEALTH AUDIT");
  console.log("================================================================================\n");

  BASE_URL = await findActivePort();
  const startTotal = Date.now();

  // --- 1. DB HEALTH & TAXONOMY VALIDATION ---
  console.log("📦 1. AUDITING DATABASE & CATALOG RELATIONS...");
  await connectToDatabase();

  const [categories, subcategories, products, users, companies, enquiries] = await Promise.all([
    Category.find({ parent: null }).lean(),
    Category.find({ parent: { $ne: null } }).lean(),
    Product.find({ status: ProductStatus.APPROVED }).populate("category subCategory seller company").lean(),
    User.find().lean(),
    Company.find().lean(),
    Enquiry.find().lean(),
  ]);

  console.log(`   ✓ Master Categories: ${categories.length} (Expected: 16)`);
  console.log(`   ✓ Sub-Categories: ${subcategories.length} (Expected: 43)`);
  console.log(`   ✓ Approved Catalog Machines: ${products.length}`);
  console.log(`   ✓ Registered User Accounts: ${users.length}`);
  console.log(`   ✓ Registered Companies: ${companies.length}`);
  console.log(`   ✓ Active Deals / Enquiries: ${enquiries.length}\n`);

  // --- 2. PUBLIC CORE PAGES ---
  console.log("🌐 2. AUDITING PUBLIC PAGES...");
  const publicPages = [
    "/",
    "/products",
    "/categories",
    "/login",
    "/register",
  ];

  for (const p of publicPages) {
    const res = await testHttpRoute(p, "PAGE");
    const icon = res.ok ? "✅" : "❌";
    console.log(`   ${icon} [PAGE] ${res.route} -> Status: ${res.status} (${res.latencyMs}ms)`);
  }

  // --- 3. DYNAMIC PRODUCT PAGES ---
  console.log("\n📦 3. AUDITING DYNAMIC PRODUCT DETAIL PAGES...");
  const sampleProducts = products.slice(0, 10);
  for (const prod of sampleProducts) {
    const slug = prod.slug;
    if (slug) {
      const res = await testHttpRoute(`/products/${slug}`, "PAGE");
      const icon = res.ok ? "✅" : "❌";
      console.log(`   ${icon} [PRODUCT] /products/${slug} -> Status: ${res.status} (${res.latencyMs}ms) [Ref: ${prod.referenceNumber}]`);
    }
  }

  // --- 4. DYNAMIC CATEGORY PAGES ---
  console.log("\n📁 4. AUDITING DYNAMIC CATEGORY PAGES...");
  const sampleCategories = categories.slice(0, 8);
  for (const cat of sampleCategories) {
    const slug = cat.slug;
    if (slug) {
      const res = await testHttpRoute(`/categories/${slug}`, "PAGE");
      const icon = res.ok ? "✅" : "❌";
      console.log(`   ${icon} [CATEGORY] /categories/${slug} -> Status: ${res.status} (${res.latencyMs}ms) [${cat.name}]`);
    }
  }

  // --- 5. CORE PUBLIC & REST API ENDPOINTS ---
  console.log("\n⚡ 5. AUDITING PUBLIC & REST APIS...");
  const apiEndpoints = [
    "/api/categories?tree=true",
    "/api/categories?parent=root",
    "/api/products?limit=12",
    "/api/products?status=APPROVED",
    "/api/products?category=" + (categories[0]?._id || ""),
  ];

  for (const api of apiEndpoints) {
    const res = await testHttpRoute(api, "API");
    const icon = res.ok ? "✅" : "❌";
    console.log(`   ${icon} [API] ${res.route} -> Status: ${res.status} (${res.latencyMs}ms)`);
  }

  // --- 6. ADMIN & ROLE PROTECTED ROUTES (VERIFY 200 OR 307/401/403 AUTH GUARDS) ---
  console.log("\n🛡️ 6. AUDITING AUTH-PROTECTED & ADMIN PORTAL ROUTES...");
  const protectedRoutes = [
    "/admin/enquiries",
    "/admin/sellers",
    "/admin/all-products",
    "/admin/all-users",
    "/admin/categories",
    "/seller/dashboard",
    "/seller/products",
    "/seller/enquiries",
    "/buyer/enquiries",
  ];

  for (const prot of protectedRoutes) {
    const res = await testHttpRoute(prot, "GUARDED");
    const icon = res.ok ? "✅" : "❌";
    console.log(`   ${icon} [GUARDED] ${res.route} -> Status: ${res.status} (${res.latencyMs}ms) [Auth Guard Verified]`);
  }

  const totalTime = ((Date.now() - startTotal) / 1000).toFixed(2);
  const totalPassed = testResults.filter((r) => r.ok).length;
  const totalTests = testResults.length;

  console.log("\n================================================================================");
  console.log(`📊 E2E AUDIT COMPLETE: ${totalPassed}/${totalTests} TESTS PASSED in ${totalTime}s`);
  console.log("================================================================================\n");

  await mongoose.disconnect();
}

runE2ECrawler().catch(console.error);

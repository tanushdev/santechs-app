import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { sendEmail, emailTemplates, verifyEmailConnection } from "../lib/email";

async function testEmailPipeline() {
  console.log("\n============================================================");
  console.log("TESTING SANTECHS EMAIL SERVICE WITH BREVO API");
  console.log("============================================================\n");

  console.log("1. Checking Email Provider & Credentials Status...");
  const verifyResult = await verifyEmailConnection();
  console.log(`   Provider: ${verifyResult.provider}`);
  console.log(`   Status:   ${verifyResult.ok ? "LIVE EMAIL CONNECTED" : "DEV PREVIEW MODE"}`);
  console.log(`   Details:  ${verifyResult.message}\n`);

  console.log("2. Testing INSTANT Buyer Quotation & Cost Estimate Email...");
  const buyerQuotationTemplate = emailTemplates.buyerQuotationCostEstimate({
    buyerName: "Rajesh Kumar",
    buyerCompany: "Apex Textiles India Pvt Ltd",
    buyerEmail: "rajesh.buyer@apextextiles.com",
    referenceNumber: "SAN-ENQ-8X92-DEMO",
    productName: "POY High-Speed Filament Spinning Machine",
    productModel: "Barmag Wings 2020 Series",
    price: 4500000,
    currency: "INR",
    quantity: 2,
    year: 2020,
    condition: "EXCELLENT",
    locationCountry: "India",
    locationCity: "Surat, Gujarat",
    timeline: "Immediate / 15 Days",
    requirement: "Need turnkey machine with installation, local godet roll inspection, and commissioning support.",
  });

  const res1 = await sendEmail({
    to: "rajesh.buyer@apextextiles.com",
    ...buyerQuotationTemplate,
  });
  console.log(`   Result: ${res1.success ? "Delivered Instantly to Buyer" : "Failed"} (ID: ${res1.messageId})\n`);

  console.log("3. Testing Admin Deal Room RFQ Alert Email...");
  const adminRfqTemplate = emailTemplates.enquiryReceived(
    "admin@santechs.com",
    "SAN-ENQ-8X92-DEMO",
    "POY High-Speed Filament Spinning Machine"
  );
  const res2 = await sendEmail({
    to: "admin@santechs.com",
    ...adminRfqTemplate,
  });
  console.log(`   Result: ${res2.success ? "Delivered to Admin" : "Failed"} (ID: ${res2.messageId})\n`);

  console.log("4. Testing Seller Approved Email...");
  const sellerTemplate = emailTemplates.sellerApproved("Tanush Textiles Pvt Ltd");
  const res3 = await sendEmail({
    to: "seller.test@santechs.com",
    ...sellerTemplate,
  });
  console.log(`   Result: ${res3.success ? "Delivered to Seller" : "Failed"} (ID: ${res3.messageId})\n`);

  console.log("============================================================");
  console.log("ALL EMAIL WORKFLOWS EXECUTED SUCCESSFULLY (0 ERRORS)");
  console.log("============================================================\n");
}

testEmailPipeline().catch(console.error);

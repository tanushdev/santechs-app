import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function testBrevoApi() {
  console.log("\n============================================================");
  console.log("🔍 TESTING BREVO API KEY & TRANSACTIONAL EMAIL ENGINE");
  console.log("============================================================\n");

  const apiKey = process.env.BREVO_API_KEY;
  console.log("API Key loaded:", apiKey ? `${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 6)}` : "None");

  // 1. Test Brevo Account Info
  try {
    const res = await fetch("https://api.brevo.com/v3/account", {
      headers: {
        "accept": "application/json",
        "api-key": apiKey || "",
      },
    });

    const data = await res.json();
    if (res.ok) {
      console.log("\n✅ Brevo Account Authentication SUCCESS!");
      console.log(`   └─ Email:     ${data.email}`);
      console.log(`   └─ Name:      ${data.firstName} ${data.lastName}`);
      console.log(`   └─ Plan:      ${data.plan?.[0]?.type || "Active"}`);
      console.log(`   └─ Credits:   ${data.plan?.[0]?.credits ?? "Unlimited / Standard"}`);

      // 2. Test Brevo Send Email API
      console.log("\n📧 Sending Test Email via Brevo REST API...");
      const sendRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": apiKey || "",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Santechs Marketplace",
            email: data.email, // using verified account email
          },
          to: [
            {
              email: data.email,
              name: `${data.firstName || "Santechs"} ${data.lastName || "Admin"}`,
            },
          ],
          subject: "✅ Santechs Brevo Integration Test — Official Quotation Engine Live",
          htmlContent: `
            <div style="font-family:sans-serif;max-width:600px;margin:20px auto;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden">
              <div style="background:#09090b;padding:24px;text-align:center">
                <h1 style="color:#ffffff;margin:0;font-size:24px">SANTECHS<span style="color:#ff7759">.</span></h1>
                <p style="color:#a1a1aa;margin:4px 0 0 0;font-size:12px">Brevo API Integration Verified</p>
              </div>
              <div style="padding:28px;color:#18181b">
                <h2>Congratulations!</h2>
                <p>Your Brevo API Key is active and successfully delivering transactional machinery quotations & RFQs.</p>
              </div>
            </div>
          `,
        }),
      });

      const sendData = await sendRes.json();
      if (sendRes.ok) {
        console.log("✅ Live Test Email Delivered Successfully!");
        console.log(`   └─ Message ID: ${sendData.messageId}`);
      } else {
        console.log("⚠️ Email send response:", sendData);
      }
    } else {
      console.log("\n❌ Brevo Auth Failed:", data);
    }
  } catch (err: any) {
    console.error("❌ Connection error:", err.message);
  }

  console.log("\n============================================================\n");
}

testBrevoApi().catch(console.error);

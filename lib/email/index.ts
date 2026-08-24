import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

function getBrevoApiKey(): string | null {
  const key = process.env.BREVO_API_KEY;
  if (key && !key.includes("your_") && !key.includes("replace") && key.startsWith("xkeysib-")) {
    return key;
  }
  return null;
}

function isConfigured(): boolean {
  if (getBrevoApiKey()) return true;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASSWORD || "";
  const host = process.env.SMTP_HOST || "";
  if (!user || !pass || !host) return false;
  if (user.includes("your") || pass.includes("your") || pass.includes("replace")) return false;
  return true;
}

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function verifyEmailConnection(): Promise<{ ok: boolean; message: string; provider: string }> {
  const brevoKey = getBrevoApiKey();
  if (brevoKey) {
    try {
      const res = await fetch("https://api.brevo.com/v3/account", {
        headers: { "accept": "application/json", "api-key": brevoKey },
      });
      if (res.ok) {
        const acc = await res.json();
        return {
          ok: true,
          provider: "Brevo (Sendinblue) API v3",
          message: `Connected to Brevo account: ${acc.email} (${acc.plan?.[0]?.type || "Active Plan"})`,
        };
      }
    } catch (err: any) {
      return { ok: false, provider: "Brevo API", message: `Brevo check failed: ${err.message}` };
    }
  }

  if (!isConfigured()) {
    return {
      ok: false,
      message: "SMTP is in Development Simulation Mode (placeholder credentials in .env.local). Live emails will be previewed in console.",
      provider: "Dev Simulation",
    };
  }

  try {
    const transporter = getTransporter();
    await transporter.verify();
    return { ok: true, message: `SMTP connection verified with ${process.env.SMTP_HOST}`, provider: "SMTP Relay" };
  } catch (error: any) {
    return { ok: false, message: `SMTP verification failed: ${error.message}`, provider: "SMTP Relay" };
  }
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const recipients = Array.isArray(to) ? to : [to];
  const plainText = text ?? html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const brevoKey = getBrevoApiKey();

  // 1. Send via Brevo REST API if configured
  if (brevoKey) {
    try {
      const senderEmail = process.env.SMTP_USER && !process.env.SMTP_USER.includes("your")
        ? process.env.SMTP_USER
        : "tanushshyam32@gmail.com";

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": brevoKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Santechs Marketplace",
            email: senderEmail,
          },
          to: recipients.map((r) => ({ email: r.trim() })),
          subject,
          htmlContent: html,
          textContent: plainText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`[EMAIL DELIVERY SUCCESS] Brevo API -> ${recipients.join(", ")} (ID: ${data.messageId})`);
        return { success: true, messageId: data.messageId, isSimulated: false, provider: "Brevo" };
      } else {
        console.error("[EMAIL DELIVERY ERROR] Brevo API:", data);
      }
    } catch (err: any) {
      console.error("[EMAIL DELIVERY ERROR] Brevo HTTP:", err.message);
    }
  }

  // 2. Fallback to Nodemailer SMTP
  if (isConfigured()) {
    try {
      const transporter = getTransporter();
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM ?? "Santechs Marketplace <noreply@santechs.com>",
        to: recipients.join(", "),
        subject,
        html,
        text: plainText,
      });

      console.log(`[EMAIL DELIVERY SUCCESS] SMTP -> ${recipients.join(", ")} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, isSimulated: false, provider: "SMTP" };
    } catch (error: any) {
      console.error("[EMAIL DELIVERY ERROR] SMTP:", error.message);
    }
  }

  // 3. Dev Simulation Mode
  console.log("\n============================================================");
  console.log("[EMAIL SERVICE - SIMULATION DEV MODE]");
  console.log(`   To:      ${recipients.join(", ")}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Preview: ${plainText.substring(0, 140)}...`);
  console.log("============================================================\n");

  return { success: true, messageId: `simulated-${Date.now()}`, isSimulated: true, provider: "Simulation" };
}

const brandHeader = `
  <div style="background:#09090b;padding:32px 28px;text-align:center;border-top-left-radius:16px;border-top-right-radius:16px">
    <div style="display:inline-block;padding:6px 14px;background:#18181b;border:1px solid #27272a;border-radius:20px;margin-bottom:12px">
      <span style="color:#ff7759;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;font-family:system-ui,-apple-system,sans-serif">
        Verified Machinery Exchange
      </span>
    </div>
    <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:900;letter-spacing:-0.5px;font-family:system-ui,-apple-system,sans-serif">
      SANTECHS<span style="color:#ff7759">.</span>
    </h1>
    <p style="color:#a1a1aa;margin:6px 0 0 0;font-size:12px;font-family:system-ui,-apple-system,sans-serif">
      Global Industrial Equipment &amp; Raw Materials Trading Network
    </p>
  </div>
`;

const brandFooter = `
  <div style="background:#f4f4f5;padding:24px 28px;text-align:center;border-bottom-left-radius:16px;border-bottom-right-radius:16px;border-top:1px solid #e4e4e7">
    <p style="color:#52525b;margin:0 0 8px 0;font-size:12px;font-weight:600;font-family:system-ui,-apple-system,sans-serif">
      Santechs Industrial Marketplace · Deal Routing &amp; Escrow Services
    </p>
    <p style="color:#71717a;margin:0;font-size:11px;line-height:1.5;font-family:system-ui,-apple-system,sans-serif">
      This is an official transactional message. For assistance, contact our engineering desk at 
      <a href="mailto:support@santechs.com" style="color:#ff7759;font-weight:600;text-decoration:none">support@santechs.com</a>
    </p>
  </div>
`;

export interface QuotationEmailData {
  buyerName: string;
  buyerCompany: string;
  buyerEmail: string;
  referenceNumber: string;
  productName: string;
  productModel?: string;
  categoryName?: string;
  subCategoryName?: string;
  price?: number;
  currency?: string;
  quantity?: number | string;
  year?: number;
  condition?: string;
  locationCountry?: string;
  locationCity?: string;
  timeline?: string;
  requirement?: string;
}

// Email Templates with State-of-the-Art B2B Aesthetics
export const emailTemplates = {
  // 1. Instant Official Buyer Quotation & Cost Breakdown Email
  buyerQuotationCostEstimate: (data: QuotationEmailData) => {
    const formattedPrice = data.price && data.price > 0
      ? `${data.currency || "INR"} ${data.price.toLocaleString("en-IN")}`
      : "Custom Quote on Inspection / Request";

    const qty = data.quantity || "1 Unit";
    const totalEstimate = data.price && data.price > 0 && typeof data.quantity === "number"
      ? `${data.currency || "INR"} ${(data.price * data.quantity).toLocaleString("en-IN")}`
      : formattedPrice;

    return {
      subject: `Official Quotation & Cost Estimate — ${data.productName} [Ref: ${data.referenceNumber}]`,
      html: `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:620px;margin:20px auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05)">
          ${brandHeader}
          <div style="padding:32px 28px;color:#18181b">
            
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e4e4e7;padding-bottom:16px;margin-bottom:20px">
              <div>
                <p style="margin:0;font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.5px">Quotation Reference</p>
                <p style="margin:2px 0 0 0;font-size:16px;font-weight:800;color:#09090b;font-family:monospace">${data.referenceNumber}</p>
              </div>
            </div>

            <h2 style="font-size:20px;font-weight:800;margin:0 0 8px 0;color:#09090b">
              Dear ${data.buyerName || "Valued Client"},
            </h2>
            <p style="font-size:14px;line-height:1.6;color:#3f3f46;margin:0 0 24px 0">
              Thank you for submitting your Request for Quotation (RFQ) on Santechs Marketplace. Below is your official cost estimate and machinery specification summary for <strong>${data.buyerCompany || "your enterprise"}</strong>.
            </p>

            <!-- Cost Summary Box -->
            <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:12px;padding:20px;margin-bottom:24px">
              <p style="margin:0 0 12px 0;font-size:12px;font-weight:800;color:#09090b;text-transform:uppercase;letter-spacing:0.5px">
                Quotation &amp; Pricing Breakdown
              </p>
              <table style="width:100%;border-collapse:collapse;font-size:13px">
                <tr style="border-bottom:1px dashed #e4e4e7">
                  <td style="padding:8px 0;color:#71717a">Target Machine</td>
                  <td style="padding:8px 0;font-weight:700;color:#09090b;text-align:right">${data.productName}</td>
                </tr>
                <tr style="border-bottom:1px dashed #e4e4e7">
                  <td style="padding:8px 0;color:#71717a">Unit Price Estimate</td>
                  <td style="padding:8px 0;font-weight:700;color:#09090b;text-align:right">${formattedPrice}</td>
                </tr>
                <tr style="border-bottom:1px dashed #e4e4e7">
                  <td style="padding:8px 0;color:#71717a">Quantity Requested</td>
                  <td style="padding:8px 0;font-weight:700;color:#09090b;text-align:right">${qty}</td>
                </tr>
                <tr style="border-bottom:1px solid #d4d4d8">
                  <td style="padding:10px 0;color:#09090b;font-weight:800;font-size:14px">Estimated Machinery Subtotal</td>
                  <td style="padding:10px 0;font-weight:900;color:#ff7759;font-size:15px;text-align:right">${totalEstimate}</td>
                </tr>
              </table>
              <p style="margin:10px 0 0 0;font-size:11px;color:#71717a;line-height:1.4">
                * Final landing cost may include regional taxes, custom disassembly/loading, and transit insurance based on your destination port.
              </p>
            </div>

            <!-- Technical Specification Summary -->
            <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:20px;margin-bottom:24px">
              <p style="margin:0 0 12px 0;font-size:12px;font-weight:800;color:#09090b;text-transform:uppercase;letter-spacing:0.5px">
                Technical Specifications &amp; Location
              </p>
              <table style="width:100%;border-collapse:collapse;font-size:13px">
                ${data.productModel ? `<tr style="border-bottom:1px solid #f4f4f5"><td style="padding:6px 0;color:#71717a;width:40%">Model / Series</td><td style="padding:6px 0;font-weight:600;color:#09090b">${data.productModel}</td></tr>` : ""}
                ${data.year ? `<tr style="border-bottom:1px solid #f4f4f5"><td style="padding:6px 0;color:#71717a">Year of Manufacture</td><td style="padding:6px 0;font-weight:600;color:#09090b">${data.year}</td></tr>` : ""}
                ${data.condition ? `<tr style="border-bottom:1px solid #f4f4f5"><td style="padding:6px 0;color:#71717a">Machine Condition</td><td style="padding:6px 0;font-weight:600;color:#09090b">${data.condition}</td></tr>` : ""}
                ${data.locationCountry ? `<tr style="border-bottom:1px solid #f4f4f5"><td style="padding:6px 0;color:#71717a">Origin Location</td><td style="padding:6px 0;font-weight:600;color:#09090b">${data.locationCity ? `${data.locationCity}, ` : ""}${data.locationCountry}</td></tr>` : ""}
                ${data.timeline ? `<tr style="border-bottom:1px solid #f4f4f5"><td style="padding:6px 0;color:#71717a">Target Delivery Timeline</td><td style="padding:6px 0;font-weight:600;color:#09090b">${data.timeline}</td></tr>` : ""}
              </table>
            </div>

            <!-- Next Steps Guidance -->
            <div style="border-left:3px solid #09090b;padding-left:16px;margin-bottom:28px">
              <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#09090b">What happens next?</p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:#52525b">
                Our technical team is reviewing geographic routing and freight availability. A verified machine specialist will contact you with inspection slots and negotiated terms.
              </p>
            </div>

            <!-- Action Button -->
            <div style="text-align:center;margin:32px 0 12px 0">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/buyer/quotes" 
                 style="display:inline-block;background:#09090b;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:10px;font-weight:700;font-size:13px;letter-spacing:0.3px;box-shadow:0 2px 8px rgba(0,0,0,0.15)">
                Track My Quotations in Portal &rarr;
              </a>
            </div>

          </div>
          ${brandFooter}
        </div>
      `,
    };
  },

  // 2. Admin Alert: New RFQ Received
  enquiryReceived: (adminEmail: string, enquiryRef: string, productName: string) => ({
    subject: `[Admin Alert] New RFQ: [${enquiryRef}] — ${productName}`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:20px auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden">
        ${brandHeader}
        <div style="padding:32px 24px;color:#18181b">
          <h2 style="font-size:18px;font-weight:800;margin:0 0 16px 0;color:#09090b">New Buyer Quotation Request</h2>
          <div style="background:#f4f4f5;border-radius:10px;padding:16px;margin-bottom:24px">
            <table style="width:100%;border-collapse:collapse;font-size:13px">
              <tr>
                <td style="padding:6px 0;color:#71717a;width:120px">RFQ Reference</td>
                <td style="padding:6px 0;font-weight:800;color:#09090b;font-family:monospace">${enquiryRef}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#71717a">Target Machine</td>
                <td style="padding:6px 0;font-weight:700;color:#09090b">${productName}</td>
              </tr>
            </table>
          </div>
          <div style="text-align:center;margin:24px 0">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/enquiries" 
               style="display:inline-block;background:#ff7759;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px">
              Open Deals Room &amp; Assign Seller &rarr;
            </a>
          </div>
        </div>
        ${brandFooter}
      </div>
    `,
  }),

  // 3. Seller Approval
  sellerApproved: (sellerName: string) => ({
    subject: "Your Santechs Seller Account Has Been Approved",
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:20px auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden">
        ${brandHeader}
        <div style="padding:32px 24px;color:#18181b">
          <h2 style="font-size:20px;font-weight:800;margin:0 0 16px 0;color:#09090b">Welcome to Santechs, ${sellerName}!</h2>
          <p style="font-size:14px;line-height:1.6;color:#3f3f46;margin:0 0 20px 0">
            Your seller application has been approved. You now have full clearance to publish industrial machinery listings and receive direct RFQ buyer leads.
          </p>
          <div style="text-align:center;margin:28px 0">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/seller/dashboard" 
               style="display:inline-block;background:#09090b;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px">
              Access Seller Dashboard &rarr;
            </a>
          </div>
        </div>
        ${brandFooter}
      </div>
    `,
  }),

  // 4. Seller Rejection
  sellerRejected: (sellerName: string, reason: string) => ({
    subject: "Santechs Seller Application Status Update",
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:20px auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden">
        ${brandHeader}
        <div style="padding:32px 24px;color:#18181b">
          <h2 style="font-size:18px;font-weight:800;margin:0 0 16px 0;color:#09090b">Application Review Notice</h2>
          <p style="font-size:14px;line-height:1.6;color:#3f3f46;margin:0 0 16px 0">
            Hello ${sellerName}, our compliance desk reviewed your seller profile and requires updates before activation.
          </p>
          <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;margin:20px 0;border-radius:4px">
            <p style="margin:0;font-size:13px;color:#991b1b"><strong>Reason:</strong> ${reason}</p>
          </div>
        </div>
        ${brandFooter}
      </div>
    `,
  }),

  // 5. Product Approved
  productApproved: (sellerName: string, productName: string, productUrl: string) => ({
    subject: `Listing Published: "${productName}" is Live`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:20px auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden">
        ${brandHeader}
        <div style="padding:32px 24px;color:#18181b">
          <h2 style="font-size:18px;font-weight:800;margin:0 0 16px 0;color:#09090b">Machine Listing Live on Marketplace</h2>
          <p style="font-size:14px;line-height:1.6;color:#3f3f46;margin:0 0 20px 0">
            Hello ${sellerName}, your listing <strong>"${productName}"</strong> has been approved and is now live for buyers.
          </p>
          <div style="text-align:center;margin:28px 0">
            <a href="${productUrl}" 
               style="display:inline-block;background:#ff7759;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px">
              View Published Listing &rarr;
            </a>
          </div>
        </div>
        ${brandFooter}
      </div>
    `,
  }),
};

import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const mailOptions = {
    from: process.env.EMAIL_FROM ?? "Santechs <noreply@santechs.com>",
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]*>/g, ""),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email failed (handled gracefully):", error);
    return { success: false, error };
  }
}

// Email Templates
export const emailTemplates = {
  sellerApproved: (sellerName: string) => ({
    subject: "Your Santechs seller account has been approved!",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0f172a;padding:24px;text-align:center">
          <h1 style="color:#f97316;margin:0">Santechs</h1>
        </div>
        <div style="padding:32px">
          <h2>Congratulations, ${sellerName}!</h2>
          <p>Your seller account has been approved. You can now start listing your products on Santechs marketplace.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/dashboard" 
             style="display:inline-block;background:#f97316;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:16px">
            Go to Dashboard
          </a>
        </div>
      </div>
    `,
  }),

  sellerRejected: (sellerName: string, reason: string) => ({
    subject: "Santechs seller application update",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0f172a;padding:24px;text-align:center">
          <h1 style="color:#f97316;margin:0">Santechs</h1>
        </div>
        <div style="padding:32px">
          <h2>Hi ${sellerName},</h2>
          <p>We reviewed your seller application and unfortunately it was not approved at this time.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Please update your information and reapply, or contact us for more details.</p>
        </div>
      </div>
    `,
  }),

  productApproved: (sellerName: string, productName: string, productUrl: string) => ({
    subject: `Your listing "${productName}" is now live!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0f172a;padding:24px;text-align:center">
          <h1 style="color:#f97316;margin:0">Santechs</h1>
        </div>
        <div style="padding:32px">
          <h2>Hi ${sellerName}!</h2>
          <p>Your product <strong>${productName}</strong> has been approved and is now live on the marketplace.</p>
          <a href="${productUrl}" 
             style="display:inline-block;background:#f97316;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:16px">
            View Listing
          </a>
        </div>
      </div>
    `,
  }),

  enquiryReceived: (adminEmail: string, enquiryRef: string, productName: string) => ({
    subject: `New Enquiry ${enquiryRef} — ${productName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0f172a;padding:24px;text-align:center">
          <h1 style="color:#f97316;margin:0">Santechs</h1>
        </div>
        <div style="padding:32px">
          <h2>New Buyer Enquiry</h2>
          <p>Reference: <strong>${enquiryRef}</strong></p>
          <p>Product: <strong>${productName}</strong></p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/enquiries" 
             style="display:inline-block;background:#f97316;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:16px">
            View in Dashboard
          </a>
        </div>
      </div>
    `,
  }),
};

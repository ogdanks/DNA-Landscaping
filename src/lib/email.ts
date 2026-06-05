import { Resend } from "resend";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY || "re_test");

export async function sendInvoiceEmail({
  to,
  invoiceId,
  customerName,
  amount,
  invoiceUrl,
}: {
  to: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  invoiceUrl: string;
}) {
  try {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

    const { data, error } = await resend.emails.send({
      from: "Your Landscaping Company <onboarding@resend.dev>",
      to: [to],
      subject: `Invoice #${invoiceId} - Payment Request`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Invoice #${invoiceId}</h1>
          
          <p>Hi ${customerName},</p>
          
          <p>Thank you for your business! Your invoice is ready.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin: 0; color: #333;">Amount Due: ${formattedAmount}</h2>
          </div>
          
          <p style="margin: 30px 0;">
            <a href="${invoiceUrl}" 
               style="background-color: #0070f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View & Pay Invoice
            </a>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            ${invoiceUrl}
          </p>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            Questions? Reply to this email or contact us.<br>
            Invoice #${invoiceId}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send email" 
    };
  }
}

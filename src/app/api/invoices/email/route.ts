import { NextRequest, NextResponse } from "next/server";
import { sendInvoiceEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, to, customerName, amount } = body;

    if (!invoiceId || !to) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get invoice URL
    const invoiceUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/invoices/${invoiceId}`;

    // Send email
    const result = await sendInvoiceEmail({
      to,
      invoiceId,
      customerName: customerName || "Customer",
      amount: amount || 0,
      invoiceUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Update invoice status to "sent"
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "sent" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}

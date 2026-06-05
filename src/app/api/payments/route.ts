import { NextRequest, NextResponse } from "next/server";
import Square from "square";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Payment request body:", body);

    const { cardNumber, expiry, cvv, postalCode, amount, invoiceId, sandbox } = body;

    if (!cardNumber || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sandbox mode - mock payment
    if (sandbox === true) {
      console.log("Sandbox payment successful");
      return NextResponse.json({
        success: true,
        message: "Payment successful (sandbox)",
        paymentId: `pay_${Date.now()}`
      });
    }

    // PRODUCTION: Use Square API
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;

    if (!locationId || !accessToken) {
      return NextResponse.json(
        { success: false, error: "Square credentials not configured. Please set SQUARE_ACCESS_TOKEN in .env.local" },
        { status: 500 }
      );
    }

    // Initialize Square Payments API
    const paymentsApi = new Square.PaymentsApi();

    // Convert dollars to cents
    const amountInCents = Math.round(amount * 100);

    // In production, you would:
    // 1. Use Square's Web Payments SDK on the frontend to tokenize the card
    // 2. Send the nonce to this backend endpoint
    // 3. Call Square's API with the nonce
    
    // For now, this is a placeholder - you need to integrate Square Web Payments SDK
    return NextResponse.json(
      { 
        success: false, 
        error: "Square integration requires Web Payments SDK. See documentation at: https://developer.squareup.com/docs/web/payments-web" 
      },
      { status: 501 }
    );

  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

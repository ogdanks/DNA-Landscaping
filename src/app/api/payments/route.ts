import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { cardNumber, amount, sandbox } = body;

    if (!cardNumber || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sandbox mode - mock payment
    if (sandbox === true) {
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

    // Production Square integration is not yet wired up. The full flow would:
    // 1. Use Square's Web Payments SDK on the frontend to tokenize the card.
    // 2. Send the resulting nonce to this endpoint.
    // 3. Call the Square Payments API (paymentsApi.createPayment) with the nonce and amount.
    return NextResponse.json(
      {
        success: false,
        error: "Square integration requires the Web Payments SDK. See https://developer.squareup.com/docs/web/payments-web",
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

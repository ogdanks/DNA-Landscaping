# Going Live with Square Payments

## Step 1: Get Production Square Credentials

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Select your app (or create a new one)
3. Click on the "Credentials" tab
4. **Switch from Sandbox to Production**:
   - Click "Sandbox" in the top right
   - Select "Production"
   - You'll see new credentials

## Step 2: Copy Your Production Credentials

You need these three values:

1. **Application ID** (starts with `sq0idp-`)
2. **Location ID** (starts with `L...`)
3. **Access Token** (long string starting with `EAAAl...`)

## Step 3: Update .env.local

Replace the sandbox credentials with production:

```bash
# Square Payments Configuration - PRODUCTION
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-YOUR-PRODUCTION-APP-ID
NEXT_PUBLIC_SQUARE_LOCATION_ID=YOUR-PRODUCTION-LOCATION-ID

# Production access token (keep this secret!)
SQUARE_ACCESS_TOKEN=EAAAl-your-production-access-token-here
```

## Step 4: Integrate Square Web Payments SDK

### Frontend (Add to your invoices page):

1. Add Square SDK to your layout.tsx:

```html
<script src="https://web.squareup.com/v1/square.js"></script>
```

2. Initialize Square payments:

```typescript
const square = await loadSquare();
const payments = square.payments(process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID);
const card = await payments.card();
await card.attach('#card-container');
```

3. On payment submit:

```typescript
const result = await card.tokenize();
if (result.status === 'OK') {
  const nonce = result.token;
  // Send nonce to backend
  await fetch('/api/payments', {
    method: 'POST',
    body: JSON.stringify({ nonce, amount })
  });
}
```

### Backend (Update API route):

The API should accept the nonce and call Square's Payments API:

```typescript
const paymentsApi = new Square.PaymentsApi();
const body = {
  sourceId: nonce,
  idempotencyKey: uniqueKey,
  amountMoney: {
    amount: amountInCents,
    currency: 'USD'
  }
};
const result = await paymentsApi.charge(body);
```

## Step 5: Test in Production

1. Use real test cards from Square:
   - Card: `4111111111111111`
   - Expiry: Any future date
   - CVV: Any 3 digits
   - Postal: Any 5 digits

2. Small real transaction test (optional):
   - Charge $1.00 to verify everything works
   - Refund it immediately

## Step 6: Go Live!

1. Remove `sandbox === true` check from your API
2. Ensure all production credentials are set
3. Test with real card (small amount)
4. Start accepting real payments!

## Important Notes

- **Security**: Never commit `SQUARE_ACCESS_TOKEN` to git
- **Environment Variables**: Keep production credentials in `.env.local` only
- **HTTPS**: Production requires HTTPS (localhost works for testing)
- **Webhooks**: Consider setting up webhooks for payment notifications
- **PCI Compliance**: Using Square's SDK handles most PCI compliance

## Resources

- [Square Web Payments Docs](https://developer.squareup.com/docs/web/payments-web)
- [Square API Reference](https://developer.squareup.com/reference/square/payments-api/overview)
- [Production Checklist](https://developer.squareup.com/docs/production-checklist)

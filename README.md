# Stripe Connect Functions Demo

A simple Node.js application demonstrating how to use the Stripe SDK with Connect Functions to trigger payouts to connected accounts.

## Features

- 🔗 Stripe Connect integration
- 💰 Trigger payouts to connected accounts
- 📊 Check connected account balances
- 📋 List recent payouts
- 🌐 Simple Express API endpoints
- 🔒 Environment variable configuration

## Prerequisites

- Node.js (version 14 or higher)
- A Stripe account with Connect enabled
- At least one connected account for testing

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Update the `.env` file with your Stripe credentials:**
   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   CONNECTED_ACCOUNT_ID=acct_your_connected_account_id_here
   ```

## Usage

### Running the Demo

```bash
npm start
```

This will:
- Start an Express server on port 3000
- Run a demo that shows account balance and recent payouts
- Display available API endpoints

### API Endpoints

- `GET /health` - Health check
- `GET /balance/:accountId` - Get connected account balance
- `POST /payout` - Create a payout
- `GET /payouts/:accountId` - List recent payouts

### Creating a Payout

To create a payout via API:

```bash
curl -X POST http://localhost:3000/payout \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "usd",
    "connectedAccountId": "acct_your_connected_account_id"
  }'
```

### Development

```bash
npm run dev
```

This uses nodemon for automatic restart on file changes.

## Key Stripe Connect Functions

### 1. Creating Payouts

```javascript
const payout = await stripe.payouts.create({
  amount: 1000, // $10.00 in cents
  currency: 'usd',
  method: 'instant', // or 'standard'
}, {
  stripeAccount: connectedAccountId, // This is the key for Connect Functions
});
```

### 2. Getting Account Balance

```javascript
const balance = await stripe.balance.retrieve({
  stripeAccount: connectedAccountId,
});
```

### 3. Listing Payouts

```javascript
const payouts = await stripe.payouts.list({
  limit: 10,
}, {
  stripeAccount: connectedAccountId,
});
```

## Important Notes

- **Test Mode**: Make sure to use test API keys and test connected accounts during development
- **Balance Requirements**: Payouts require sufficient balance in the connected account
- **Payout Methods**: 
  - `instant` - Faster but may have fees
  - `standard` - Takes 1-2 business days but typically free
- **Error Handling**: The app includes comprehensive error handling for common issues

## Security

- Never commit your `.env` file to version control
- Use environment variables for all sensitive data
- In production, use secure methods to store and access API keys

## Common Issues

1. **Invalid Account ID**: Make sure the connected account ID is correct and properly formatted
2. **Insufficient Balance**: Ensure the connected account has enough balance for payouts
3. **Account Configuration**: Verify that the connected account is properly configured for payouts

## License

MIT
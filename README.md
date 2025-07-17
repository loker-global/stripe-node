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
- `GET /transactions/:accountId` - List recent transactions

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

### Getting Account Balance

To get the balance of a connected account:

```bash
curl -X GET http://localhost:3000/balance/acct_your_connected_account_id
```

Example response:
```json
{
  "object": "balance",
  "available": [
    {
      "amount": 5000,
      "currency": "usd",
      "source_types": {
        "card": 5000
      }
    }
  ],
  "connect_reserved": [
    {
      "amount": 0,
      "currency": "usd"
    }
  ],
  "livemode": false,
  "pending": [
    {
      "amount": 1000,
      "currency": "usd",
      "source_types": {
        "card": 1000
      }
    }
  ]
}
```

### Listing Payouts

To list recent payouts for a connected account:

```bash
curl -X GET http://localhost:3000/payouts/acct_your_connected_account_id
```

You can also specify a limit (default is 5):

```bash
curl -X GET http://localhost:3000/payouts/acct_your_connected_account_id?limit=10
```

Example response:
```json
{
  "object": "list",
  "data": [
    {
      "id": "po_1234567890abcdef",
      "object": "payout",
      "amount": 1000,
      "arrival_date": 1642636800,
      "automatic": false,
      "balance_transaction": "txn_1234567890abcdef",
      "created": 1642636800,
      "currency": "usd",
      "description": null,
      "destination": "ba_1234567890abcdef",
      "failure_code": null,
      "failure_message": null,
      "livemode": false,
      "metadata": {},
      "method": "standard",
      "source_type": "card",
      "statement_descriptor": null,
      "status": "paid",
      "type": "bank_account"
    }
  ],
  "has_more": false,
  "url": "/v1/payouts"
}
```

### Listing Transactions

To list recent transactions for a connected account:

```bash
curl -X GET http://localhost:3000/transactions/acct_your_connected_account_id
```

You can also specify a limit (default is 10):

```bash
curl -X GET http://localhost:3000/transactions/acct_your_connected_account_id?limit=20
```

Example response:
```json
{
  "object": "list",
  "data": [
    {
      "id": "txn_1234567890abcdef",
      "object": "balance_transaction",
      "amount": 1000,
      "created": 1642636800,
      "currency": "usd",
      "description": "Charge for example@example.com",
      "fee": 59,
      "fee_details": [
        {
          "amount": 59,
          "currency": "usd",
          "description": "Stripe processing fees",
          "type": "stripe_fee"
        }
      ],
      "net": 941,
      "status": "available",
      "type": "charge"
    }
  ],
  "has_more": false,
  "url": "/v1/balance_transactions"
}
```

### Development

```bash
npm run dev
```

This uses nodemon for automatic restart on file changes.

## Utility Scripts

### Check Folder Sizes

Monitor disk usage of your project directories:

```bash
# Run the size checker script
npm run check-sizes

# Or run directly
./check-sizes.sh
```

This script provides:
- **node_modules size** with detailed breakdown
- **Top 10 largest packages** in node_modules
- **Package and file counts**
- **Other directory sizes** (.git, src, dist, etc.)
- **Heavy package detection**
- **Cleanup suggestions**

### Project Cleanup

```bash
# Clean node_modules and package-lock.json
npm run clean

# Clean and fresh install
npm run fresh-install
```

### Manual Size Checking Commands

```bash
# Check node_modules size
du -sh node_modules

# List largest packages in node_modules
du -sh node_modules/* | sort -hr | head -10

# Count total files in node_modules
find node_modules -type f | wc -l

# Check overall project size
du -sh .

# Check .git folder size
du -sh .git
```

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

### 4. Listing Transactions

```javascript
const transactions = await stripe.balanceTransactions.list({
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

## PDF Export Feature

Generate professional PDF reports containing:
- **Account balance information** with available and pending amounts
- **Recent payouts** with amounts, status, and details
- **Transaction history** with gross amounts, net amounts, and fees
- **Timestamp and account details** for record keeping

To generate a PDF:
1. Load data (balance, payouts, or transactions)
2. Click the **"Export PDF Report"** button in the header
3. A professionally formatted PDF will be downloaded automatically

The PDF includes:
- **Professional formatting** with headers and footers
- **Complete financial data** from all loaded sections
- **Timestamp** of when the report was generated
- **Page numbers** for multi-page reports
- **Account identification** for tracking
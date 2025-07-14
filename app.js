require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Simple Node.js application demonstrating Stripe Connect Functions
 * This example shows how to trigger a payout to a connected account
 */

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is required in .env file');
  process.exit(1);
}

if (!process.env.CONNECTED_ACCOUNT_ID) {
  console.error('❌ CONNECTED_ACCOUNT_ID is required in .env file');
  process.exit(1);
}

/**
 * Create a payout to a connected account
 * @param {string} amount - Amount in cents
 * @param {string} currency - Currency code (e.g., 'usd')
 * @param {string} connectedAccountId - Stripe connected account ID
 */
async function createPayout(amount, currency, connectedAccountId) {
  try {
    console.log(`🔄 Creating payout for $${amount / 100} ${currency.toUpperCase()}...`);
    
    const payout = await stripe.payouts.create({
      amount: amount,
      currency: currency,
      method: 'instant', // or 'standard'
    }, {
      stripeAccount: connectedAccountId, // This is the key for Connect Functions
    });

    console.log('✅ Payout created successfully!');
    console.log('📋 Payout details:', {
      id: payout.id,
      amount: payout.amount,
      currency: payout.currency,
      status: payout.status,
      arrival_date: new Date(payout.arrival_date * 1000).toLocaleDateString(),
      method: payout.method,
    });

    return payout;
  } catch (error) {
    console.error('❌ Error creating payout:', error.message);
    throw error;
  }
}

/**
 * Get balance for a connected account
 * @param {string} connectedAccountId - Stripe connected account ID
 */
async function getConnectedAccountBalance(connectedAccountId) {
  try {
    console.log('🔄 Fetching connected account balance...');
    
    const balance = await stripe.balance.retrieve({
      stripeAccount: connectedAccountId,
    });

    console.log('✅ Balance retrieved successfully!');
    console.log('💰 Available balance:', balance.available);
    console.log('⏳ Pending balance:', balance.pending);

    return balance;
  } catch (error) {
    console.error('❌ Error fetching balance:', error.message);
    throw error;
  }
}

/**
 * List recent payouts for a connected account
 * @param {string} connectedAccountId - Stripe connected account ID
 * @param {number} limit - Number of payouts to retrieve
 */
async function listPayouts(connectedAccountId, limit = 5) {
  try {
    console.log('🔄 Fetching recent payouts...');
    
    const payouts = await stripe.payouts.list({
      limit: limit,
    }, {
      stripeAccount: connectedAccountId,
    });

    console.log('✅ Payouts retrieved successfully!');
    console.log('📋 Recent payouts:');
    
    payouts.data.forEach((payout, index) => {
      console.log(`  ${index + 1}. ID: ${payout.id}, Amount: $${payout.amount / 100} ${payout.currency.toUpperCase()}, Status: ${payout.status}`);
    });

    return payouts;
  } catch (error) {
    console.error('❌ Error fetching payouts:', error.message);
    throw error;
  }
}

/**
 * Main function to demonstrate Stripe Connect Functions
 */
async function main() {
  console.log('🚀 Starting Stripe Connect Functions Demo');
  console.log('=' .repeat(50));

  const connectedAccountId = process.env.CONNECTED_ACCOUNT_ID;

  try {
    // 1. Get connected account balance
    await getConnectedAccountBalance(connectedAccountId);
    console.log('');

    // 2. List recent payouts
    await listPayouts(connectedAccountId);
    console.log('');

    // 3. Create a new payout (example: $10.00 USD)
    // Note: This will only work if the connected account has sufficient balance
    // and is properly configured for payouts
    
    // Uncomment the following lines to actually create a payout:
    // await createPayout(1000, 'usd', connectedAccountId); // $10.00
    
    console.log('💡 To create a payout, uncomment the createPayout line in the main function');
    console.log('⚠️  Make sure your connected account has sufficient balance first!');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    
    // Common error handling
    if (error.type === 'StripeInvalidRequestError') {
      console.log('💡 This might be due to:');
      console.log('   - Invalid connected account ID');
      console.log('   - Insufficient balance');
      console.log('   - Account not properly configured for payouts');
    }
  }

  console.log('');
  console.log('✨ Demo completed');
}

// Additional utility functions for Express server (optional)
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get balance endpoint
app.get('/balance/:accountId', async (req, res) => {
  try {
    const balance = await getConnectedAccountBalance(req.params.accountId);
    res.json(balance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create payout endpoint
app.post('/payout', async (req, res) => {
  try {
    const { amount, currency, connectedAccountId } = req.body;
    
    if (!amount || !currency || !connectedAccountId) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, connectedAccountId' 
      });
    }

    const payout = await createPayout(amount, currency, connectedAccountId);
    res.json(payout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// List payouts endpoint
app.get('/payouts/:accountId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const payouts = await listPayouts(req.params.accountId, limit);
    res.json(payouts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🌐 Server running at http://localhost:${port}`);
  console.log('📚 Available endpoints:');
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /balance/:accountId - Get account balance`);
  console.log(`   POST /payout - Create payout (requires amount, currency, connectedAccountId in body)`);
  console.log(`   GET  /payouts/:accountId - List recent payouts`);
  console.log('');
});

// Run the demo when the file is executed directly
if (require.main === module) {
  main();
}

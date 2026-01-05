import { config } from 'dotenv';
import path from 'path';

// Cargar .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_LIVE_CLIENT_ID}:${process.env.PAYPAL_LIVE_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(
    'https://api-m.paypal.com/v1/oauth2/token', // LIVE URL
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get access token: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function createProduct(accessToken: string) {
  const response = await fetch('https://api-m.paypal.com/v1/catalogs/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'OratoriaAI Subscription',
      description: 'AI-powered public speaking coaching platform',
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create product: ${JSON.stringify(error)}`);
  }

  const product = await response.json();
  console.log('✅ Product created:', product.id);
  return product.id;
}

async function createBillingPlan(
  accessToken: string,
  productId: string,
  planName: string,
  price: string
) {
  const response = await fetch('https://api-m.paypal.com/v1/billing/plans', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      product_id: productId,
      name: `OratoriaAI - ${planName}`,
      description: `${planName} subscription plan for OratoriaAI`,
      billing_cycles: [
        {
          frequency: {
            interval_unit: 'MONTH',
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // 0 = infinite
          pricing_scheme: {
            fixed_price: {
              value: price,
              currency_code: 'USD',
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: '0',
          currency_code: 'USD',
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create plan: ${JSON.stringify(error)}`);
  }

  const plan = await response.json();
  return plan;
}

async function setupPayPalPlansLive() {
  console.log('\n🚀 Setting up PayPal LIVE Plans...\n');
  console.log('⚠️  WARNING: This will create REAL billing plans in PRODUCTION!\n');

  try {
    console.log('🔑 Getting PayPal access token...');
    const accessToken = await getPayPalAccessToken();
    console.log('✅ Access token obtained\n');

    console.log('📦 Creating product...');
    const productId = await createProduct(accessToken);
    console.log('');

    const plans = [
      { name: 'Basic', price: '9.99' },
      { name: 'Professional', price: '29.99' },
      { name: 'Enterprise', price: '99.99' },
    ];

    const planIds: Record<string, string> = {};

    for (const { name, price } of plans) {
      console.log(`📋 Creating ${name} plan ($${price}/month)...`);
      const plan = await createBillingPlan(accessToken, productId, name, price);
      planIds[name.toUpperCase()] = plan.id;
      console.log(`✅ ${name} Plan ID: ${plan.id}\n`);
    }

    console.log('\n🎉 All plans created successfully!\n');
    console.log('═'.repeat(80));
    console.log('\n📝 Add these to your .env.local (LIVE CREDENTIALS):\n');
    console.log('═'.repeat(80));
    console.log(`PAYPAL_LIVE_PLAN_BASIC=${planIds.BASIC}`);
    console.log(`PAYPAL_LIVE_PLAN_PROFESSIONAL=${planIds.PROFESSIONAL}`);
    console.log(`PAYPAL_LIVE_PLAN_ENTERPRISE=${planIds.ENTERPRISE}`);
    console.log('═'.repeat(80));
    console.log('\n⚠️  Remember to update PAYPAL_MODE to "live" in .env.local\n');

  } catch (error: any) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

setupPayPalPlansLive();
// scripts/setup-paypal-plans.ts
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const PAYPAL_API = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_CLIENT_SECRET;

async function getAccessToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('❌ Error getting access token:', data);
    throw new Error('Failed to get access token');
  }
  
  return data.access_token;
}

async function createProduct(accessToken: string) {
  const response = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
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

  const product = await response.json();
  
  if (!response.ok) {
    console.error('❌ Error creating product:', product);
    throw new Error('Failed to create product');
  }

  console.log('✅ Product created:', product.id);
  return product.id;
}

async function createPlan(accessToken: string, productId: string, planName: string, amount: string) {
  const response = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId,
      name: `OratoriaAI - ${planName}`,
      description: `${planName} plan for OratoriaAI - $${amount}/month`,
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: {
            interval_unit: 'MONTH',
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: amount,
              currency_code: 'USD',
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  });

  const plan = await response.json();
  
  if (!response.ok) {
    console.error(`❌ Error creating ${planName} plan:`, plan);
    throw new Error(`Failed to create ${planName} plan`);
  }

  console.log(`✅ Plan ${planName} created:`, plan.id);
  return plan.id;
}

async function main() {
  try {
    console.log('🚀 Setting up PayPal plans...\n');
    
    // Verificar credenciales
    if (!CLIENT_ID || !SECRET) {
      console.error('❌ Missing PayPal credentials!');
      console.error('   Make sure these are set in .env.local:');
      console.error('   - NEXT_PUBLIC_PAYPAL_CLIENT_ID');
      console.error('   - PAYPAL_CLIENT_SECRET\n');
      console.error('   Current values:');
      console.error(`   CLIENT_ID: ${CLIENT_ID ? 'SET ✓' : 'MISSING ✗'}`);
      console.error(`   SECRET: ${SECRET ? 'SET ✓' : 'MISSING ✗'}`);
      process.exit(1);
    }
    
    console.log('📋 Configuration:');
    console.log(`   API: ${PAYPAL_API}`);
    console.log(`   Client ID: ${CLIENT_ID.substring(0, 20)}...`);
    console.log(`   Secret: ${SECRET.substring(0, 20)}...\n`);
    
    console.log('⏳ Getting access token...');
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained\n');
    
    console.log('⏳ Creating product...');
    const productId = await createProduct(accessToken);
    console.log('');
    
    console.log('⏳ Creating subscription plans...');
    const basicPlanId = await createPlan(accessToken, productId, 'Basic', '9.99');
    const proPlanId = await createPlan(accessToken, productId, 'Professional', '29.99');
    const enterprisePlanId = await createPlan(accessToken, productId, 'Enterprise', '99.99');
    
    console.log('\n✅ All plans created successfully!\n');
    console.log('📝 Add these to your .env.local:\n');
    console.log('# PayPal Plan IDs');
    console.log(`PAYPAL_PLAN_BASIC=${basicPlanId}`);
    console.log(`PAYPAL_PLAN_PROFESSIONAL=${proPlanId}`);
    console.log(`PAYPAL_PLAN_ENTERPRISE=${enterprisePlanId}`);
    console.log('');
    
  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    process.exit(1);
  }
}

main();

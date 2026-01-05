import { config } from 'dotenv';
import path from 'path';

// Cargar específicamente .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(
    `${process.env.PAYPAL_API_URL}/v1/oauth2/token`,
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

async function listPayPalPlans() {
  try {
    console.log('🔑 Obtaining PayPal access token...');
    const accessToken = await getPayPalAccessToken();
    console.log('✅ Access token obtained\n');

    console.log('📋 Fetching billing plans from PayPal...\n');
    const response = await fetch(
      `${process.env.PAYPAL_API_URL}/v1/billing/plans?page_size=20&page=1&total_required=true`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error fetching plans:', JSON.stringify(data, null, 2));
      return;
    }

    console.log(`✅ Found ${data.plans?.length || 0} plans in your PayPal account:\n`);
    console.log('═'.repeat(80));

    if (data.plans && data.plans.length > 0) {
      data.plans.forEach((plan: any, index: number) => {
        console.log(`\n📦 Plan ${index + 1}: ${plan.name}`);
        console.log(`   Plan ID: ${plan.id}`);
        console.log(`   Product ID: ${plan.product_id || 'N/A'}`);
        console.log(`   Status: ${plan.status}`);
        console.log(`   Created: ${new Date(plan.create_time).toLocaleString()}`);
        
        if (plan.billing_cycles && plan.billing_cycles.length > 0) {
          const cycle = plan.billing_cycles[0];
          const pricingScheme = cycle.pricing_scheme;
          
          if (pricingScheme && pricingScheme.fixed_price) {
            console.log(`   Price: ${pricingScheme.fixed_price.currency_code} ${pricingScheme.fixed_price.value}/${cycle.frequency.interval_unit.toLowerCase()}`);
          }
        }
        console.log('   ─'.repeat(40));
      });

      console.log('\n\n📝 COPY THESE TO YOUR .env.local:\n');
      console.log('═'.repeat(80));
      
      // Intentar identificar los planes por precio
      const sortedPlans = data.plans.sort((a: any, b: any) => {
        const priceA = parseFloat(a.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.value || '0');
        const priceB = parseFloat(b.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.value || '0');
        return priceA - priceB;
      });

      console.log(`PAYPAL_PLAN_BASIC=${sortedPlans[0]?.id || 'P-REPLACE_ME'}`);
      console.log(`PAYPAL_PLAN_PROFESSIONAL=${sortedPlans[1]?.id || 'P-REPLACE_ME'}`);
      console.log(`PAYPAL_PLAN_ENTERPRISE=${sortedPlans[2]?.id || 'P-REPLACE_ME'}`);
      console.log('═'.repeat(80));

    } else {
      console.log('\n⚠️  No plans found in your PayPal account.');
      console.log('You need to create them first by running:');
      console.log('\n   npm run setup:paypal\n');
    }

  } catch (error: any) {
    console.error('💥 Error:', error.message);
    console.error('\nMake sure your .env.local has:');
    console.error('  - NEXT_PUBLIC_PAYPAL_CLIENT_ID');
    console.error('  - PAYPAL_CLIENT_SECRET');
    console.error('  - PAYPAL_API_URL');
  }
}

listPayPalPlans();
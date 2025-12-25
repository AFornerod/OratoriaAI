import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  console.log('✅ Webhook received:', event.type);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
  const session = event.data.object as Stripe.Checkout.Session;
  console.log('💳 Checkout completed:', session.id);

  // Get metadata
  const userIdentifier = session.metadata?.userId; // Puede ser UUID o email
  const tier = session.metadata?.tier;

  if (!userIdentifier || !tier) {
    console.error('❌ Missing metadata:', { userIdentifier, tier });
    break;
  }

  console.log('🔍 User identifier:', userIdentifier);
  console.log('🔍 Tier:', tier);

  // Intentar buscar por UUID primero, si falla buscar por email
  let userId = userIdentifier;
  
  // Si el identificador contiene @ es un email
  if (userIdentifier.includes('@')) {
    console.log('📧 Identifier is email, searching user...');
    const { data: profile, error: searchError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('email', userIdentifier)
      .single();

    if (searchError || !profile) {
      console.error('❌ User not found by email:', userIdentifier);
      break;
    }

    userId = profile.id;
    console.log('✅ Found user ID:', userId);
  }

  // Update user tier in database
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      tier: tier,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
    })
    .eq('id', userId);

  if (error) {
    console.error('❌ Error updating user tier:', error);
  } else {
    console.log(`✅ User ${userId} upgraded to ${tier}`);
  }

  break;
}

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('🔄 Subscription updated:', subscription.id);

      // Handle subscription updates (upgrades, downgrades)
      const customerId = subscription.customer as string;

      // Get user by stripe_customer_id
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        // Check subscription status
        const isActive = subscription.status === 'active';
        
        if (!isActive) {
          // Downgrade to free if subscription is cancelled
          await supabaseAdmin
            .from('user_profiles')
            .update({ tier: 'free' })
            .eq('id', profile.id);
          
          console.log(`⬇️ User ${profile.id} downgraded to free`);
        }
      }

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('❌ Subscription deleted:', subscription.id);

      const customerId = subscription.customer as string;

      // Downgrade user to free tier
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        await supabaseAdmin
          .from('user_profiles')
          .update({ tier: 'free' })
          .eq('id', profile.id);

        console.log(`⬇️ User ${profile.id} downgraded to free (subscription cancelled)`);
      }

      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
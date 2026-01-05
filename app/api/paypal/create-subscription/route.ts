// app/api/paypal/create-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayPalAccessToken, getPayPalPlanId } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    const { planId, userId } = await req.json();

    // Validar entrada
    if (!planId || !userId) {
      return NextResponse.json(
        { error: 'Missing planId or userId' },
        { status: 400 }
      );
    }

    // Obtener el PayPal Plan ID
    const paypalPlanId = getPayPalPlanId(planId);
    
    if (!paypalPlanId) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    // Obtener access token
    const accessToken = await getPayPalAccessToken();

    // Crear suscripción en PayPal
    const response = await fetch(
      `${process.env.PAYPAL_API_URL}/v1/billing/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          plan_id: paypalPlanId,
          custom_id: userId, // Para identificar al usuario en webhooks
          application_context: {
            brand_name: 'OratoriaAI',
            locale: 'es-AR', // Español Argentina
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            payment_method: {
              payer_selected: 'PAYPAL',
              payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
            },
            return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?subscription=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?subscription=cancelled`,
          },
        }),
      }
    );

    const subscription = await response.json();

    if (!response.ok) {
      console.error('PayPal API Error:', subscription);
      return NextResponse.json(
        { error: subscription.message || 'Failed to create subscription' },
        { status: response.status }
      );
    }

    // Encontrar el link de aprobación
    const approvalLink = subscription.links?.find(
      (link: any) => link.rel === 'approve'
    );

    if (!approvalLink) {
      return NextResponse.json(
        { error: 'No approval link found' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      approvalUrl: approvalLink.href,
    });

  } catch (error: any) {
    console.error('Error creating PayPal subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

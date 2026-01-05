// app/api/paypal/verify-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPayPalAccessToken, type PayPalSubscription } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId' },
        { status: 400 }
      );
    }

    // Obtener access token
    const accessToken = await getPayPalAccessToken();

    // Obtener detalles de la suscripción desde PayPal
    const response = await fetch(
      `${process.env.PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('PayPal API Error:', error);
      return NextResponse.json(
        { error: 'Failed to verify subscription' },
        { status: response.status }
      );
    }

    const subscription: PayPalSubscription = await response.json();

    // Verificar que la suscripción esté activa
    if (subscription.status === 'ACTIVE') {
      const supabase = createClient();
      const userId = subscription.custom_id;

      if (!userId) {
        return NextResponse.json(
          { error: 'No user ID found in subscription' },
          { status: 400 }
        );
      }

      // Determinar el plan basado en el plan_id
      let currentPlan = 'free';
      if (subscription.plan_id === process.env.PAYPAL_PLAN_BASIC) {
        currentPlan = 'basic';
      } else if (subscription.plan_id === process.env.PAYPAL_PLAN_PROFESSIONAL) {
        currentPlan = 'professional';
      } else if (subscription.plan_id === process.env.PAYPAL_PLAN_ENTERPRISE) {
        currentPlan = 'enterprise';
      }

      // Actualizar usuario en la base de datos
      const { error: updateError } = await supabase
        .from('users')
        .update({
          subscription_status: 'active',
          subscription_id: subscriptionId,
          paypal_subscriber_id: subscription.subscriber.email_address,
          current_plan: currentPlan,
          subscription_start_date: subscription.start_time,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Database update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        status: subscription.status,
        plan: currentPlan,
      });
    }

    return NextResponse.json({
      success: false,
      status: subscription.status,
      message: 'Subscription is not active',
    });

  } catch (error: any) {
    console.error('Error verifying PayPal subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

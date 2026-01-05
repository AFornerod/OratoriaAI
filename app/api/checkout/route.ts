import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    console.log('🔍 Checkout - Session:', session);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await req.json();
    
    console.log('🔍 Checkout - Tier requested:', tier);

    // Validar tier
    if (!['starter', 'pro', 'premium'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Obtener el price ID correspondiente
    const priceId = PRICE_IDS[tier as keyof typeof PRICE_IDS];
    
    console.log('🔍 Checkout - Price ID:', priceId);
    console.log('🔍 Checkout - All PRICE_IDS:', PRICE_IDS);

    if (!priceId) {
      return NextResponse.json({ 
        error: 'Price ID not configured for tier: ' + tier,
        debug: { tier, PRICE_IDS }
      }, { status: 500 });
    }

    // Crear sesión de Checkout
    console.log('🔍 Checkout - Creating session...');
    
    // const checkoutSession = await stripe.checkout.sessions.create({
    //  mode: 'subscription',
    //  payment_method_types: ['card'],
    //  line_items: [
    //    {
    //      price: priceId,
    //      quantity: 1,
    //    },
    //  ],
    //  success_url: `${process.env.NEXTAUTH_URL}?checkout=success`,
    //  cancel_url: `${process.env.NEXTAUTH_URL}?checkout=cancelled`,
    //  customer_email: session.user.email,
    //  metadata: {
    //    userId: (session.user as any).id || session.user.email,
    //    tier: tier,
    //  },
    // });

    console.log('🔍 Checkout - Session created:', checkoutSession.id);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('❌ Checkout error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        message: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
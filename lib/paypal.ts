// lib/paypal.ts

/**
 * Obtiene un access token de PayPal
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const apiUrl = process.env.PAYPAL_API_URL;

  if (!clientId || !clientSecret || !apiUrl) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`PayPal auth failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Mapea los planes de OratoriaAI a los Plan IDs de PayPal
 */
export function getPayPalPlanId(planId: string): string | null {
  const planMapping: Record<string, string> = {
    basic: process.env.PAYPAL_PLAN_BASIC!,
    professional: process.env.PAYPAL_PLAN_PROFESSIONAL!,
    enterprise: process.env.PAYPAL_PLAN_ENTERPRISE!,
  };

  return planMapping[planId] || null;
}

/**
 * Obtiene el modo actual de PayPal
 */
export function getPayPalMode(): 'sandbox' | 'live' {
  return (process.env.PAYPAL_MODE as 'sandbox' | 'live') || 'sandbox';
}

/**
 * Tipos de respuesta de PayPal
 */
export interface PayPalSubscription {
  id: string;
  status: string;
  status_update_time: string;
  plan_id: string;
  start_time: string;
  quantity: string;
  shipping_amount: {
    currency_code: string;
    value: string;
  };
  subscriber: {
    email_address: string;
    name?: {
      given_name: string;
      surname: string;
    };
  };
  billing_info: {
    outstanding_balance: {
      currency_code: string;
      value: string;
    };
    cycle_executions: Array<{
      tenure_type: string;
      sequence: number;
      cycles_completed: number;
      cycles_remaining: number;
      total_cycles: number;
    }>;
  };
  create_time: string;
  update_time: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
  custom_id?: string;
}
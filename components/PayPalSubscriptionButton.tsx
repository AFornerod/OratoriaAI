// components/PayPalSubscriptionButton.tsx
'use client';

import { useState } from 'react';

interface Props {
  planId: 'basic' | 'professional' | 'enterprise';
  userId: string;
  disabled?: boolean;
  currentPlan?: string;
}

export default function PayPalSubscriptionButton({ 
  planId, 
  userId, 
  disabled,
  currentPlan 
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCurrentPlan = currentPlan === planId;

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      // Crear suscripción
      const response = await fetch('/api/paypal/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      // Redirigir a PayPal para aprobar
      window.location.href = data.approvalUrl;

    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Error al procesar la suscripción');
      setLoading(false);
    }
  };

  if (isCurrentPlan) {
    return (
      <button
        disabled
        className="w-full bg-gray-300 text-gray-600 font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
      >
        Plan Actual
      </button>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={handleSubscribe}
        disabled={disabled || loading}
        className="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.116c-.247-.039-.505-.059-.78-.059h-2.797c-.247 0-.45.143-.527.352l-.891 5.646c-.058.37.213.688.586.688h1.043c2.163 0 3.779-.624 4.817-1.857.757-.897 1.13-2.08 1.181-3.739.014-.428-.024-.84-.025-.915z"/>
            </svg>
            Suscribirse con PayPal
          </>
        )}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  );
}

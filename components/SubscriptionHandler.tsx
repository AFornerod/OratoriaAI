'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner'; // o tu librería de notificaciones

export function SubscriptionHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    const subscriptionId = searchParams.get('subscription_id');

    if (subscriptionStatus === 'success' && subscriptionId) {
      handleSubscriptionSuccess(subscriptionId);
    } else if (subscriptionStatus === 'cancelled') {
      handleSubscriptionCancelled();
    }
  }, [searchParams]);

  const handleSubscriptionSuccess = async (subscriptionId: string) => {
    try {
      const response = await fetch('/api/paypal/verify-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('¡Suscripción activada exitosamente!');
        // Limpiar URL
        router.replace('/dashboard');
        // Recargar para actualizar datos
        window.location.reload();
      } else {
        toast.error('Error al activar la suscripción');
      }
    } catch (error) {
      console.error('Error verifying subscription:', error);
      toast.error('Error al verificar la suscripción');
    }
  };

  const handleSubscriptionCancelled = () => {
    toast.info('Suscripción cancelada. Puedes intentar de nuevo cuando quieras.');
    // Limpiar URL después de 2 segundos
    setTimeout(() => {
      router.replace('/pricing');
    }, 2000);
  };

  return null;
}
'use client';

import { useRouter } from 'next/navigation';
import PricingView from '@/components/PricingView';
import { Language } from '@/types';

export default function PricingPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <PricingView 
      onBack={handleBack}
      language="es" // o "en" dependiendo del idioma del usuario
    />
  );
}
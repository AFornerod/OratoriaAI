'use client';

import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import PricingView from '@/components/PricingView';
import { Language } from '@/types';

function PricingContent() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as Language;
    if (storedLanguage) {
      setLanguage(storedLanguage);
    } else {
      const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
      setLanguage(browserLang as Language);
    }
  }, []);

  const handleBack = () => {
    router.push('/');
  };

  return (
    <PricingView 
      onBack={handleBack}
      language={language}
    />
  );
}

export default function PricingPage() {
  return (
    <SessionProvider>
      <PricingContent />
    </SessionProvider>
  );
}
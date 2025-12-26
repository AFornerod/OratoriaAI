'use client'

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { ArrowLeft, Check, Crown, Zap, Rocket } from 'lucide-react';
import { Language } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';

interface PricingViewProps {
  onBack: () => void;
  language: Language;
}

const PricingView: React.FC<PricingViewProps> = ({ onBack, language }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const t = {
    es: {
      title: "Elige tu Plan",
      subtitle: "Mejora tu oratoria con el plan perfecto para ti",
      monthly: "/ mes",
      currentPlan: "Plan Actual",
      upgrade: "Mejorar Plan",
      features: "Características",
      free: {
        name: "Gratis",
        price: "$0",
        features: [
          "3 análisis por mes",
          "Videos de hasta 1 minuto",
          "Análisis básico de oratoria",
          "Reporte de resultados"
        ]
      },
      starter: {
        name: "Starter",
        price: "$9.99",
        features: [
          "5 análisis por mes",
          "Videos de hasta 15 minutos",
          "Análisis avanzado",
          "Guardar historial",
          "Reporte detallado"
        ]
      },
      pro: {
        name: "Pro",
        price: "$14.99",
        features: [
          "10 análisis por mes",
          "Videos de hasta 30 minutos",
          "Análisis profesional",
          "Historial ilimitado",
          "Métricas avanzadas",
          "Soporte prioritario"
        ],
        popular: true
      },
      premium: {
        name: "Premium",
        price: "$49.99",
        features: [
          "Análisis ilimitados",
          "Videos de hasta 60 minutos",
          "IA personalizada",
          "Exportar reportes",
          "Coaching personalizado",
          "API Access",
          "Soporte 24/7"
        ]
      }
    },
    en: {
      title: "Choose Your Plan",
      subtitle: "Improve your public speaking with the perfect plan",
      monthly: "/ month",
      currentPlan: "Current Plan",
      upgrade: "Upgrade",
      features: "Features",
      free: {
        name: "Free",
        price: "$0",
        features: [
          "3 analysis per month",
          "Videos up to 1 minute",
          "Basic speech analysis",
          "Results report"
        ]
      },
      starter: {
        name: "Starter",
        price: "$9.99",
        features: [
          "5 analyses per month",
          "Videos up to 15 minutes",
          "Advanced analysis",
          "Save history",
          "Detailed report"
        ]
      },
      pro: {
        name: "Pro",
        price: "$14.99",
        features: [
          "10 analyses per month",
          "Videos up to 30 minutes",
          "Professional analysis",
          "Unlimited history",
          "Advanced metrics",
          "Priority support"
        ],
        popular: true
      },
      premium: {
        name: "Premium",
        price: "$49.99",
        features: [
          "Unlimited analyses",
          "Videos up to 60 minutes",
          "Personalized AI",
          "Export reports",
          "Personal coaching",
          "API Access",
          "24/7 support"
        ]
      }
    }
  }[language];

  const plans = [
    {
      id: 'free',
      icon: Zap,
      gradient: 'from-gray-600 to-gray-700',
      ...t.free
    },
    {
      id: 'starter',
      icon: Rocket,
      gradient: 'from-blue-600 to-cyan-600',
      ...t.starter
    },
    {
      id: 'pro',
      icon: Crown,
      gradient: 'from-purple-600 to-indigo-600',
      ...t.pro
    },
    {
      id: 'premium',
      icon: Crown,
      gradient: 'from-pink-600 to-purple-600',
      ...t.premium
    }
  ];

  const handleUpgrade = async (tier: string) => {
    if (tier === 'free') return;
    
    console.log('🔍 DEBUG - User:', user);
    console.log('🔍 DEBUG - Tier selected:', tier);
    
    // Si no está autenticado, redirigir a login
if (!user) {
  console.log('🔍 DEBUG - No user, redirecting to login');
  sessionStorage.setItem('selectedTier', tier);
  // Redirect manual a la página de signin de NextAuth
  window.location.href = '/api/auth/signin?callbackUrl=' + encodeURIComponent('/');
  return;
}
    
    console.log('🔍 DEBUG - User authenticated, proceeding to checkout');
    setLoading(tier);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (response.status === 401) {
        alert(language === 'es' 
          ? 'Debes iniciar sesión primero' 
          : 'You must sign in first'
        );
        signIn(undefined, { callbackUrl: '/' });
        return;
      }

      if (data.url) {
        console.log('🔍 DEBUG - Redirecting to Stripe:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(language === 'es'
        ? 'Error al procesar el pago. Por favor intenta de nuevo.'
        : 'Error processing payment. Please try again.'
      );
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {language === 'es' ? 'Volver' : 'Back'}
        </button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">{t.title}</h1>
          <p className="text-xl text-gray-300">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = user?.tier === plan.id;
            const isPopular = 'popular' in plan && plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border ${
                  isPopular ? 'border-purple-500 shadow-xl shadow-purple-500/20' : 'border-gray-800'
                } p-6 flex flex-col`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      POPULAR
                    </span>
                  </div>
                )}

                <div className={`w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.id !== 'free' && (
                    <span className="text-gray-400 ml-2">{t.monthly}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-800 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                  >
                    {t.currentPlan}
                  </button>
                ) : plan.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-800 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                  >
                    {t.currentPlan}
                  </button>
                ) : (
<button
  onClick={() => {
    console.log('🔴 BUTTON CLICKED - Plan:', plan.id);
    handleUpgrade(plan.id);
  }}
  disabled={loading === plan.id}
  className={`w-full py-3 bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white font-semibold rounded-lg transition-all ${
    loading === plan.id ? 'opacity-50 cursor-wait' : ''
  }`}
>
                    {loading === plan.id 
                      ? (language === 'es' ? 'Procesando...' : 'Processing...') 
                      : !user 
                        ? (language === 'es' ? 'Comenzar' : 'Get Started')
                        : t.upgrade
                    }
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingView;
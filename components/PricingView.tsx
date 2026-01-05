'use client'

import React, { useState } from 'react';
import { ArrowLeft, Check, Crown, Zap, Rocket, Building2 } from 'lucide-react';
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
      getStarted: "Comenzar",
      signInFirst: "Inicia Sesión",
      processing: "Procesando...",
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
      basic: {
        name: "Basic",
        price: "$9.99",
        features: [
          "10 análisis por mes",
          "Videos de hasta 5 minutos",
          "Análisis avanzado de IA",
          "Guardar historial",
          "Reporte detallado",
          "Métricas de progreso"
        ]
      },
      professional: {
        name: "Professional",
        price: "$29.99",
        features: [
          "50 análisis por mes",
          "Videos de hasta 15 minutos",
          "Análisis profesional completo",
          "Historial ilimitado",
          "Métricas avanzadas de IA",
          "Coaching personalizado",
          "Soporte prioritario"
        ],
        popular: true
      },
      enterprise: {
        name: "Enterprise",
        price: "$99.99",
        features: [
          "Análisis ilimitados",
          "Videos de hasta 30 minutos",
          "IA personalizada premium",
          "Exportar reportes PDF",
          "Coaching 1 a 1",
          "API Access completo",
          "Soporte 24/7 dedicado",
          "Integración con equipos"
        ]
      }
    },
    en: {
      title: "Choose Your Plan",
      subtitle: "Improve your public speaking with the perfect plan",
      monthly: "/ month",
      currentPlan: "Current Plan",
      upgrade: "Upgrade",
      getStarted: "Get Started",
      signInFirst: "Sign In First",
      processing: "Processing...",
      features: "Features",
      free: {
        name: "Free",
        price: "$0",
        features: [
          "3 analyses per month",
          "Videos up to 1 minute",
          "Basic speech analysis",
          "Results report"
        ]
      },
      basic: {
        name: "Basic",
        price: "$9.99",
        features: [
          "10 analyses per month",
          "Videos up to 5 minutes",
          "Advanced AI analysis",
          "Save history",
          "Detailed report",
          "Progress metrics"
        ]
      },
      professional: {
        name: "Professional",
        price: "$29.99",
        features: [
          "50 analyses per month",
          "Videos up to 15 minutes",
          "Complete professional analysis",
          "Unlimited history",
          "Advanced AI metrics",
          "Personalized coaching",
          "Priority support"
        ],
        popular: true
      },
      enterprise: {
        name: "Enterprise",
        price: "$99.99",
        features: [
          "Unlimited analyses",
          "Videos up to 30 minutes",
          "Premium personalized AI",
          "Export PDF reports",
          "1-on-1 coaching",
          "Full API Access",
          "24/7 dedicated support",
          "Team integration"
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
      id: 'basic',
      icon: Rocket,
      gradient: 'from-blue-600 to-cyan-600',
      ...t.basic
    },
    {
      id: 'professional',
      icon: Crown,
      gradient: 'from-purple-600 to-indigo-600',
      ...t.professional
    },
    {
      id: 'enterprise',
      icon: Building2,
      gradient: 'from-pink-600 to-purple-600',
      ...t.enterprise
    }
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    
    console.log('🔍 DEBUG - User:', user);
    console.log('🔍 DEBUG - Plan selected:', planId);
    
    // Si no está autenticado, guardar plan y redirigir a login
    if (!user) {
      console.log('🔍 DEBUG - No user, redirecting to login');
      sessionStorage.setItem('selectedPlan', planId);
      window.location.href = '/api/auth/signin?callbackUrl=' + encodeURIComponent('/');
      return;
    }
    
    console.log('🔍 DEBUG - User authenticated, creating PayPal subscription');
    setLoading(planId);
    
    try {
      // Crear suscripción en PayPal
      const response = await fetch('/api/paypal/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          planId,
          userId: user.id 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creating subscription');
      }

      if (data.approvalUrl) {
        console.log('🔍 DEBUG - Redirecting to PayPal:', data.approvalUrl);
        // Redirigir a PayPal para aprobar la suscripción
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No approval URL received');
      }
    } catch (error) {
      console.error('PayPal subscription error:', error);
      alert(language === 'es'
        ? 'Error al procesar la suscripción. Por favor intenta de nuevo.'
        : 'Error processing subscription. Please try again.'
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
                    className={`w-full py-3 bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                      loading === plan.id ? 'opacity-50 cursor-wait' : ''
                    }`}
                  >
                    {loading === plan.id ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t.processing}
                      </>
                    ) : !user ? (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.116c-.247-.039-.505-.059-.78-.059h-2.797c-.247 0-.45.143-.527.352l-.891 5.646c-.058.37.213.688.586.688h1.043c2.163 0 3.779-.624 4.817-1.857.757-.897 1.13-2.08 1.181-3.739.014-.428-.024-.84-.025-.915z"/>
                        </svg>
                        {t.getStarted}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.116c-.247-.039-.505-.059-.78-.059h-2.797c-.247 0-.45.143-.527.352l-.891 5.646c-.058.37.213.688.586.688h1.043c2.163 0 3.779-.624 4.817-1.857.757-.897 1.13-2.08 1.181-3.739.014-.428-.024-.84-.025-.915z"/>
                        </svg>
                        {t.upgrade}
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Nota sobre PayPal */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            {language === 'es' 
              ? '🔒 Pagos seguros procesados por PayPal' 
              : '🔒 Secure payments processed by PayPal'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingView;

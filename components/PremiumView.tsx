'use client'

import React, { useState } from 'react';
import { Check, Star, Zap, Clock, TrendingUp, Mic2, LayoutTemplate, Shirt, CreditCard, Calendar, Lock, ArrowLeft, Loader2, Crown, Mail, User } from 'lucide-react';
import { Language } from '@/types';
import { signIn } from 'next-auth/react';

interface PremiumViewProps {
  onBack: () => void;
  language: Language;
  onSubscribe: () => void;
}

const PremiumView: React.FC<PremiumViewProps> = ({ onBack, language, onSubscribe }) => {
  const [step, setStep] = useState<'offer' | 'register' | 'success'>('offer');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'starter' | 'pro' | 'premium'>('starter');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const t = {
    es: {
      title: "PREMIUM",
      subtitle: "Lleva tus habilidades de comunicación al nivel profesional.",
      
      // Tiers
      tiers: {
        starter: {
          name: "Starter",
          price: "$9.99",
          features: [
            "30 análisis/mes",
            "Videos hasta 5 min",
            "Historial básico",
            "Exportar PDF",
          ]
        },
        pro: {
          name: "Pro",
          price: "$14.99",
          features: [
            "100 análisis/mes",
            "Videos hasta 15 min",
            "Análisis vocal avanzado",
            "Historial completo",
            "Exportar PDF",
          ]
        },
        premium: {
          name: "Premium",
          price: "$49.99",
          features: [
            "Análisis ilimitados",
            "Videos hasta 60 min",
            "Análisis vocal avanzado",
            "Asesoría de imagen IA",
            "Coach IA personalizado",
            "Soporte prioritario",
          ]
        }
      },

      period: "/mes",
      cancel: "Cancela cuando quieras",
      cta: "Seleccionar Plan",
      back: "Volver",
      
      // Register form
      registerTitle: "Crear Cuenta",
      registerDesc: "Regístrate para comenzar tu prueba gratuita",
      nameLabel: "Nombre Completo",
      emailLabel: "Correo Electrónico",
      passLabel: "Contraseña (mín. 6 caracteres)",
      registerButton: "Crear Cuenta y Suscribir",
      processing: "Procesando...",
      
      // Success
      successTitle: "¡Cuenta Creada!",
      successDesc: "Ya puedes comenzar a usar OratoriaAI",
      successButton: "Comenzar",
      
      // Errors
      errorName: "Ingresa tu nombre completo",
      errorEmail: "Ingresa un email válido",
      errorPassword: "La contraseña debe tener al menos 6 caracteres",
      errorGeneric: "Error al crear la cuenta. Intenta nuevamente.",
    },
    en: {
      title: "PREMIUM",
      subtitle: "Take your communication skills to a professional level.",
      
      tiers: {
        starter: {
          name: "Starter",
          price: "$9.99",
          features: [
            "30 analyses/month",
            "Videos up to 5 min",
            "Basic history",
            "Export PDF",
          ]
        },
        pro: {
          name: "Pro",
          price: "$14.99",
          features: [
            "100 analyses/month",
            "Videos up to 15 min",
            "Advanced vocal analysis",
            "Full history",
            "Export PDF",
          ]
        },
        premium: {
          name: "Premium",
          price: "$49.99",
          features: [
            "Unlimited analyses",
            "Videos up to 60 min",
            "Advanced vocal analysis",
            "AI image consulting",
            "Personalized AI coach",
            "Priority support",
          ]
        }
      },

      period: "/month",
      cancel: "Cancel anytime",
      cta: "Select Plan",
      back: "Back",
      
      registerTitle: "Create Account",
      registerDesc: "Sign up to start your free trial",
      nameLabel: "Full Name",
      emailLabel: "Email",
      passLabel: "Password (min. 6 characters)",
      registerButton: "Create Account & Subscribe",
      processing: "Processing...",
      
      successTitle: "Account Created!",
      successDesc: "You can now start using OratoriaAI",
      successButton: "Get Started",
      
      errorName: "Enter your full name",
      errorEmail: "Enter a valid email",
      errorPassword: "Password must be at least 6 characters",
      errorGeneric: "Error creating account. Try again.",
    }
  }[language];

  const handleTierSelect = (tier: 'starter' | 'pro' | 'premium') => {
    setSelectedTier(tier);
    setStep('register');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!name || name.trim().length < 2) {
      setError(t.errorName);
      return;
    }

    if (!email || !email.includes('@')) {
      setError(t.errorEmail);
      return;
    }

    if (!password || password.length < 6) {
      setError(t.errorPassword);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Register user
      const registerResponse = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          tier: selectedTier,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok || registerData.error) {
        setError(registerData.error || t.errorGeneric);
        setIsProcessing(false);
        return;
      }

      // 2. Auto sign-in after registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError(t.errorGeneric);
        setIsProcessing(false);
        return;
      }

      // 3. Success
      setStep('success');
      setIsProcessing(false);

    } catch (err) {
      console.error('Registration error:', err);
      setError(t.errorGeneric);
      setIsProcessing(false);
    }
  };

  const handleSuccess = () => {
    onSubscribe();
  };

  // OFFER VIEW
  if (step === 'offer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.back}
          </button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-full mb-6">
              <Crown className="w-5 h-5 text-white" />
              <span className="text-white font-bold">{t.title}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t.subtitle}
            </h1>
          </div>

          {/* Tier Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Starter */}
            <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-800 hover:border-purple-500 transition-all">
              <h3 className="text-2xl font-bold text-white mb-2">{t.tiers.starter.name}</h3>
              <div className="text-4xl font-bold text-purple-500 mb-4">
                {t.tiers.starter.price}
                <span className="text-sm text-gray-400">{t.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {t.tiers.starter.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleTierSelect('starter')}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
              >
                {t.cta}
              </button>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl p-6 rounded-2xl border-2 border-purple-500 relative transform md:scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full">
                <span className="text-white text-sm font-bold">POPULAR</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{t.tiers.pro.name}</h3>
              <div className="text-4xl font-bold text-pink-500 mb-4">
                {t.tiers.pro.price}
                <span className="text-sm text-gray-400">{t.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {t.tiers.pro.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-200">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleTierSelect('pro')}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all shadow-lg"
              >
                {t.cta}
              </button>
            </div>

            {/* Premium */}
            <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-800 hover:border-pink-500 transition-all">
              <h3 className="text-2xl font-bold text-white mb-2">{t.tiers.premium.name}</h3>
              <div className="text-4xl font-bold text-pink-500 mb-4">
                {t.tiers.premium.price}
                <span className="text-sm text-gray-400">{t.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {t.tiers.premium.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleTierSelect('premium')}
                className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition-colors"
              >
                {t.cta}
              </button>
            </div>
          </div>

          <p className="text-center text-gray-400 text-sm">{t.cancel}</p>
        </div>
      </div>
    );
  }

  // REGISTER VIEW
  if (step === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setStep('offer')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.back}
          </button>

          <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full mb-4">
                <Crown className="w-5 h-5 text-white" />
                <span className="text-white font-bold">{t.tiers[selectedTier].name}</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{t.registerTitle}</h2>
              <p className="text-gray-400">{t.registerDesc}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  {t.nameLabel}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Juan Pérez"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="tu@email.com"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  {t.passLabel}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="••••••••"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  t.registerButton
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-6">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">{t.successTitle}</h2>
        <p className="text-gray-400 mb-8">{t.successDesc}</p>
        <button
          onClick={handleSuccess}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
        >
          {t.successButton}
        </button>
      </div>
    </div>
  );
};

export default PremiumView;
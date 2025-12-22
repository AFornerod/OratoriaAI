'use client'

import React, { useState } from 'react';
import { Check, Star, Zap, Clock, TrendingUp, Mic2, LayoutTemplate, Shirt, CreditCard, Calendar, Lock, ArrowLeft, Loader2, Crown, Mail, User } from 'lucide-react';
import { Language } from '@/types';
import { registerUser } from '@/lib/services/storageService';

interface PremiumViewProps {
  onBack: () => void;
  language: Language;
  onSubscribe: () => void;
}

const PremiumView: React.FC<PremiumViewProps> = ({ onBack, language, onSubscribe }) => {
  const [step, setStep] = useState<'offer' | 'payment' | 'success'>('offer');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const t = {
    es: {
      title: "PREMIUM",
      subtitle: "Lleva tus habilidades de comunicación al nivel profesional. Desbloquea herramientas avanzadas de análisis y seguimiento.",
      features: [
        { title: "Análisis de Videos Largos", desc: "Sube conferencias de hasta 1 hora." },
        { title: "Historial de Progreso", desc: "Gráficas de tu mejora en el tiempo." },
        { title: "Análisis Vocal Avanzado", desc: "Detecta monotonía, volumen y variaciones." },
        { title: "Asesoría de Imagen IA", desc: "Análisis de vestimenta, peinado y maquillaje." },
        { title: "Coach IA Personalizado", desc: "Ejercicios generados para ti." }
      ],
      offerTitle: "Oferta de Lanzamiento",
      period: "/mes",
      cancel: "Cancela cuando quieras.",
      benefits: ["Acceso total a la IA", "Análisis Profundo", "Exportación a PDF", "Soporte Prioritario"],
      cta: "Suscribir",
      disclaimer: "7 días gratis, luego $9.99/mes",
      back: "Volver",
      paymentTitle: "Crea tu Cuenta Premium",
      paymentDesc: "Regístrate e ingresa tus datos para activar la suscripción.",
      accountSection: "1. Datos de Cuenta",
      paymentSection: "2. Método de Pago",
      nameLabel: "Nombre Completo",
      emailLabel: "Correo Electrónico",
      passLabel: "Contraseña",
      cardLabel: "Número de tarjeta",
      expiryLabel: "Vencimiento (MM/AA)",
      cvcLabel: "CVC",
      payBtn: "Pagar y Registrarse",
      secure: "Pago 100% Seguro y Encriptado",
      successTitle: "¡Felicitaciones!",
      successDesc: "Tu cuenta ha sido creada y la suscripción Premium activada.",
      welcome: "Bienvenido a la élite de los oradores.",
      continueBtn: "Comenzar a usar Premium",
      errorEmail: "El correo ya está registrado."
    },
    en: {
      title: "PREMIUM",
      subtitle: "Take your communication skills to the professional level. Unlock advanced analysis and tracking tools.",
      features: [
        { title: "Long Video Analysis", desc: "Upload lectures up to 1 hour." },
        { title: "Progress History", desc: "Graphs of your improvement over time." },
        { title: "Advanced Vocal Analysis", desc: "Detects monotony, volume, and variations." },
        { title: "AI Image Consulting", desc: "Attire, hairstyle, and makeup analysis." },
        { title: "Personalized AI Coach", desc: "Exercises generated for you." }
      ],
      offerTitle: "Launch Offer",
      period: "/month",
      cancel: "Cancel anytime.",
      benefits: ["Full AI Access", "Deep Analysis", "PDF Export", "Priority Support"],
      cta: "Subscribe",
      disclaimer: "7 days free, then $9.99/month",
      back: "Back",
      paymentTitle: "Create Premium Account",
      paymentDesc: "Register and enter your details to activate subscription.",
      accountSection: "1. Account Details",
      paymentSection: "2. Payment Method",
      nameLabel: "Full Name",
      emailLabel: "Email Address",
      passLabel: "Password",
      cardLabel: "Card number",
      expiryLabel: "Expiry (MM/YY)",
      cvcLabel: "CVC",
      payBtn: "Pay & Register",
      secure: "100% Secure & Encrypted Payment",
      successTitle: "Congratulations!",
      successDesc: "Your account has been created and Premium subscription activated.",
      welcome: "Welcome to the speaker elite.",
      continueBtn: "Start using Premium",
      errorEmail: "Email already registered."
    }
  }[language];

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    // Simulate API call & Register
    setTimeout(() => {
      try {
        registerUser({
          name,
          email,
          password,
          isPremium: true
        });
        
        setIsProcessing(false);
        setStep('success');
        onSubscribe(); // Update global app state
      } catch (err: any) {
        setIsProcessing(false);
        setError(t.errorEmail);
      }
    }, 2000);
  };

  const icons = [
    <Clock className="w-5 h-5 text-yellow-400" />,
    <TrendingUp className="w-5 h-5 text-green-400" />,
    <Mic2 className="w-5 h-5 text-purple-400" />,
    <Shirt className="w-5 h-5 text-pink-400" />,
    <Zap className="w-5 h-5 text-orange-400" />
  ];

  if (step === 'payment') {
    return (
      <div className="w-full max-w-md mx-auto animate-fade-in pt-6 pb-12">
        <button onClick={() => setStep('offer')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </button>
        
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-purple-900/20">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{t.paymentTitle}</h3>
            <p className="text-gray-400 text-sm">{t.paymentDesc}</p>
          </div>

          <form onSubmit={handlePay} className="space-y-6">
            
            {/* Account Section */}
            <div className="space-y-4 border-b border-gray-800 pb-6">
              <h4 className="text-yellow-500 font-bold uppercase text-xs tracking-widest mb-2">{t.accountSection}</h4>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.nameLabel}</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                  <input 
                    required 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe" 
                    className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                  <input 
                    required 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com" 
                    className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.passLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                  <input 
                    required 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-4">
              <h4 className="text-yellow-500 font-bold uppercase text-xs tracking-widest mb-2">{t.paymentSection}</h4>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.cardLabel}</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                  <input required type="text" placeholder="0000 0000 0000 0000" className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.expiryLabel}</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input required type="text" placeholder="MM/YY" className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all" />
                  </div>
                </div>
                <div className="space-y-2 w-1/3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.cvcLabel}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input required type="text" placeholder="123" className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg rounded-xl hover:opacity-90 transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 mt-4"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  {t.payBtn}
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
              <Lock className="w-3 h-3" /> {t.secure}
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in px-4">
         <div className="w-24 h-24 bg-gradient-to-tr from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(234,179,8,0.4)] animate-bounce-subtle">
            <Crown className="w-12 h-12 text-black" />
         </div>
         <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{t.successTitle}</h2>
         <p className="text-xl text-gray-300 max-w-md mb-8">{t.successDesc} {t.welcome}</p>
         <button 
           onClick={onBack}
           className="px-10 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-all shadow-xl shadow-white/10"
         >
           {t.continueBtn}
         </button>
      </div>
    );
  }

  // DEFAULT VIEW (OFFER)
  return (
    <div className="w-full max-w-6xl mx-auto px-4 animate-fade-in pb-12">
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600">
          Oratoria AI <span className="text-white">{t.title}</span>
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* Features List */}
        <div className="w-full lg:max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.features.map((feature, idx) => (
            <div key={idx} className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 hover:border-yellow-500/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gray-800 p-2 rounded-lg">
                  {icons[idx]}
                </div>
                <h3 className="font-bold text-white text-sm">{feature.title}</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing Card */}
        <div className="w-full lg:max-w-md bg-gradient-to-b from-gray-800 to-gray-900 p-1 rounded-3xl border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
          <div className="bg-black rounded-[20px] p-8 text-center h-full flex flex-col">
            <div className="uppercase tracking-widest text-yellow-500 font-bold text-sm mb-4">{t.offerTitle}</div>
            <div className="text-5xl font-extrabold text-white mb-2">$9.99<span className="text-lg text-gray-500 font-normal">{t.period}</span></div>
            <p className="text-gray-400 mb-8">{t.cancel}</p>
            
            <ul className="space-y-4 text-left mb-8 flex-grow">
              {t.benefits.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="bg-yellow-500/20 p-1 rounded-full">
                    <Check className="w-3 h-3 text-yellow-500" />
                  </div>
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => setStep('payment')}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-yellow-500/20"
            >
              {t.cta}
            </button>
            <p className="text-xs text-gray-500 mt-4">{t.disclaimer}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <button 
          onClick={onBack}
          className="text-gray-400 hover:text-white font-medium transition-colors"
        >
          {t.back}
        </button>
      </div>
    </div>
  );
};

export default PremiumView;

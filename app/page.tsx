'use client'
import React, { useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Mic, BarChart3, Users, Play, Loader2, Smile, Zap, Globe, Crown, Clock, TrendingUp, Mic2, Shirt, LayoutTemplate, Target, FileText, Crosshair, History, User as UserIcon, LogOut, LogIn } from 'lucide-react';

// Components
import Recorder from '@/components/Recorder';
import ResultsView from '@/components/ResultsView';
import PremiumView from '@/components/PremiumView';
import HistoryView from '@/components/HistoryView';
import LoginView from '@/components/LoginView';
import ProfileView from '@/components/ProfileView';
import PricingView from '@/components/PricingView';

// Services & Types
import { analyzeVideo } from '@/lib/gemini/service';
// TODO: Temporalmente comentadas hasta crear las APIs
// import { saveAnalysisToHistory, getHistory, getCurrentSession, logoutUser } from '@/lib/api/client';
import { AppState, AnalysisResult, Language, User } from '@/types';

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL part (e.g., "data:video/webm;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

function HomePageContent() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('es');
  
  // Derivar isPremium del usuario autenticado
  const isPremium = user?.isPremium || false;
  
  // Premium specific inputs
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');

  // History State
  const [historyItems, setHistoryItems] = useState<any[]>([]);
const [isViewingFromHistory, setIsViewingFromHistory] = useState(false);

  // TODO: Load history when user logs in
  useEffect(() => {
    if (user) {
      // Aquí cargaremos el historial del usuario
      // loadUserHistory();
    }
  }, [user]);

// Refrescar sesión después del checkout exitoso
useEffect(() => {
  const searchParams = new URLSearchParams(window.location.search);
  const checkoutStatus = searchParams.get('checkout');
  
  if (checkoutStatus === 'success') {
    console.log('✅ Checkout success detected, refreshing session...');
    
    // Esperar 2 segundos para que el webhook termine de actualizar la DB
    setTimeout(async () => {
      // Forzar refresco de sesión
      await fetch('/api/auth/session?update=1');
      
      // Recargar página para actualizar el estado
      window.location.href = '/';
    }, 2000);
  }
}, []);

  // Translation Dictionary for Home Screen
  const t = {
    es: {
      heroTitle: "Domina el arte de",
      heroSubtitle: "hablar en público",
      heroDesc: "Tu coach personal con Inteligencia Artificial. Recibe feedback instantáneo sobre tus muletillas, ritmo, lenguaje corporal y emociones.",
      startBtn: "Comenzar Práctica",
      noLogin: "Sin registro requerido",
      features: [
        { title: "Detector de Muletillas", desc: "Identifica 'eh', 'este', 'mm' y límpia tu discurso." },
        { title: "Análisis de Ritmo", desc: "Optimiza tu velocidad para mantener a la audiencia cautiva." },
        { title: "Lenguaje Corporal", desc: "Mejora tu contacto visual y postura con visión artificial." },
        { title: "Análisis de Emociones", desc: "Detecta la intensidad de tu confianza, entusiasmo o nerviosismo." },
        { title: "Plan de Acción IA", desc: "Recibe ejercicios prácticos y lecturas personalizados para mejorar." }
      ],
      premiumSectionTitle: "Tu Suite Premium",
      premiumFeatures: [
        { title: "Videos Largos", desc: "Análisis de conferencias de hasta 1 hora." },
        { title: "Historial de Progreso", desc: "Gráficas detalladas de tu evolución temporal." },
        { title: "Análisis Vocal Avanzado", desc: "Detección profunda de monotonía y tonos." },
        { title: "Asesoría de Imagen", desc: "Feedback de vestimenta y presencia visual." },
        { title: "Coach Personalizado", desc: "Ejercicios generados a medida." }
      ],
      stageTitle: "Tu Escenario Virtual",
      stageDesc: isPremium ? "Graba sesiones largas de hasta 1 hora." : "Graba un fragmento de tu presentación (30-60 segundos recomendado).",
      cancel: "Cancelar",
      processing: "Procesando Video...",
      analyzing: "Analizando con IA...",
      processingDesc: "Estamos preparando tu grabación para enviarla al laboratorio.",
      analyzingDesc: "Gemini está evaluando tu entonación, gestos y contenido. Esto toma unos segundos.",
      errorTitle: "Ups, algo salió mal",
      retry: "Intentar de nuevo",
      navHistory: "Historial",
      navPremium: "Premium",
      navPremiumActive: "Miembro Premium",
      navLogin: "Iniciar Sesión",
      navLogout: "Cerrar Sesión",
      // Premium Context Inputs
      contextTitle: "Contexto de la Presentación",
      topicLabel: "¿De qué trata tu presentación?",
      topicPlaceholder: "Ej: Pitch de ventas para inversores sobre una nueva app de salud...",
      audienceLabel: "Público Objetivo",
      audiencePlaceholder: "Ej: Inversores ángeles, Estudiantes universitarios...",
      goalLabel: "Mi Objetivo Principal",
      goalPlaceholder: "Selecciona un objetivo...",
      goals: [
        "Superar miedo escénico",
        "Hablar bien en público",
        "Inspirar / dar una charla tipo Charlas TED",
        "Convencer / vender Influencia",
        "Dar una masterclass"
      ],
      optional: "(Opcional)"
    },
    en: {
      heroTitle: "Master the art of",
      heroSubtitle: "public speaking",
      heroDesc: "Your personal AI coach. Get instant feedback on filler words, pacing, body language, and emotions.",
      startBtn: "Start Practice",
      noLogin: "No signup required",
      features: [
        { title: "Filler Word Detector", desc: "Identifies 'um', 'uh', 'like' and cleans up your speech." },
        { title: "Pacing Analysis", desc: "Optimize your speed to keep the audience engaged." },
        { title: "Body Language", desc: "Improve eye contact and posture with computer vision." },
        { title: "Emotion Analysis", desc: "Detects the intensity of confidence, enthusiasm, or nervousness." },
        { title: "AI Action Plan", desc: "Receive personalized exercises and reading materials to improve." }
      ],
      premiumSectionTitle: "Your Premium Suite",
      premiumFeatures: [
        { title: "Long Videos", desc: "Analysis of lectures up to 1 hour." },
        { title: "Progress History", desc: "Detailed graphs of your evolution." },
        { title: "Advanced Vocal Analysis", desc: "Deep detection of monotony and pitch." },
        { title: "Image Consulting", desc: "Feedback on attire and visual presence." },
        { title: "Personalized Coach", desc: "Tailored exercises for your needs." }
      ],
      stageTitle: "Your Virtual Stage",
      stageDesc: isPremium ? "Record long sessions up to 1 hour." : "Record a snippet of your presentation (30-60 seconds recommended).",
      cancel: "Cancel",
      processing: "Processing Video...",
      analyzing: "Analyzing with AI...",
      processingDesc: "We are preparing your recording for the lab.",
      analyzingDesc: "Gemini is evaluating your intonation, gestures, and content. This takes a few seconds.",
      errorTitle: "Oops, something went wrong",
      retry: "Try again",
      navHistory: "History",
      navPremium: "Premium",
      navPremiumActive: "Premium Member",
      navLogin: "Log In",
      navLogout: "Log Out",
      // Premium Context Inputs
      contextTitle: "Presentation Context",
      topicLabel: "What is your presentation about?",
      topicPlaceholder: "Ex: Sales pitch to investors about a new health app...",
      audienceLabel: "Target Audience",
      audiencePlaceholder: "Ex: Angel investors, University students...",
      goalLabel: "My Main Goal",
      goalPlaceholder: "Select a goal...",
      goals: [
        "Overcome stage fright",
        "Speak well in public",
        "Inspire / TED-style talk",
        "Convince / Sell Influence",
        "Give a masterclass"
      ],
      optional: "(Optional)"
    }
  }[language];

const handleRecordingComplete = async (blob: Blob) => {
    setAppState(AppState.PROCESSING);
    try {
	// 🆕 VALIDAR tamaño del video
      const sizeInMB = blob.size / (1024 * 1024);
      if (sizeInMB > 15) {
        setAppState(AppState.ERROR);
        setErrorMsg(
          language === 'es' 
            ? 'Video muy grande. Por favor graba un video más corto (máximo 1 minuto).' 
            : 'Video too large. Please record a shorter video (max 1 minute).'
        );
        return;
      }

      // 1. Convert Blob to Base64
      const base64Video = await blobToBase64(blob);
      const mimeType = blob.type || 'video/webm';

      // 2. Set State to Analyzing (UI Feedback)
      setAppState(AppState.ANALYZING);

      // 3. Send to Gemini (ahora es server action)
      const analysis = await analyzeVideo(
        base64Video, 
        mimeType, 
        language, 
        isPremium,  // Esto se pasará como parámetro
        topic, 
        audience, 
        goal
      );

      // 4. Show Results
      setResult(analysis);
      setAppState(AppState.RESULTS);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      setErrorMsg(language === 'es' ? "Hubo un error analizando tu video. Intenta una grabación más corta o verifica tu conexión." : "There was an error analyzing your video. Try a shorter recording or check your connection.");
    }
  };

const handleSaveResult = async () => {
    if (!result) return;
    try {
      const response = await fetch('/api/save-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: result,
          topic,
          goal,
          language,
          tier: user?.tier || 'free',
          userId: user?.id || null  // ← AGREGAR ESTO
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(language === 'es' 
          ? '✅ Análisis guardado correctamente' 
          : '✅ Analysis saved successfully'
        );
      } else {
        alert(language === 'es'
          ? '❌ Error al guardar: ' + (data.error || 'Error desconocido')
          : '❌ Error saving: ' + (data.error || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert(language === 'es'
        ? '❌ Error al guardar el análisis'
        : '❌ Error saving analysis'
      );
    }
  };

const resetApp = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setErrorMsg(null);
    setIsViewingFromHistory(false);  // ← AGREGAR ESTO
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  // Auth Handlers
const handleSubscribeSuccess = () => {
    // Después del registro exitoso, el usuario ya está logueado
    setAppState(AppState.IDLE);
    alert(language === 'es'
      ? '¡Cuenta Premium activada! Ya puedes usar todas las funciones.'
      : 'Premium account activated! You can now use all features.'
    );
  };

const handleLoginSuccess = () => {
    // El usuario ya está en sesión gracias a NextAuth
    setAppState(AppState.IDLE);
    // Opcional: mostrar mensaje de bienvenida
    alert(language === 'es' 
      ? `¡Bienvenido ${user?.name || user?.email}!` 
      : `Welcome ${user?.name || user?.email}!`
    );
  };

const handleLogout = async () => {
    await signOut({ redirect: false });
    setHistoryItems([]);
    setAppState(AppState.IDLE);
  };

const handleHistoryRefresh = () => {
    // TODO: Implementar cuando tengamos API
    // setHistoryItems(getHistory());
  };

const handleViewAnalysisFromHistory = (analysis: any) => {
    // Reconstruct result from saved analysis
    const reconstructedResult = {
      overallScore: analysis.overall_score,
      summary: analysis.summary,
      ...analysis.analysis_data
    };
    
    setResult(reconstructedResult);
    setTopic(analysis.topic || '');
    setGoal(analysis.goal || '');
    setIsViewingFromHistory(true);  // ← AGREGAR ESTO
    setAppState(AppState.RESULTS);
  };

  const featureIcons = [
    <Mic className="w-6 h-6 text-purple-400" />,
    <BarChart3 className="w-6 h-6 text-blue-400" />,
    <Users className="w-6 h-6 text-pink-400" />,
    <Smile className="w-6 h-6 text-yellow-400" />,
    <Zap className="w-6 h-6 text-orange-400" />
  ];

  const premiumIcons = [
    <Clock className="w-6 h-6 text-yellow-400" />,
    <TrendingUp className="w-6 h-6 text-green-400" />,
    <Mic2 className="w-6 h-6 text-purple-400" />,
    <Shirt className="w-6 h-6 text-pink-400" />,
    <Zap className="w-6 h-6 text-orange-400" />
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white">
      {/* Navigation / Header */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between h-16">
        {/* LEFT SIDE - Logo + Tier Badge/Upgrade */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp} role="button">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
               <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Oratoria<span className="text-purple-500">AI</span></span>
          </div>

          {/* Tier Badge + Upgrade Button Logic */}
          {user && user.tier === 'free' && (
            <button
              onClick={() => setAppState(AppState.PRICING)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-yellow-500/30 animate-pulse"
            >
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'es' ? 'Upgrade' : 'Upgrade'}
              </span>
            </button>
          )}

          {user && user.tier === 'starter' && (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                <Crown className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-bold uppercase">Starter</span>
              </div>
              <button
                onClick={() => setAppState(AppState.PRICING)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {language === 'es' ? 'Ver Planes' : 'View Plans'}
              </button>
            </>
          )}

          {user && user.tier === 'pro' && (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/50 rounded-lg">
                <Crown className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-sm font-bold uppercase">Pro</span>
              </div>
              <button
                onClick={() => setAppState(AppState.PRICING)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {language === 'es' ? 'Upgrade' : 'Upgrade'}
              </button>
            </>
          )}

          {user && user.tier === 'premium' && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <Crown className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-bold uppercase">Premium ⭐</span>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - Language, History, User */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">{language.toUpperCase()}</span>
          </button>

          {/* Ver Planes (NO autenticado) */}
          {!user && (
            <button 
              onClick={() => setAppState(AppState.PRICING)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {language === 'es' ? 'Ver Planes' : 'View Plans'}
            </button>
          )}

          {/* History (Usuarios autenticados) */}
          {user && (
            <button 
              onClick={() => setAppState(AppState.HISTORY)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              title={language === 'es' ? 'Ver Historial' : 'View History'}
            >
              <History className="w-4 h-4" />
              <span className="hidden md:inline text-sm font-medium">
                {language === 'es' ? 'Historial' : 'History'}
              </span>
            </button>
          )}

          {/* User Profile or Login */}
          {user ? (
            <div className="flex items-center gap-3 border-l border-gray-700 pl-3">
              <div 
                onClick={() => setAppState(AppState.PROFILE)}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                role="button"
              >
                <div className="w-8 h-8 bg-purple-900 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-purple-200" />
                </div>
                <span className="hidden md:inline text-sm font-medium text-white">
                  {user.name ? user.name.split(' ')[0] : user.email?.split('@')[0] || 'Usuario'}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                title={language === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setAppState(AppState.LOGIN)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'es' ? 'Iniciar Sesión' : 'Sign In'}</span>
            </button>
          )}
        </div>
      </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* State: IDLE */}
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center space-y-12 animate-fade-in-up pb-12">
            <div className="text-center space-y-4 max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                {t.heroTitle} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 neon-text">
                  {t.heroSubtitle}
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {t.heroDesc}
              </p>
            </div>

            <div className="w-full max-w-4xl bg-gray-900/50 p-1 rounded-3xl border border-gray-800 backdrop-blur-sm">
               <div className="bg-black rounded-[20px] p-8 md:p-12">
                  <div className="flex flex-col items-center gap-6">
                    <button 
                      onClick={() => setAppState(AppState.RECORDING)}
                      className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-purple-600 font-lg rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 focus:ring-offset-gray-900"
                    >
                      <span className="mr-2 text-lg">{t.startBtn}</span>
                      <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute -inset-3 rounded-full bg-purple-600 opacity-20 blur-lg group-hover:opacity-40 transition duration-200"></div>
                    </button>
                    {!isPremium && <p className="text-sm text-gray-500 uppercase tracking-widest">{t.noLogin}</p>}
                  </div>
               </div>
            </div>

            {/* Free Features */}
            <div className="flex flex-wrap justify-center gap-6 w-full max-w-6xl mt-12">
              {t.features.map((feature, idx) => (
                <div key={idx} className="p-6 bg-gray-900 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors w-full md:w-[calc(33.333%-1.5rem)] min-w-[300px]">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                    {featureIcons[idx]}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Premium Features (Only if Premium) */}
            {isPremium && (
              <div className="w-full max-w-6xl mt-8 animate-fade-in">
                 <div className="flex items-center justify-center gap-3 mb-8">
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-yellow-500 uppercase tracking-widest">{t.premiumSectionTitle}</h2>
                    <Crown className="w-6 h-6 text-yellow-500" />
                 </div>
                 <div className="flex flex-wrap justify-center gap-6">
                    {t.premiumFeatures.map((feature, idx) => (
                      <div key={idx} className="p-6 bg-yellow-900/10 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-900/20 transition-all w-full md:w-[calc(33.333%-1.5rem)] min-w-[300px]">
                        <div className="w-12 h-12 bg-yellow-900/20 rounded-lg flex items-center justify-center mb-4">
                          {premiumIcons[idx]}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-yellow-100">{feature.title}</h3>
                        <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        )}

        {/* State: RECORDING */}
        {appState === AppState.RECORDING && (
          <div className="animate-fade-in">
             
             {/* Premium Inputs Context */}
             {isPremium && (
               <div className="w-full max-w-2xl mx-auto mb-8 bg-gray-900/50 border border-yellow-500/30 rounded-2xl p-6 shadow-lg shadow-yellow-500/5">
                  <div className="flex items-center gap-2 mb-4 text-yellow-500">
                     <Crown className="w-5 h-5" />
                     <h3 className="font-bold text-lg uppercase tracking-wide">{t.contextTitle}</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        {t.topicLabel} <span className="text-xs text-gray-500">{t.optional}</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute top-3 left-3 w-4 h-4 text-gray-500" />
                        <textarea 
                          rows={2} 
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder={t.topicPlaceholder}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm resize-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        {t.audienceLabel} <span className="text-xs text-gray-500">{t.optional}</span>
                      </label>
                      <div className="relative">
                        <Target className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-gray-500" />
                        <input 
                          type="text" 
                          value={audience}
                          onChange={(e) => setAudience(e.target.value)}
                          placeholder={t.audiencePlaceholder}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        {t.goalLabel} <span className="text-xs text-gray-500">{t.optional}</span>
                      </label>
                      <div className="relative">
                        <Crosshair className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-gray-500 pointer-events-none" />
                        <select 
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm appearance-none cursor-pointer"
                        >
                          <option value="" className="text-gray-500">{t.goalPlaceholder}</option>
                          {t.goals.map((g, idx) => (
                            <option key={idx} value={g} className="text-white bg-gray-900">{g}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
             )}

             <div className="mb-8 text-center">
               <h2 className="text-3xl font-bold mb-2">{t.stageTitle}</h2>
               <p className="text-gray-400 text-lg">{t.stageDesc}</p>
             </div>
             <Recorder onRecordingComplete={handleRecordingComplete} language={language} />
             <div className="mt-8 text-center">
                <button onClick={resetApp} className="text-gray-500 hover:text-white underline">{t.cancel}</button>
             </div>
          </div>
        )}

        {/* State: PROCESSING / ANALYZING */}
        {(appState === AppState.PROCESSING || appState === AppState.ANALYZING) && (
          <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
             <div className="relative">
               <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
               <Loader2 className="w-20 h-20 text-purple-500 animate-spin relative z-10" />
             </div>
             <h2 className="text-3xl font-bold mt-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
               {appState === AppState.PROCESSING ? t.processing : t.analyzing}
             </h2>
             <p className="text-gray-400 mt-4 max-w-md text-center">
               {appState === AppState.PROCESSING ? t.processingDesc : t.analyzingDesc}
             </p>
          </div>
        )}

        {/* State: RESULTS */}
{appState === AppState.RESULTS && result && (
          <ResultsView 
            result={result} 
            onReset={resetApp} 
            language={language} 
            onSave={handleSaveResult}
            isPremium={isPremium}
            isFromHistory={isViewingFromHistory}  // ← AGREGAR ESTO
          />
        )}

        {/* State: PREMIUM */}
        {appState === AppState.PREMIUM && (
          <PremiumView 
            onBack={resetApp} 
            language={language} 
            onSubscribe={handleSubscribeSuccess} 
          />
        )}

        {/* State: LOGIN */}
        {appState === AppState.LOGIN && (
          <LoginView 
            onBack={resetApp} 
            language={language} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}

{/* State: PROFILE */}
        {appState === AppState.PROFILE && (
          <ProfileView 
             onBack={resetApp}
             onLogout={handleLogout}
             language={language}
          />
        )}
{appState === AppState.PRICING && (
  <PricingView 
    onBack={resetApp}
    language={language}
  />
)}

{/* State: HISTORY */}
        {appState === AppState.HISTORY && (
          <HistoryView 
            onBack={resetApp} 
            language={language}
            onViewAnalysis={handleViewAnalysisFromHistory}
          />
        )}

        {/* State: ERROR */}
        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
             <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">⚠️</span>
             </div>
             <h2 className="text-3xl font-bold text-white mb-4">{t.errorTitle}</h2>
             <p className="text-gray-400 max-w-md mb-8">{errorMsg}</p>
             <button 
                onClick={resetApp}
                className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
             >
                {t.retry}
             </button>
          </div>
        )}

      </main>
    </div>
  );
};

// Wrapper con SessionProvider
export default function HomePage() {
  return (
    <SessionProvider>
      <HomePageContent />
    </SessionProvider>
  );
}

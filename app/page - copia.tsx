'use client'
import { useSession } from 'next-auth/react'
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

// 🆕 Cache global para evitar llamadas duplicadas
let globalLimitsCache: any = null;
let globalLastEmail: string | null = null;

function HomePageContent() {
  const { update } = useSession()

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

  // 🆕 LÍMITES DE ANÁLISIS MENSUALES
  const [analysisLimit, setAnalysisLimit] = useState<{
    used: number;
    remaining: number | 'unlimited';
    canAnalyze: boolean;
    tier: string;
    currentMonth?: string;
  } | null>(null);
  const [isLoadingLimit, setIsLoadingLimit] = useState(false);

  // 🆕 FUNCIÓN PARA CARGAR LÍMITES MENSUALES CON CACHE
  const loadAnalysisLimit = async () => {
    if (!user?.email) return;
    
    // 🛑 Si ya se cargó para este usuario, usar cache
    if (globalLastEmail === user.email && globalLimitsCache) {
      console.log('📦 [page] Using cached limits');
      setAnalysisLimit(globalLimitsCache);
      return;
    }
    
    console.log('📊 [page] Loading limits for:', user.email);
    setIsLoadingLimit(true);
    try {
      const response = await fetch('/api/check-limit');
      const data = await response.json();
      
      if (data.success) {
        const limits = {
          used: data.used,
          remaining: data.remaining,
          canAnalyze: data.canAnalyze,
          tier: data.tier,
          currentMonth: data.currentMonth,
        };
        
        setAnalysisLimit(limits);
        
        // 🆕 Guardar en cache global
        globalLimitsCache = limits;
        globalLastEmail = user.email;
        
        console.log('✅ [page] Limits loaded and cached:', limits);
      }
    } catch (error) {
      console.error('❌ [page] Error loading analysis limit:', error);
    } finally {
      setIsLoadingLimit(false);
    }
  };

  // ✅ Cargar límites cuando el usuario inicia sesión - ARREGLADO
  useEffect(() => {
    if (user?.email) {
      loadAnalysisLimit();
    } else {
      setAnalysisLimit(null);
      globalLimitsCache = null;
      globalLastEmail = null;
    }
  }, [user?.email]); // ✅ Solo depende de email, no del objeto user completo

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
      console.log('✅ Checkout success detected, forcing tier update...');
      
      // Limpiar la URL inmediatamente
      window.history.replaceState({}, '', '/');
      
      // Función para verificar si el tier cambió
      const checkTierUpdate = async (attempts = 0) => {
        const maxAttempts = 20; // 20 intentos = 20 segundos máximo
        
        if (attempts >= maxAttempts) {
          console.log('⚠️ Max attempts reached, forcing full reload...');
          // Hacer logout y login de nuevo para forzar refresh del JWT
          await signOut({ redirect: false });
          window.location.href = '/auth/signin?callbackUrl=/';
          return;
        }
        
        try {
          console.log(`🔄 Attempt ${attempts + 1}: Forcing session refresh...`);
          
          // MÉTODO 1: Forzar update del JWT
          const updateResult = await update();
          console.log('📝 Update result:', updateResult);
          
          // MÉTODO 2: Obtener sesión directamente del servidor
          const sessionResponse = await fetch('/api/auth/session', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store', // IMPORTANTE: No usar cache
          });
          const session = await sessionResponse.json();
          
          console.log(`🔍 Session tier:`, session?.user?.tier);
          console.log(`🔍 User from hook:`, user?.tier);
          
          // Verificar si el tier cambió
          if (session?.user?.tier && session.user.tier !== 'free') {
            console.log('✅ Tier updated successfully!', session.user.tier);
            
            // Forzar recarga completa para actualizar todo
            console.log('🔄 Force reloading page in 1 second...');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            // Esperar 1 segundo y volver a intentar
            setTimeout(() => checkTierUpdate(attempts + 1), 1000);
          }
        } catch (error) {
          console.error('❌ Error checking tier update:', error);
          setTimeout(() => checkTierUpdate(attempts + 1), 1000);
        }
      };
      
      // Esperar 5 segundos antes de empezar a verificar
      // (dar tiempo suficiente al webhook de procesar y escribir en BD)
      console.log('⏳ Waiting 5 seconds for webhook to process...');
      setTimeout(() => checkTierUpdate(), 5000);
    }
  }, [update, user]);

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
        isPremium,
        topic, 
        audience, 
        goal
      );

      // 4. Show Results
      setResult(analysis);
      setAppState(AppState.RESULTS);
      
      // 5. 🆕 Recargar límites después del análisis exitoso
      loadAnalysisLimit();
      
    } catch (error: any) {
      console.error(error);
      setAppState(AppState.ERROR);
      
      // 🆕 Verificar si es error de límite alcanzado (429)
      if (error.message?.includes('Límite de análisis') || error.message?.includes('429')) {
        setErrorMsg(
          language === 'es' 
            ? 'Has alcanzado el límite de análisis mensuales de tu plan. El límite se reiniciará el próximo mes. Mejora tu plan para obtener más análisis.' 
            : "You've reached your monthly analysis limit. The limit will reset next month. Upgrade your plan for more analyses."
        );
      } else {
        setErrorMsg(
          language === 'es' 
            ? "Hubo un error analizando tu video. Intenta una grabación más corta o verifica tu conexión." 
            : "There was an error analyzing your video. Try a shorter recording or check your connection."
        );
      }
      
      // 🆕 Recargar límites incluso si falla
      loadAnalysisLimit();
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
          userId: user?.id || null
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
    setIsViewingFromHistory(false);
    // 🆕 Recargar límites al resetear
    loadAnalysisLimit();
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
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setAppState(AppState.IDLE);
  };

  // Feature Icons
  const featureIcons = [
    <Mic className="w-6 h-6 text-purple-400" />,
    <Clock className="w-6 h-6 text-purple-400" />,
    <Users className="w-6 h-6 text-purple-400" />,
    <Smile className="w-6 h-6 text-purple-400" />,
    <Target className="w-6 h-6 text-purple-400" />
  ];

  const premiumIcons = [
    <Zap className="w-6 h-6 text-yellow-400" />,
    <TrendingUp className="w-6 h-6 text-yellow-400" />,
    <Mic2 className="w-6 h-6 text-yellow-400" />,
    <Shirt className="w-6 h-6 text-yellow-400" />,
    <LayoutTemplate className="w-6 h-6 text-yellow-400" />
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-black/30 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetApp}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Oratoria<span className="text-purple-400">AI</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Globe className="w-5 h-5" />
            </button>

            {user && (
              <>
                <button
                  onClick={() => setAppState(AppState.HISTORY)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    appState === AppState.HISTORY ? 'bg-purple-600' : 'hover:bg-gray-800'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.navHistory}</span>
                </button>

                <button
                  onClick={() => setAppState(AppState.PROFILE)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    appState === AppState.PROFILE ? 'bg-purple-600' : 'hover:bg-gray-800'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.name || user?.email}</span>
                </button>
              </>
            )}

            {/* Botón Ver Planes - Disponible para TODOS los usuarios */}
            <button
              onClick={() => setAppState(AppState.PRICING)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                isPremium 
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'es' ? 'Ver Planes' : 'View Plans'}
              </span>
            </button>

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t.navLogout}</span>
              </button>
            ) : (
              <button
                onClick={() => setAppState(AppState.LOGIN)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">{t.navLogin}</span>
              </button>
            )}
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

            {/* 🆕 1. CARACTERÍSTICAS - PRIMERO */}
            <div className="flex flex-wrap justify-center gap-6 w-full max-w-6xl">
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

            {/* 🆕 2. BOTÓN Y PLAN - DESPUÉS */}
            <div className="w-full max-w-4xl bg-gray-900/50 p-1 rounded-3xl border border-gray-800 backdrop-blur-sm">
               <div className="bg-black rounded-[20px] p-8 md:p-12">
                  <div className="flex flex-col items-center gap-6">
                    {/* Botón con validación de límites */}
                    <button 
                      onClick={() => {
                        if (user && analysisLimit && !analysisLimit.canAnalyze) {
                          setAppState(AppState.ERROR);
                          setErrorMsg(
                            language === 'es'
                              ? 'Has alcanzado el límite de análisis mensuales. Mejora tu plan para continuar.'
                              : 'Monthly analysis limit reached. Upgrade your plan to continue.'
                          );
                        } else {
                          setAppState(AppState.RECORDING);
                        }
                      }}
                      disabled={user && analysisLimit !== null && !analysisLimit.canAnalyze}
                      className={`group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 font-lg rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                        user && analysisLimit !== null && !analysisLimit.canAnalyze
                          ? 'bg-gray-600 cursor-not-allowed opacity-50'
                          : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-600'
                      }`}
                    >
                      <span className="mr-2 text-lg">{t.startBtn}</span>
                      <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      {user && analysisLimit !== null && analysisLimit.canAnalyze && (
                        <div className="absolute -inset-3 rounded-full bg-purple-600 opacity-20 blur-lg group-hover:opacity-40 transition duration-200"></div>
                      )}
                    </button>
                    
                    {/* Plan Info con Contador Mensual */}
                    {user ? (
                      <div className="w-full max-w-md mt-2">
                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Crown className={`w-5 h-5 ${
                                user.tier === 'free' ? 'text-gray-400' :
                                user.tier === 'starter' ? 'text-blue-400' :
                                user.tier === 'pro' ? 'text-purple-400' :
                                'text-yellow-500'
                              }`} />
                              <span className="text-white font-bold capitalize">
                                Plan {user.tier === 'free' ? 'Gratis' : user.tier === 'starter' ? 'Starter' : user.tier === 'pro' ? 'Pro' : 'Premium'}
                              </span>
                            </div>
                            {user.tier === 'free' && (
                              <button
                                onClick={() => setAppState(AppState.PRICING)}
                                className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                              >
                                {language === 'es' ? 'Mejorar' : 'Upgrade'}
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-black/30 rounded-lg p-3">
                              <div className="text-gray-400 text-xs mb-1">
                                {language === 'es' ? 'Análisis mensuales' : 'Monthly analyses'}
                              </div>
                              <div className="text-white font-bold">
                                {user.tier === 'free' ? '3' :
                                 user.tier === 'starter' ? '5' :
                                 user.tier === 'pro' ? '10' :
                                 language === 'es' ? 'Ilimitados' : 'Unlimited'}
                              </div>
                            </div>
                            
                            <div className="bg-black/30 rounded-lg p-3">
                              <div className="text-gray-400 text-xs mb-1">
                                {language === 'es' ? 'Duración máx.' : 'Max duration'}
                              </div>
                              <div className="text-white font-bold">
                                {user.tier === 'free' ? '1 min' :
                                 user.tier === 'starter' ? '15 min' :
                                 user.tier === 'pro' ? '30 min' :
                                 '1 hora'}
                              </div>
                            </div>
                          </div>

                          {/* INDICADOR DE ANÁLISIS RESTANTES ESTE MES */}
                          {analysisLimit && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">
                                  {language === 'es' ? 'Disponibles este mes:' : 'Available this month:'}
                                </span>
                                <span className={`text-sm font-bold ${
                                  analysisLimit.remaining === 'unlimited' ? 'text-green-400' :
                                  analysisLimit.remaining === 0 ? 'text-red-400' :
                                  analysisLimit.remaining <= 2 ? 'text-yellow-400' :
                                  'text-green-400'
                                }`}>
                                  {analysisLimit.remaining === 'unlimited' 
                                    ? '∞' 
                                    : `${analysisLimit.remaining} / ${
                                        user.tier === 'free' ? '3' :
                                        user.tier === 'starter' ? '5' :
                                        user.tier === 'pro' ? '10' :
                                        '∞'
                                      }`
                                  }
                                </span>
                              </div>
                              
                              {/* BARRA DE PROGRESO */}
                              {analysisLimit.remaining !== 'unlimited' && (
                                <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2">
                                  <div 
                                    className={`h-1.5 rounded-full transition-all ${
                                      analysisLimit.remaining === 0 ? 'bg-red-500' :
                                      analysisLimit.remaining <= 2 ? 'bg-yellow-500' :
                                      'bg-green-500'
                                    }`}
                                    style={{ 
                                      width: `${
                                        (Number(analysisLimit.remaining) / (
                                          user.tier === 'free' ? 3 :
                                          user.tier === 'starter' ? 5 :
                                          user.tier === 'pro' ? 10 : 1
                                        )) * 100
                                      }%` 
                                    }}
                                  ></div>
                                </div>
                              )}
                              
                              {analysisLimit.remaining === 0 && (
                                <p className="text-xs text-red-400 mt-1">
                                  {language === 'es' 
                                    ? 'Límite alcanzado. Se reinicia el próximo mes o mejora tu plan.' 
                                    : 'Limit reached. Resets next month or upgrade your plan.'}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 uppercase tracking-widest">{t.noLogin}</p>
                    )}

                  </div>
               </div>
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
                          <option value="" disabled className="bg-gray-900">{t.goalPlaceholder}</option>
                          {t.goals.map((g, i) => (
                            <option key={i} value={g} className="bg-gray-900">{g}</option>
                          ))}
                        </select>
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
             )}

            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-3xl p-8 shadow-2xl shadow-purple-500/10 max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">{t.stageTitle}</h2>
                <p className="text-gray-400">{t.stageDesc}</p>
              </div>
              <Recorder onRecordingComplete={handleRecordingComplete} language={language} />
              <div className="flex justify-center mt-6">
                <button
                  onClick={resetApp}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State: PROCESSING */}
        {appState === AppState.PROCESSING && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in py-20">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Mic className="w-10 h-10 text-purple-400 animate-pulse" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">{t.processing}</h2>
            <p className="text-gray-400 max-w-md text-center">{t.processingDesc}</p>
          </div>
        )}

        {/* State: ANALYZING */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in py-20">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-pink-400 animate-pulse" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">{t.analyzing}</h2>
            <p className="text-gray-400 max-w-md text-center">{t.analyzingDesc}</p>
          </div>
        )}

        {/* State: RESULTS */}
        {appState === AppState.RESULTS && result && (
          <ResultsView 
            result={result} 
            onReset={resetApp} 
            language={language}
            onSave={handleSaveResult}
          />
        )}

        {/* State: ERROR */}
        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in py-20">
            <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center border-4 border-red-600">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-red-400">{t.errorTitle}</h2>
            <p className="text-gray-400 max-w-md text-center">{errorMsg}</p>
            <button
              onClick={resetApp}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-colors"
            >
              {t.retry}
            </button>
          </div>
        )}

        {/* State: PREMIUM */}
        {appState === AppState.PREMIUM && (
          <PremiumView 
            onClose={resetApp} 
            onSubscribeSuccess={handleSubscribeSuccess}
            language={language}
          />
        )}

        {/* State: PRICING */}
        {appState === AppState.PRICING && (
          <PricingView 
            onClose={resetApp}
            language={language}
          />
        )}

        {/* State: HISTORY */}
        {appState === AppState.HISTORY && (
          <HistoryView
            onClose={resetApp}
            language={language}
            onViewAnalysis={(analysis) => {
              setResult(analysis);
              setIsViewingFromHistory(true);
              setAppState(AppState.RESULTS);
            }}
          />
        )}

        {/* State: LOGIN */}
        {appState === AppState.LOGIN && (
          <LoginView 
            onClose={resetApp}
            onLoginSuccess={handleLoginSuccess}
            language={language}
          />
        )}

        {/* State: PROFILE */}
        {appState === AppState.PROFILE && user && (
          <ProfileView
            onClose={resetApp}
            language={language}
          />
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <HomePageContent />
    </SessionProvider>
  );
}

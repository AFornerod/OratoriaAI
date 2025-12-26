'use client'

import React, { useState, useEffect } from 'react';
import { ArrowLeft, User as UserIcon, Crown, Mail, LogOut, Trash2, Shield, BarChart3 } from 'lucide-react';
import { Language } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';

interface ProfileViewProps {
  onBack: () => void;
  onLogout: () => void;
  language: Language;
}

// 🆕 VARIABLES GLOBALES DEL MÓDULO - Sobreviven a re-mounts
let globalIsLoading = false;
let globalHasLoaded = false;
let globalCachedData: any = null;
let globalLastEmail: string | null = null;

const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onLogout, language }) => {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [analysisLimit, setAnalysisLimit] = useState<{
    used: number;
    remaining: number | 'unlimited';
    canAnalyze: boolean;
    tier: string;
    currentMonth?: string;
    resetsAt?: string;
  } | null>(globalCachedData); // 🆕 Inicializar con datos cacheados
  const [isLoadingLimit, setIsLoadingLimit] = useState(false);
  const [limitError, setLimitError] = useState(false);

  const t = {
    es: {
      title: "Mi Perfil",
      back: "Volver",
      accountInfo: "Información de Cuenta",
      name: "Nombre",
      email: "Correo Electrónico",
      tier: "Plan Actual",
      monthlyUsage: "Consumo Este Mes",
      analysesPerformed: "Análisis realizados:",
      available: "Disponibles:",
      limit: "Límite:",
      resetsOn: "Se reinicia:",
      limitReached: "⚠️ Has alcanzado tu límite mensual. Mejora tu plan para continuar.",
      errorLoading: "Error al cargar el consumo",
      actions: "Acciones",
      logout: "Cerrar Sesión",
      deleteAccount: "Eliminar Cuenta",
      deleteConfirm: "¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.",
      cancel: "Cancelar",
      confirmDelete: "Sí, Eliminar",
      
      tiers: {
        free: "Gratis",
        starter: "Starter",
        pro: "Pro",
        premium: "Premium"
      }
    },
    en: {
      title: "My Profile",
      back: "Back",
      accountInfo: "Account Information",
      name: "Name",
      email: "Email",
      tier: "Current Plan",
      monthlyUsage: "Usage This Month",
      analysesPerformed: "Analyses performed:",
      available: "Available:",
      limit: "Limit:",
      resetsOn: "Resets:",
      limitReached: "⚠️ Monthly limit reached. Upgrade your plan to continue.",
      errorLoading: "Error loading usage",
      actions: "Actions",
      logout: "Sign Out",
      deleteAccount: "Delete Account",
      deleteConfirm: "Are you sure you want to delete your account? This action cannot be undone.",
      cancel: "Cancel",
      confirmDelete: "Yes, Delete",
      
      tiers: {
        free: "Free",
        starter: "Starter",
        pro: "Pro",
        premium: "Premium"
      }
    }
  }[language];

  // Cargar límites de análisis
  const loadAnalysisLimit = async () => {
    // 🛑 TRIPLE VERIFICACIÓN
    if (globalIsLoading) {
      console.log('⏭️ [ProfileView] Already loading, skipping...');
      return;
    }

    if (globalHasLoaded && globalLastEmail === user?.email) {
      console.log('⏭️ [ProfileView] Already loaded for this user, skipping...');
      return;
    }

    console.log('📊 [ProfileView] Loading analysis limits...');
    globalIsLoading = true;
    setIsLoadingLimit(true);
    setLimitError(false);
    
    try {
      const response = await fetch('/api/check-limit');
      console.log('📊 [ProfileView] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 [ProfileView] Received data:', data);
      
      if (data.success) {
        const limitData = {
          used: data.used || 0,
          remaining: data.remaining !== undefined ? data.remaining : 'unlimited',
          canAnalyze: data.canAnalyze !== false,
          tier: data.tier || user?.tier || 'free',
          currentMonth: data.currentMonth,
          resetsAt: data.resetsAt,
        };

        setAnalysisLimit(limitData);
        
        // 🆕 Guardar en cache global
        globalCachedData = limitData;
        globalHasLoaded = true;
        globalLastEmail = user?.email || null;
        
        console.log('✅ [ProfileView] Limits loaded and cached');
      } else {
        console.error('❌ [ProfileView] API returned success=false:', data);
        setLimitError(true);
      }
    } catch (error) {
      console.error('❌ [ProfileView] Error loading analysis limit:', error);
      setLimitError(true);
    } finally {
      setIsLoadingLimit(false);
      globalIsLoading = false;
    }
  };

  // Cargar datos al montar
  useEffect(() => {
    console.log('🎬 [ProfileView] Component mounted');
    
    if (!user?.email) {
      console.log('⏭️ [ProfileView] No user email, skipping...');
      return;
    }

    // Si cambia el usuario, resetear cache
    if (globalLastEmail && globalLastEmail !== user.email) {
      console.log('🔄 [ProfileView] User changed, resetting cache...');
      globalHasLoaded = false;
      globalCachedData = null;
      globalLastEmail = null;
    }

    // Si ya hay datos cacheados, usarlos
    if (globalCachedData && globalLastEmail === user.email) {
      console.log('📦 [ProfileView] Using cached data');
      setAnalysisLimit(globalCachedData);
    } else if (!globalIsLoading && !globalHasLoaded) {
      // Solo cargar si no está cargando y no se ha cargado
      console.log('🆕 [ProfileView] First load, fetching...');
      loadAnalysisLimit();
    }

    return () => {
      console.log('🔚 [ProfileView] Component unmounting');
    };
  }, []); // Array vacío

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'from-yellow-600 to-yellow-500';
      case 'pro': return 'from-purple-600 to-indigo-600';
      case 'starter': return 'from-blue-600 to-cyan-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getTierLimit = (tier: string) => {
    switch (tier) {
      case 'free': return 3;
      case 'starter': return 5;
      case 'pro': return 10;
      case 'premium': return '∞';
      default: return 0;
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
  };

  const handleRetry = () => {
    console.log('🔄 [ProfileView] Manual retry');
    globalHasLoaded = false;
    globalIsLoading = false;
    globalCachedData = null;
    loadAnalysisLimit();
  };

  if (!user) {
    return null;
  }

  const displayName = user.name || user.email?.split('@')[0] || 'Usuario';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.back}
        </button>

        <div className="flex items-center gap-3 mb-8">
          <UserIcon className="w-8 h-8 text-purple-500" />
          <h1 className="text-4xl font-bold text-white">{t.title}</h1>
        </div>

        {/* Account Info Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">{t.accountInfo}</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">{t.name}</label>
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-gray-500" />
                <span className="text-white text-lg">{displayName}</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">{t.email}</label>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-white text-lg">{user.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">{t.tier}</label>
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-gray-500" />
                <span className={`px-4 py-2 bg-gradient-to-r ${getTierColor(user.tier)} text-white font-bold rounded-lg uppercase`}>
                  {t.tiers[user.tier as keyof typeof t.tiers] || user.tier}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-semibold text-gray-300">{t.monthlyUsage}</h4>
              </div>
              
              {isLoadingLimit ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : limitError ? (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{t.errorLoading}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
                  >
                    {language === 'es' ? 'Reintentar' : 'Retry'}
                  </button>
                </div>
              ) : analysisLimit ? (
                <div className="space-y-3 p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{t.analysesPerformed}</span>
                    <span className={`font-bold text-lg ${
                      analysisLimit.remaining === 'unlimited' ? 'text-green-400' :
                      analysisLimit.remaining === 0 ? 'text-red-400' :
                      analysisLimit.remaining <= 2 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {analysisLimit.remaining === 'unlimited' 
                        ? '∞' 
                        : `${analysisLimit.used} / ${getTierLimit(user.tier)}`
                      }
                    </span>
                  </div>

                  {analysisLimit.remaining !== 'unlimited' && (
                    <div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            analysisLimit.remaining === 0 ? 'bg-red-500' :
                            analysisLimit.remaining <= 2 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min(
                              (analysisLimit.used / (
                                user.tier === 'free' ? 3 :
                                user.tier === 'starter' ? 5 :
                                user.tier === 'pro' ? 10 : 1
                              )) * 100,
                              100
                            )}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {t.available} {analysisLimit.remaining}
                        </span>
                        <span className="text-xs text-gray-500">
                          {t.limit} {getTierLimit(user.tier)}
                        </span>
                      </div>
                    </div>
                  )}

                  {analysisLimit.resetsAt && analysisLimit.remaining !== 'unlimited' && (
                    <div className="pt-2 border-t border-gray-700/50">
                      <p className="text-xs text-gray-400">
                        {t.resetsOn}{' '}
                        <span className="text-purple-400 font-semibold">
                          {new Date(analysisLimit.resetsAt).toLocaleDateString(
                            language === 'es' ? 'es-ES' : 'en-US',
                            { month: 'long', day: 'numeric', year: 'numeric' }
                          )}
                        </span>
                      </p>
                    </div>
                  )}

                  {analysisLimit.remaining === 0 && (
                    <div className="mt-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <p className="text-xs text-red-400">{t.limitReached}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">{t.actions}</h2>
          
          <div className="space-y-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-white" />
                <span className="text-white font-semibold">{t.logout}</span>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white rotate-180" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-4 bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">{t.deleteAccount}</span>
              </div>
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-red-500/50 rounded-2xl p-8 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-red-500" />
                <h3 className="text-2xl font-bold text-white">{t.deleteAccount}</h3>
              </div>
              
              <p className="text-gray-300 mb-6">{t.deleteConfirm}</p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {t.confirmDelete}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;

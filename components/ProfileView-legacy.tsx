'use client'

import React, { useState } from 'react';
import { ArrowLeft, User as UserIcon, Crown, Mail, LogOut, Trash2, Shield } from 'lucide-react';
import { Language } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';

interface ProfileViewProps {
  onBack: () => void;
  onLogout: () => void;
  language: Language;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onLogout, language }) => {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const t = {
    es: {
      title: "Mi Perfil",
      back: "Volver",
      accountInfo: "Información de Cuenta",
      name: "Nombre",
      email: "Correo Electrónico",
      tier: "Plan Actual",
      memberSince: "Miembro desde",
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
      memberSince: "Member since",
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'from-pink-600 to-purple-600';
      case 'pro': return 'from-purple-600 to-indigo-600';
      case 'starter': return 'from-blue-600 to-cyan-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const handleDeleteAccount = () => {
    // TODO: Implement actual account deletion
    setShowDeleteConfirm(false);
  };

  if (!user) {
    return null;
  }

  const displayName = user.name || user.email?.split('@')[0] || 'Usuario';
  const firstLetter = (user.name || user.email || 'U').charAt(0).toUpperCase();

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
            {/* Name */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">{t.name}</label>
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-gray-500" />
                <span className="text-white text-lg">{displayName}</span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">{t.email}</label>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-white text-lg">{user.email}</span>
              </div>
            </div>

            {/* Tier */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">{t.tier}</label>
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-gray-500" />
                <span className={`px-4 py-2 bg-gradient-to-r ${getTierColor(user.tier)} text-white font-bold rounded-lg uppercase`}>
                  {t.tiers[user.tier as keyof typeof t.tiers] || user.tier}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">{t.actions}</h2>
          
          <div className="space-y-4">
            {/* Logout */}
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

            {/* Delete Account */}
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

        {/* Delete Confirmation Modal */}
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
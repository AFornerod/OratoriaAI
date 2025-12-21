'use client'

import React, { useState } from 'react';
import { ArrowLeft, LogIn, Lock, Mail, Loader2 } from 'lucide-react';
import { Language } from '@/types';
import { loginUser } from '@/lib/services/storageService';

interface LoginViewProps {
  onBack: () => void;
  language: Language;
  onLoginSuccess: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onBack, language, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = {
    es: {
      title: "Iniciar Sesión",
      subtitle: "Accede a tu cuenta Premium y recupera tu historial.",
      emailLabel: "Correo Electrónico",
      passLabel: "Contraseña",
      btn: "Ingresar",
      back: "Volver",
      error: "Credenciales inválidas o usuario no encontrado.",
      placeholderEmail: "tu@email.com",
      placeholderPass: "••••••••"
    },
    en: {
      title: "Log In",
      subtitle: "Access your Premium account and retrieve your history.",
      emailLabel: "Email Address",
      passLabel: "Password",
      btn: "Sign In",
      back: "Back",
      error: "Invalid credentials or user not found.",
      placeholderEmail: "you@email.com",
      placeholderPass: "••••••••"
    }
  }[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate network delay
    setTimeout(() => {
      try {
        loginUser(email, password);
        onLoginSuccess();
      } catch (err) {
        setError(t.error);
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-6 h-6 text-purple-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{t.title}</h2>
          <p className="text-gray-400 text-sm">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.emailLabel}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholderEmail}
                required
                className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.passLabel}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.placeholderPass}
                required
                className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-purple-600 text-white font-bold text-lg rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
              </>
            ) : (
              t.btn
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;


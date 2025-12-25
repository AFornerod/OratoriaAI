'use client'

import React, { useState } from 'react';
import { ArrowLeft, LogIn, Lock, Mail, Loader2 } from 'lucide-react';
import { Language } from '@/types';
import { signIn } from 'next-auth/react';

interface LoginViewProps {
  onBack: () => void;
  onLoginSuccess: () => void;
  language: Language;
}

const LoginView: React.FC<LoginViewProps> = ({ onBack, onLoginSuccess, language }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    es: {
      title: "Iniciar Sesión",
      email: "Correo Electrónico",
      password: "Contraseña",
      loginButton: "Iniciar Sesión",
      noAccount: "¿No tienes cuenta?",
      createAccount: "Crear una",
      back: "Volver",
      errorGeneric: "Error al iniciar sesión. Verifica tus credenciales.",
      errorEmail: "Por favor ingresa un email válido",
      errorPassword: "La contraseña debe tener al menos 6 caracteres",
    },
    en: {
      title: "Sign In",
      email: "Email",
      password: "Password",
      loginButton: "Sign In",
      noAccount: "Don't have an account?",
      createAccount: "Create one",
      back: "Back",
      errorGeneric: "Login error. Check your credentials.",
      errorEmail: "Please enter a valid email",
      errorPassword: "Password must be at least 6 characters",
    }
  }[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!email || !email.includes('@')) {
      setError(t.errorEmail);
      return;
    }

    if (!password || password.length < 6) {
      setError(t.errorPassword);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t.errorGeneric);
        setIsLoading(false);
        return;
      }

      // Success
      onLoginSuccess();
    } catch (err) {
      console.error('Login error:', err);
      setError(t.errorGeneric);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.back}
        </button>

        <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-8">
            {t.title}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="tu@email.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {language === 'es' ? 'Iniciando...' : 'Signing in...'}
                </>
              ) : (
                t.loginButton
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
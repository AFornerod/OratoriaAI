'use client'

import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Calendar, CreditCard, LogOut, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Language, User as UserType } from '@/types';
import { deleteAccount, logoutUser } from '@/lib/services/storageService';

interface ProfileViewProps {
  user: UserType;
  onBack: () => void;
  language: Language;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onBack, language, onLogout }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const t = {
    es: {
      title: "Mi Perfil",
      subtitle: "Gestiona tu cuenta y suscripción.",
      details: "Detalles de la Cuenta",
      memberSince: "Miembro desde",
      subscription: "Suscripción",
      plan: "Plan Premium",
      active: "Activo",
      price: "$9.99/mes",
      nextBilling: "Próxima facturación: en 30 días",
      cancelBtn: "Cancelar Suscripción",
      back: "Volver",
      logout: "Cerrar Sesión",
      confirmTitle: "¿Estás seguro?",
      confirmDesc: "Al cancelar, perderás acceso a las funciones Premium y se eliminará tu cuenta de nuestra base de datos. Esta acción no se puede deshacer.",
      confirmYes: "Sí, cancelar y eliminar cuenta",
      confirmNo: "No, mantener mi plan",
      paymentMethod: "Método de Pago",
      card: "•••• •••• •••• 4242"
    },
    en: {
      title: "My Profile",
      subtitle: "Manage your account and subscription.",
      details: "Account Details",
      memberSince: "Member since",
      subscription: "Subscription",
      plan: "Premium Plan",
      active: "Active",
      price: "$9.99/month",
      nextBilling: "Next billing: in 30 days",
      cancelBtn: "Cancel Subscription",
      back: "Back",
      logout: "Log Out",
      confirmTitle: "Are you sure?",
      confirmDesc: "By canceling, you will lose access to Premium features and your account will be deleted from our database. This action cannot be undone.",
      confirmYes: "Yes, cancel and delete account",
      confirmNo: "No, keep my plan",
      paymentMethod: "Payment Method",
      card: "•••• •••• •••• 4242"
    }
  }[language];

  const handleCancelSubscription = () => {
    deleteAccount(user.id);
    onLogout(); // This will trigger the app reset in parent
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" /> {t.back}
      </button>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* User Card */}
        <div className="w-full md:w-1/3 bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center shadow-lg">
           <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
              <span className="text-4xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
           </div>
           <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
           <p className="text-gray-400 text-sm mb-6">{user.email}</p>
           
           <button 
             onClick={onLogout}
             className="w-full py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-medium"
           >
             <LogOut className="w-4 h-4" /> {t.logout}
           </button>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-2/3 space-y-6">
          
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" /> {t.details}
            </h3>
            <div className="space-y-4">
               <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300 text-sm">{user.email}</span>
               </div>
               <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300 text-sm">
                    {t.memberSince} {new Date(user.joinDate).toLocaleDateString()}
                  </span>
               </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-yellow-500/20 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-24 h-24 text-yellow-500" />
             </div>
             
             <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-yellow-500" /> {t.subscription}
                </h3>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30 uppercase">
                  {t.active}
                </span>
             </div>

             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                   <div>
                      <div className="text-white font-bold">{t.plan}</div>
                      <div className="text-xs text-gray-500">{t.price}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-gray-300 text-sm">{t.card}</div>
                      <div className="text-xs text-gray-500">{t.paymentMethod}</div>
                   </div>
                </div>
                
                <div className="text-xs text-gray-500 italic">
                   {t.nextBilling}
                </div>

                {!showConfirm ? (
                   <button 
                     onClick={() => setShowConfirm(true)}
                     className="mt-4 text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-2 transition-colors"
                   >
                     <Trash2 className="w-4 h-4" /> {t.cancelBtn}
                   </button>
                ) : (
                   <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl animate-fade-in">
                      <div className="flex items-start gap-3 mb-3">
                         <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                         <div>
                            <h4 className="font-bold text-red-400 text-sm">{t.confirmTitle}</h4>
                            <p className="text-xs text-gray-400 mt-1">{t.confirmDesc}</p>
                         </div>
                      </div>
                      <div className="flex gap-3">
                         <button 
                           onClick={handleCancelSubscription}
                           className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
                         >
                           {t.confirmYes}
                         </button>
                         <button 
                           onClick={() => setShowConfirm(false)}
                           className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded-lg transition-colors"
                         >
                           {t.confirmNo}
                         </button>
                      </div>
                   </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileView;

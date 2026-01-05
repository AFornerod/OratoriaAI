// components/Footer.tsx
import React from 'react';
import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-400">
          <Mail className="w-4 h-4" />
          <span className="text-sm">Soporte:</span>
          <a 
            href="mailto:info@dominatuia.com"
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
          >
            info@dominatuia.com
          </a>
        </div>
      </div>
    </footer>
  );
}
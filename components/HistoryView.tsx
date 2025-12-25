'use client'

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, TrendingUp, FileText, Loader2, History as HistoryIcon } from 'lucide-react';
import { Language } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';

interface HistoryViewProps {
  onBack: () => void;
  language: Language;
  onViewAnalysis: (analysis: any) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onBack, language, onViewAnalysis }) => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = {
    es: {
      title: "Historial de Análisis",
      noAnalyses: "No tienes análisis guardados todavía.",
      startPracticing: "Comienza a practicar para ver tu progreso aquí.",
      loading: "Cargando historial...",
      error: "Error al cargar el historial",
      back: "Volver",
      score: "Puntuación",
      date: "Fecha",
      topic: "Tema",
      view: "Ver Detalles",
      avgScore: "Puntuación Promedio",
      totalAnalyses: "Total de Análisis",
    },
    en: {
      title: "Analysis History",
      noAnalyses: "You don't have any saved analyses yet.",
      startPracticing: "Start practicing to see your progress here.",
      loading: "Loading history...",
      error: "Error loading history",
      back: "Back",
      score: "Score",
      date: "Date",
      topic: "Topic",
      view: "View Details",
      avgScore: "Average Score",
      totalAnalyses: "Total Analyses",
    }
  }[language];

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        setError(t.error);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/history', {
        headers: {
          'x-user-id': user.id
        }
      });
      
      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || t.error);
        setIsLoading(false);
        return;
      }

      setAnalyses(data.analyses || []);
      setIsLoading(false);

    } catch (err) {
      console.error('Error loading history:', err);
      setError(t.error);
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.overall_score, 0) / analyses.length)
    : 0;

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

        <div className="flex items-center gap-3 mb-8">
          <HistoryIcon className="w-8 h-8 text-purple-500" />
          <h1 className="text-4xl font-bold text-white">{t.title}</h1>
        </div>

        {/* Stats */}
        {analyses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-purple-500" />
                <h3 className="text-lg font-semibold text-white">{t.avgScore}</h3>
              </div>
              <p className={`text-5xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6 text-pink-500" />
                <h3 className="text-lg font-semibold text-white">{t.totalAnalyses}</h3>
              </div>
              <p className="text-5xl font-bold text-pink-500">{analyses.length}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-400">{t.loading}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && analyses.length === 0 && (
          <div className="text-center py-20">
            <HistoryIcon className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{t.noAnalyses}</h2>
            <p className="text-gray-400">{t.startPracticing}</p>
          </div>
        )}

        {/* Analyses List */}
        {!isLoading && !error && analyses.length > 0 && (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-800 hover:border-purple-500 transition-all cursor-pointer"
                onClick={() => onViewAnalysis(analysis)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-4xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                        {analysis.overall_score}
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {analysis.topic || (language === 'es' ? 'Sin tema' : 'No topic')}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {analysis.summary}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(analysis.created_at)}
                      </div>
                      {analysis.tier && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs uppercase">
                          {analysis.tier}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewAnalysis(analysis);
                    }}
                  >
                    {t.view}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
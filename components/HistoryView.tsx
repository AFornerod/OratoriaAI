import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { AnalysisHistoryItem, Language } from '@/types';
import { ArrowLeft, Calendar, TrendingUp, Award, Target, FileText, Trash2 } from 'lucide-react';
import { clearHistory } from '@/lib/services/storageService';

interface HistoryViewProps {
  history: AnalysisHistoryItem[];
  onBack: () => void;
  language: Language;
  onRefresh: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onBack, language, onRefresh }) => {
  
  const t = {
    es: {
      title: "Historial de Progreso",
      subtitle: "Visualiza tu evolución y mejora continua.",
      empty: "Aún no hay historial. Guarda tus análisis para ver tu progreso aquí.",
      scoreEvolution: "Evolución de Puntuación General",
      fillerEvolution: "Reducción de Muletillas (Total)",
      sessions: "Sesiones Anteriores",
      date: "Fecha",
      score: "Puntuación",
      clear: "Borrar Historial",
      topic: "Tema",
      goal: "Objetivo"
    },
    en: {
      title: "Progress History",
      subtitle: "Visualize your evolution and continuous improvement.",
      empty: "No history yet. Save your analyses to see your progress here.",
      scoreEvolution: "Overall Score Evolution",
      fillerEvolution: "Filler Words Reduction (Total)",
      sessions: "Past Sessions",
      date: "Date",
      score: "Score",
      clear: "Clear History",
      topic: "Topic",
      goal: "Goal"
    }
  }[language];

  const handleClear = () => {
    if (confirm(language === 'es' ? '¿Estás seguro de borrar todo el historial?' : 'Are you sure you want to clear all history?')) {
      clearHistory();
      onRefresh();
    }
  };

  // Process data for charts (Reverse to show chronological order left-to-right)
  const chartData = useMemo(() => {
    return [...history].reverse().map(item => ({
      date: new Date(item.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' }),
      score: item.result.overallScore,
      fillers: item.result.fillerWords.reduce((acc, curr) => acc + curr.count, 0)
    }));
  }, [history, language]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
           <TrendingUp className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
        <p className="text-gray-400 mb-8 max-w-md">{t.empty}</p>
        <button onClick={onBack} className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {language === 'es' ? 'Volver' : 'Back'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">{t.title}</h2>
          <p className="text-gray-400 text-sm">{t.subtitle}</p>
        </div>
        <button onClick={handleClear} className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-900/20 transition-colors" title={t.clear}>
           <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Overall Score Chart */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" /> {t.scoreEvolution}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filler Words Chart */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
             <Target className="w-5 h-5 text-red-500" /> {t.fillerEvolution}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#f87171' }}
                />
                <Line type="monotone" dataKey="fillers" stroke="#f87171" strokeWidth={3} dot={{r: 4, fill: '#f87171'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* History List */}
      <h3 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-purple-500">{t.sessions}</h3>
      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="bg-gray-900/50 hover:bg-gray-900 border border-gray-800 rounded-xl p-6 transition-all group">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-800 border border-gray-700">
                  <span className={`text-2xl font-bold ${item.result.overallScore >= 80 ? 'text-green-500' : item.result.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {item.result.overallScore}
                  </span>
                </div>
                <div>
                   <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.date).toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                   </div>
                   {(item.topic || item.goal) && (
                     <div className="flex flex-wrap gap-2 mt-1">
                        {item.goal && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-500/20">
                            <Target className="w-3 h-3 mr-1" /> {item.goal}
                          </span>
                        )}
                        {item.topic && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-500/20">
                             <FileText className="w-3 h-3 mr-1" /> {item.topic.substring(0, 30)}{item.topic.length > 30 ? '...' : ''}
                          </span>
                        )}
                     </div>
                   )}
                </div>
              </div>
              
              <div className="flex gap-4 md:gap-8 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-800">
                 <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{t.score}</div>
                    <div className="font-bold text-white">{item.result.overallScore}/100</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{language === 'es' ? 'Muletillas' : 'Fillers'}</div>
                    <div className="font-bold text-white">{item.result.fillerWords.reduce((a, b) => a + b.count, 0)}</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{language === 'es' ? 'Ritmo' : 'Pace'}</div>
                    <div className="font-bold text-blue-400">{item.result.pacing.wpm} wpm</div>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;

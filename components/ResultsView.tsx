'use client'

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie
} from 'recharts';
import { AnalysisResult, Language } from '@/types';
import { CheckCircle, Zap, Activity, Eye, Mic, MessageSquareText, Dumbbell, Repeat, BookOpen, Mic2, Shirt, Lightbulb, User, Scissors, Save, Check } from 'lucide-react';

interface ResultsViewProps {
  result: AnalysisResult;
  onReset: () => void;
  language: Language;
  onSave?: () => void;
  isPremium?: boolean;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, onReset, language, onSave, isPremium }) => {
  const [saved, setSaved] = useState(false);

  const handleSaveClick = () => {
    if (onSave) {
      onSave();
      setSaved(true);
    }
  };
  
  const t = {
    es: {
      completed: "Análisis Completado",
      points: "Puntos",
      fillerWords: "Muletillas",
      noFillerWords: "¡Excelente! No se detectaron muletillas.",
      pacingEmotion: "Ritmo & Emoción",
      speed: "Velocidad",
      emotionalAnalysis: "Análisis Emocional",
      skills: "Habilidades",
      bodyLanguage: "Lenguaje Corporal",
      eyeContact: "Contacto Visual",
      posture: "Postura",
      gestures: "Gestos",
      speechAnalysis: "Análisis del Discurso",
      clarity: "Claridad",
      coherence: "Coherencia",
      persuasion: "Persuasión",
      actionPlan: "Plan de Acción Personalizado",
      exercises: "Ejercicios",
      dynamics: "Dinámicas",
      resources: "Lecturas y Recursos",
      quickTips: "Tips Rápidos",
      practiceAgain: "Practicar de Nuevo",
      saveToHistory: "Guardar en Historial",
      saved: "Guardado",
      radarKeys: {
        contact: 'Contacto Visual',
        posture: 'Postura',
        content: 'Contenido',
        rhythm: 'Ritmo',
        clarity: 'Claridad'
      },
      premium: {
        vocalTitle: "Análisis Vocal Avanzado",
        imageTitle: "Asesoría de Imagen IA",
        tone: "Variedad Tonal",
        volume: "Control de Volumen",
        articulation: "Articulación",
        attire: "Vestimenta",
        hair: "Peinado",
        face: "Rostro & Maquillaje"
      }
    },
    en: {
      completed: "Analysis Completed",
      points: "Points",
      fillerWords: "Filler Words",
      noFillerWords: "Excellent! No filler words detected.",
      pacingEmotion: "Pacing & Emotion",
      speed: "Speed",
      emotionalAnalysis: "Emotional Analysis",
      skills: "Skills",
      bodyLanguage: "Body Language",
      eyeContact: "Eye Contact",
      posture: "Posture",
      gestures: "Gestures",
      speechAnalysis: "Speech Analysis",
      clarity: "Clarity",
      coherence: "Coherence",
      persuasion: "Persuasion",
      actionPlan: "Personalized Action Plan",
      exercises: "Exercises",
      dynamics: "Dynamics",
      resources: "Readings & Resources",
      quickTips: "Quick Tips",
      practiceAgain: "Practice Again",
      saveToHistory: "Save to History",
      saved: "Saved",
      radarKeys: {
        contact: 'Eye Contact',
        posture: 'Posture',
        content: 'Content',
        rhythm: 'Pacing',
        clarity: 'Clarity'
      },
      premium: {
        vocalTitle: "Advanced Vocal Analysis",
        imageTitle: "AI Image Consulting",
        tone: "Tone Variety",
        volume: "Volume Control",
        articulation: "Articulation",
        attire: "Attire",
        hair: "Hairstyle",
        face: "Face & Makeup"
      }
    }
  }[language];

  // Data for charts
  const fillerWordsData = result.fillerWords.map(fw => ({ name: fw.word, count: fw.count }));
  
  // Calculate a simplified radar score for visualization
  const getScore = (val: string) => {
    // Both English and Spanish values need to be mapped if the API returned English
    if (['Excelente', 'Excellent', 'Erguido', 'Upright', 'Naturales', 'Natural', 'Normal', 'Muy Claro', 'Very Clear', 'Muy Persuasivo', 'Very Persuasive'].includes(val)) return 100;
    if (['Bueno', 'Good', 'Relajado', 'Relaxed', 'Rápido', 'Fast', 'Claro', 'Clear', 'Buena', 'Convincente', 'Persuasive'].includes(val)) return 75;
    if (['Limitados', 'Limited', 'Tenso', 'Tense', 'Lento', 'Slow', 'Confuso', 'Confusing', 'Baja', 'Low', 'Poco Convincente', 'Unconvincing'].includes(val)) return 50;
    return 25; 
  };

  const radarData = [
    { subject: t.radarKeys.contact, A: getScore(result.bodyLanguage.eyeContact), fullMark: 100 },
    { subject: t.radarKeys.posture, A: getScore(result.bodyLanguage.posture), fullMark: 100 },
    { subject: t.radarKeys.content, A: (getScore(result.speechAnalysis.clarity) + getScore(result.speechAnalysis.persuasion)) / 2, fullMark: 100 },
    { subject: t.radarKeys.rhythm, A: result.pacing.status === 'Normal' ? 100 : 60, fullMark: 100 },
    { subject: t.radarKeys.clarity, A: Math.max(0, 100 - (result.fillerWords.reduce((acc, curr) => acc + curr.count, 0) * 5)), fullMark: 100 },
  ];

  // Colors for Emotion Chart
  const EMOTION_COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const getMetricColor = (val: string) => {
    if (['Excelente', 'Excellent', 'Muy Claro', 'Very Clear', 'Muy Persuasivo', 'Very Persuasive', 'Erguido', 'Upright', 'Relajado', 'Relaxed', 'Naturales', 'Natural', 'Normal', 'Bueno', 'Good', 'Dinámico', 'Dynamic', 'Adecuado', 'Appropriate', 'Precisa', 'Precise'].includes(val)) return 'text-green-400';
    if (['Claro', 'Clear', 'Buena', 'Convincente', 'Persuasive', 'Variado', 'Varied'].includes(val)) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header Score */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-3xl border border-gray-700">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {t.completed}
          </h2>
          <p className="text-gray-300 max-w-xl text-lg leading-relaxed">
            {result.summary}
          </p>
        </div>
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-gray-700"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              strokeDasharray={`${result.overallScore}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-bold text-white">{result.overallScore}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{t.points}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Muletillas */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <Mic className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white">{t.fillerWords}</h3>
          </div>
          {fillerWordsData.length > 0 ? (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fillerWordsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={60} tick={{ fill: '#9ca3af' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  />
                  <Bar dataKey="count" fill="#f87171" radius={[0, 4, 4, 0]}>
                     {fillerWordsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.count > 3 ? '#ef4444' : '#f87171'} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-48 flex items-center justify-center text-gray-500">
               {t.noFillerWords}
             </div>
          )}
        </div>

        {/* Ritmo y Emociones */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-colors flex flex-col justify-between">
           <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white">{t.pacingEmotion}</h3>
            </div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-gray-400">{t.speed}</span>
              <span className="text-2xl font-bold text-blue-400">{result.pacing.wpm} <span className="text-sm text-gray-500">WPM</span></span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min((result.pacing.wpm / 200) * 100, 100)}%` }}></div>
            </div>
            <p className="text-sm text-gray-400 mb-4">{result.pacing.feedback}</p>
           </div>
           
           <div className="mt-2 pt-4 border-t border-gray-800">
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">{t.emotionalAnalysis}</h4>
              <div className="flex items-center justify-between">
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={result.emotions}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={5}
                        dataKey="percentage"
                      >
                        {result.emotions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EMOTION_COLORS[index % EMOTION_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 pl-4 space-y-1">
                  {result.emotions.slice(0, 3).map((emotion, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: EMOTION_COLORS[i % EMOTION_COLORS.length]}}></div>
                        <span className="text-gray-300">{emotion.name}</span>
                      </div>
                      <span className="text-gray-500 font-mono">{emotion.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>

        {/* Radar Chart (Skills) */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-green-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Zap className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white">{t.skills}</h3>
          </div>
          <div className="h-56 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Habilidades"
                  dataKey="A"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PREMIUM FEATURES SECTIONS (Conditional Rendering) */}
      {(result.vocalAnalysis || result.imageAnalysis) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
           
           {/* Vocal Analysis */}
           {result.vocalAnalysis && (
            <div className="bg-gradient-to-br from-gray-900 to-purple-900/20 p-8 rounded-2xl border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Mic2 className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{t.premium.vocalTitle}</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-400">{t.premium.tone}</span>
                  <span className={`font-semibold ${getMetricColor(result.vocalAnalysis.toneVariety)}`}>
                    {result.vocalAnalysis.toneVariety}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-400">{t.premium.volume}</span>
                  <span className={`font-semibold ${getMetricColor(result.vocalAnalysis.volumeControl)}`}>
                    {result.vocalAnalysis.volumeControl}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-400">{t.premium.articulation}</span>
                  <span className={`font-semibold ${getMetricColor(result.vocalAnalysis.articulation)}`}>
                    {result.vocalAnalysis.articulation}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-4 italic">"{result.vocalAnalysis.feedback}"</p>
              </div>
            </div>
           )}

           {/* Image Analysis */}
           {result.imageAnalysis && (
            <div className="bg-gradient-to-br from-gray-900 to-pink-900/20 p-8 rounded-2xl border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.1)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-pink-500/20 rounded-lg">
                  <Shirt className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{t.premium.imageTitle}</h3>
              </div>
              <div className="space-y-4 text-sm">
                <div className="bg-black/30 p-3 rounded-lg">
                   <div className="flex items-center gap-2 mb-1">
                      <Shirt className="w-4 h-4 text-pink-500" />
                      <span className="block text-xs uppercase text-pink-500 font-bold">{t.premium.attire}</span>
                   </div>
                   <p className="text-gray-300">{result.imageAnalysis.attire}</p>
                </div>
                <div className="bg-black/30 p-3 rounded-lg">
                   <div className="flex items-center gap-2 mb-1">
                      <Scissors className="w-4 h-4 text-pink-500" />
                      <span className="block text-xs uppercase text-pink-500 font-bold">{t.premium.hair}</span>
                   </div>
                   <p className="text-gray-300">{result.imageAnalysis.hair}</p>
                </div>
                 <div className="bg-black/30 p-3 rounded-lg">
                   <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-pink-500" />
                      <span className="block text-xs uppercase text-pink-500 font-bold">{t.premium.face}</span>
                   </div>
                   <p className="text-gray-300">{result.imageAnalysis.face}</p>
                </div>
                <p className="text-sm text-gray-300 mt-4 italic">"{result.imageAnalysis.feedback}"</p>
              </div>
            </div>
           )}

        </div>
      )}

      {/* Detailed Analysis Row (Standard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Body Language */}
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Eye className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-white">{t.bodyLanguage}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">{t.eyeContact}</span>
              <span className={`font-semibold ${getMetricColor(result.bodyLanguage.eyeContact)}`}>
                {result.bodyLanguage.eyeContact}
              </span>
            </div>
             <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">{t.posture}</span>
              <span className={`font-semibold ${getMetricColor(result.bodyLanguage.posture)}`}>
                {result.bodyLanguage.posture}
              </span>
            </div>
             <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">{t.gestures}</span>
              <span className={`font-semibold ${getMetricColor(result.bodyLanguage.gestures)}`}>
                {result.bodyLanguage.gestures}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-4 italic">"{result.bodyLanguage.feedback}"</p>
          </div>
        </div>

        {/* Speech Analysis (Content) */}
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <MessageSquareText className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-white">{t.speechAnalysis}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">{t.clarity}</span>
              <span className={`font-semibold ${getMetricColor(result.speechAnalysis.clarity)}`}>
                {result.speechAnalysis.clarity}
              </span>
            </div>
             <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">{t.coherence}</span>
              <span className={`font-semibold ${getMetricColor(result.speechAnalysis.coherence)}`}>
                {result.speechAnalysis.coherence}
              </span>
            </div>
             <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">{t.persuasion}</span>
              <span className={`font-semibold ${getMetricColor(result.speechAnalysis.persuasion)}`}>
                {result.speechAnalysis.persuasion}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-4 italic">"{result.speechAnalysis.feedback}"</p>
          </div>
        </div>
      </div>

      {/* ACTION PLAN SECTION */}
      {result.actionPlan && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white text-center">{t.actionPlan}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Exercises */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-2xl border border-orange-500/20 hover:border-orange-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Dumbbell className="w-6 h-6 text-orange-400" />
                </div>
                <h4 className="text-lg font-bold text-orange-200">{t.exercises}</h4>
              </div>
              <ul className="space-y-3">
                {result.actionPlan.exercises.map((item, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Dynamics */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Repeat className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="text-lg font-bold text-cyan-200">{t.dynamics}</h4>
              </div>
              <ul className="space-y-3">
                {result.actionPlan.dynamics.map((item, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources/Readings */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-2xl border border-pink-500/20 hover:border-pink-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <BookOpen className="w-6 h-6 text-pink-400" />
                </div>
                <h4 className="text-lg font-bold text-pink-200">{t.resources}</h4>
              </div>
              <ul className="space-y-3">
                {result.actionPlan.resources.map((item, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-pink-500 mt-1">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* General Tips Section */}
      <div className="bg-gradient-to-br from-gray-900 to-indigo-900/40 p-8 rounded-2xl border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-6">{t.quickTips}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.improvementTips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <span className="text-gray-200">{tip}</span>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
          <button 
            onClick={onReset}
            className="w-full md:w-auto px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
          >
            {t.practiceAgain}
          </button>
          
          {isPremium && onSave && (
             <button 
              onClick={handleSaveClick}
              disabled={saved}
              className={`w-full md:w-auto px-8 py-3 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${saved ? 'bg-green-600 text-white cursor-default' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/20'}`}
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" /> {t.saved}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> {t.saveToHistory}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsView;

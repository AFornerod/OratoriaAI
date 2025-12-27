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
  user?: any;
  isPremium?: boolean;
  isFromHistory?: boolean;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, onReset, language, onSave, user, isPremium, isFromHistory }) => {
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
      backToHistory: "Volver al Historial",
      saveAnalysis: "Guardar Análisis",
      saved: "✓ Guardado",
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
      backToHistory: "Back to History",
      saveAnalysis: "Save Analysis",
      saved: "✓ Saved",
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

  // 🆕 VALIDACIONES DEFENSIVAS - Prevenir errores si faltan datos
  const fillerWords = result.fillerWords || [];
  const emotionalTone = result.emotions || [];
  const improvementTips = result.improvementTips || [];

  // Data for charts
  const fillerWordsData = fillerWords.map(fw => ({ name: fw.word, count: fw.count }));
  
  // Calculate a simplified radar score for visualization
  const getScore = (val: string) => {
    if (!val) return 25; // 🆕 Validación si val es undefined
    // Both English and Spanish values need to be mapped if the API returned English
    if (['Excelente', 'Excellent', 'Erguido', 'Upright', 'Naturales', 'Natural', 'Normal', 'Muy Claro', 'Very Clear', 'Muy Persuasivo', 'Very Persuasive'].includes(val)) return 100;
    if (['Bueno', 'Good', 'Relajado', 'Relaxed', 'Rápido', 'Fast', 'Claro', 'Clear', 'Buena', 'Convincente', 'Persuasive'].includes(val)) return 75;
    if (['Limitados', 'Limited', 'Tenso', 'Tense', 'Lento', 'Slow', 'Confuso', 'Confusing', 'Baja', 'Low', 'Poco Convincente', 'Unconvincing'].includes(val)) return 50;
    return 25; 
  };

  const radarData = [
    { subject: t.radarKeys.contact, A: getScore(result.bodyLanguage?.eyeContact), fullMark: 100 },
    { subject: t.radarKeys.posture, A: getScore(result.bodyLanguage?.posture), fullMark: 100 },
    { subject: t.radarKeys.content, A: (getScore(result.speechAnalysis?.clarity) + getScore(result.speechAnalysis?.persuasion)) / 2, fullMark: 100 },
    { subject: t.radarKeys.rhythm, A: result.pacing?.status === 'Normal' ? 100 : 60, fullMark: 100 },
    { subject: t.radarKeys.clarity, A: Math.max(0, 100 - (fillerWords.reduce((acc, curr) => acc + curr.count, 0) * 5)), fullMark: 100 },
  ];

  // Colors for Emotion Chart
  const EMOTION_COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const getMetricColor = (val: string) => {
    if (!val) return 'text-gray-400'; // 🆕 Validación
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
            {result.summary || 'Análisis completado exitosamente'}
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
              strokeDasharray={`${result.overallScore || 0}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-bold text-white">{result.overallScore || 0}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{t.points}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Filler Words */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <Mic className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white">{t.fillerWords}</h3>
          </div>
          {fillerWordsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={fillerWordsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {fillerWordsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#ef4444" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-green-400 text-center py-4">{t.noFillerWords}</p>
          )}
        </div>

        {/* Pacing & Emotion */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white">{t.pacingEmotion}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">{t.speed}</span>
<span className={`font-semibold ${getMetricColor(result.vocalAnalysis?.toneVariety ?? '')}`}>
  {result.vocalAnalysis?.toneVariety || 'N/A'}
</span>
            </div>
            {result.pacing?.feedback && (
              <p className="text-sm text-gray-400 italic">"{result.pacing.feedback}"</p>
            )}
          </div>
          
          {/* 🆕 VALIDACIÓN: Solo mostrar gráfico emocional si hay datos */}
          {emotionalTone.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">{t.emotionalAnalysis}</h4>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={emotionalTone}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {emotionalTone.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EMOTION_COLORS[index % EMOTION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {emotionalTone.map((emotion, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: EMOTION_COLORS[idx % EMOTION_COLORS.length] }}></div>
                    <span className="text-xs text-gray-400">{emotion.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Skills Radar */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Zap className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-white">{t.skills}</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PREMIUM FEATURES */}
      {isPremium && result.vocalAnalysis && result.imageAnalysis && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <h3 className="text-2xl font-bold text-yellow-500 uppercase tracking-widest">Análisis Premium</h3>
            <Lightbulb className="w-6 h-6 text-yellow-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Advanced Vocal Analysis */}
            {result.vocalAnalysis && (
              <div className="bg-yellow-900/10 p-8 rounded-2xl border border-yellow-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Mic2 className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-100">{t.premium.vocalTitle}</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-yellow-500/20 pb-2">
                    <span className="text-gray-300">{t.premium.tone}</span>
                    <span className={`font-semibold ${getMetricColor(result.vocalAnalysis?.toneVariety ?? '')}`}>
                      {result.vocalAnalysis?.toneVariety || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-yellow-500/20 pb-2">
                    <span className="text-gray-300">{t.premium.volume}</span>
                    <span className={`font-semibold ${getMetricColor(result.vocalAnalysis?.volumeControl ?? '')}`}>
  {result.vocalAnalysis?.volumeControl || 'N/A'}
</span>
                  </div>
                  <div className="flex justify-between border-b border-yellow-500/20 pb-2">
                    <span className="text-gray-300">{t.premium.articulation}</span>
                    <span className={`font-semibold ${getMetricColor(result.vocalAnalysis.articulation)}`}>
                      {result.vocalAnalysis.articulation || 'N/A'}
                    </span>
                  </div>
                  {result.vocalAnalysis.feedback && (
                    <p className="text-sm text-gray-300 mt-4 italic">"{result.vocalAnalysis.feedback}"</p>
                  )}
                </div>
              </div>
            )}

            {/* Image Consulting */}
            {result.imageAnalysis && (
              <div className="bg-yellow-900/10 p-8 rounded-2xl border border-yellow-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Shirt className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-100">{t.premium.imageTitle}</h3>
                </div>
                <div className="space-y-4">
                  {result.imageAnalysis?.attire && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-yellow-500/10 rounded-lg mt-1">
                        <Shirt className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">{t.premium.attire}</p>
                        <p className="text-gray-300">{result.imageAnalysis?.attire}</p>
                      </div>
                    </div>
                  )}
                  {result.imageAnalysis?.hair && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-yellow-500/10 rounded-lg mt-1">
                        <Scissors className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">{t.premium.hair}</p>
                        <p className="text-gray-300">{result.imageAnalysis?.hair}</p>
                      </div>
                    </div>
                  )}
                  {result.imageAnalysis?.face && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-yellow-500/10 rounded-lg mt-1">
                        <User className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">{t.premium.face}</p>
                        <p className="text-gray-300">{result.imageAnalysis?.face}</p>
                      </div>
                    </div>
                  )}
                  {result.imageAnalysis?.feedback && (
                    <p className="text-sm text-gray-300 mt-4 italic">"{result.imageAnalysis?.feedback}"</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Analysis Row (Standard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Body Language */}
        {result.bodyLanguage && (
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
                  {result.bodyLanguage.eyeContact || 'N/A'}
                </span>
              </div>
               <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">{t.posture}</span>
                <span className={`font-semibold ${getMetricColor(result.bodyLanguage.posture)}`}>
                  {result.bodyLanguage.posture || 'N/A'}
                </span>
              </div>
               <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">{t.gestures}</span>
                <span className={`font-semibold ${getMetricColor(result.bodyLanguage.gestures)}`}>
                  {result.bodyLanguage.gestures || 'N/A'}
                </span>
              </div>
              {result.bodyLanguage.feedback && (
                <p className="text-sm text-gray-300 mt-4 italic">"{result.bodyLanguage.feedback}"</p>
              )}
            </div>
          </div>
        )}

        {/* Speech Analysis (Content) */}
        {result.speechAnalysis && (
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
                  {result.speechAnalysis.clarity || 'N/A'}
                </span>
              </div>
               <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">{t.coherence}</span>
                <span className={`font-semibold ${getMetricColor(result.speechAnalysis.coherence)}`}>
                  {result.speechAnalysis.coherence || 'N/A'}
                </span>
              </div>
               <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">{t.persuasion}</span>
                <span className={`font-semibold ${getMetricColor(result.speechAnalysis.persuasion)}`}>
                  {result.speechAnalysis.persuasion || 'N/A'}
                </span>
              </div>
              {result.speechAnalysis.feedback && (
                <p className="text-sm text-gray-300 mt-4 italic">"{result.speechAnalysis.feedback}"</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ACTION PLAN SECTION */}
      {result.actionPlan && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white text-center">{t.actionPlan}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Exercises */}
            {result.actionPlan.exercises && result.actionPlan.exercises.length > 0 && (
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
            )}

            {/* Dynamics */}
            {result.actionPlan.dynamics && result.actionPlan.dynamics.length > 0 && (
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
            )}

            {/* Resources/Readings */}
            {result.actionPlan.resources && result.actionPlan.resources.length > 0 && (
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
            )}

          </div>
        </div>
      )}

      {/* General Tips Section */}
      {improvementTips.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-indigo-900/40 p-8 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-6">{t.quickTips}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {improvementTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-gray-200">{tip}</span>
              </div>
            ))}
          </div>
          
          {/* BOTONES - Guardar y Practicar de Nuevo */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
            
            {/* Botón Guardar - Disponible para TODOS los usuarios */}
            {!isFromHistory && onSave && user && (
              <button 
                onClick={handleSaveClick}
                disabled={saved}
                className={`flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all shadow-lg ${
                  saved 
                    ? 'bg-green-600 text-white cursor-default' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>{t.saved}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{t.saveAnalysis}</span>
                  </>
                )}
              </button>
            )}

            {/* Botón Practicar de Nuevo / Volver al Historial */}
            <button 
              onClick={onReset}
              className="px-8 py-3 bg-white text-purple-900 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              {isFromHistory ? t.backToHistory : t.practiceAgain}
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsView;

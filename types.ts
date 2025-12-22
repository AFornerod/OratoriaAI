export type Language = 'es' | 'en';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, never store plain text passwords
  isPremium: boolean;
  joinDate: string;
}

export interface FillerWord {
  word: string;
  count: number;
}

export interface PacingAnalysis {
  status: 'Lento' | 'Normal' | 'Rápido';
  wpm: number; // Words per minute (estimated)
  feedback: string;
}

export interface BodyLanguageAnalysis {
  eyeContact: 'Pobre' | 'Bueno' | 'Excelente';
  posture: 'Encorvado' | 'Relajado' | 'Tenso' | 'Erguido';
  gestures: 'Limitados' | 'Naturales' | 'Excesivos';
  feedback: string;
}

export interface SpeechAnalysis {
  clarity: 'Confuso' | 'Claro' | 'Muy Claro';
  coherence: 'Baja' | 'Buena' | 'Excelente';
  persuasion: 'Poco Convincente' | 'Convincente' | 'Muy Persuasivo';
  feedback: string;
}

export interface ActionPlan {
  exercises: string[]; // Specific physical or vocal exercises
  dynamics: string[];  // Practice routines (e.g., Table Topics)
  resources: string[]; // Books, videos, or concepts to study
}

export interface Emotion {
  name: string;
  percentage: number; // 0-100 estimate of prevalence
}

// PREMIUM INTERFACES
export interface VocalAnalysis {
  toneVariety: 'Monótono' | 'Variado' | 'Dinámico';
  volumeControl: 'Bajo' | 'Adecuado' | 'Alto';
  articulation: 'Confusa' | 'Buena' | 'Precisa';
  feedback: string;
}

export interface ImageAnalysis {
  attire: string; // Feedback on clothing
  hair: string;   // Feedback on hairstyle
  face: string;   // Feedback on face/makeup/grooming
  feedback: string; // General image consulting summary
}

export interface AnalysisResult {
  overallScore: number; // 0-100
  summary: string;
  fillerWords: FillerWord[];
  pacing: PacingAnalysis;
  emotions: Emotion[];
  bodyLanguage: BodyLanguageAnalysis;
  speechAnalysis: SpeechAnalysis;
  improvementTips: string[];
  actionPlan: ActionPlan;
  // Optional Premium Fields
  vocalAnalysis?: VocalAnalysis;
  imageAnalysis?: ImageAnalysis;
}

export interface AnalysisHistoryItem {
  id: string;
  userId?: string; // Link history to user
  date: string; // ISO string
  result: AnalysisResult;
  topic?: string;
  goal?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
  PREMIUM = 'PREMIUM',
  HISTORY = 'HISTORY',
  LOGIN = 'LOGIN',
  PROFILE = 'PROFILE'
}
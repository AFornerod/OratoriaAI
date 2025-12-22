'use client'

import React, { useRef, useState, useEffect } from 'react';
import { Video, Mic, StopCircle, Play, AlertCircle } from 'lucide-react';
import { Language } from '@/types';

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  language: Language;
}

const Recorder: React.FC<RecorderProps> = ({ onRecordingComplete, language }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  const t = {
    es: {
      errorAccess: "No se pudo acceder a la cámara o micrófono. Por favor verifica los permisos.",
      startingCamera: "Iniciando cámara...",
      recording: "Grabando...",
      instructionRecording: "Grabando... Habla claro y mira a la cámara.",
      instructionIdle: "Presiona el botón para comenzar tu práctica.",
      retry: "Reintentar"
    },
    en: {
      errorAccess: "Could not access camera or microphone. Please check permissions.",
      startingCamera: "Starting camera...",
      recording: "Recording...",
      instructionRecording: "Recording... Speak clearly and look at the camera.",
      instructionIdle: "Press the button to start your practice.",
      retry: "Retry"
    }
  }[language];

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError(t.errorAccess);
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    // Using webm for better compression/compatibility with Chrome/Firefox
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8,opus' });
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      onRecordingComplete(blob);
      stopCamera();
    };

    mediaRecorder.start();
    setIsRecording(true);
    mediaRecorderRef.current = mediaRecorder;
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-900/20 rounded-xl border border-red-500/50">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-200 text-center">{error}</p>
        <button 
          onClick={startCamera}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl shadow-purple-900/20">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover transform scale-x-[-1] ${!stream ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-pulse w-12 h-12 rounded-full bg-gray-800"></div>
              <p>{t.startingCamera}</p>
            </div>
          </div>
        )}

        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-red-500/30">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-mono font-bold">{formatTime(timer)}</span>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center gap-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={!stream}
            className="group relative flex items-center justify-center w-20 h-20 bg-white rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:hover:scale-100"
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
             <div className="w-8 h-8 bg-red-600 rounded-full"></div>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center justify-center w-20 h-20 bg-gray-800 border-2 border-red-500 rounded-full hover:bg-gray-700 transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)]"
          >
            <div className="w-8 h-8 bg-red-500 rounded-sm"></div>
          </button>
        )}
      </div>
      
      <p className="mt-4 text-gray-400 text-sm">
        {isRecording ? t.instructionRecording : t.instructionIdle}
      </p>
    </div>
  );
};

export default Recorder;

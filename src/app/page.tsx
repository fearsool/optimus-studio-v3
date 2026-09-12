
'use client';

// =============== IMPORTS ===============
import React, { useState, useEffect, useRef } from 'react';
import UnifiedEditor from '../components/unified-editor/UnifiedEditor'; // v2 Architecture
import { LoopManager } from '../agent/LoopManager';
import { AgentState, Message, LogEntry } from './ui/types';

// =============== MAIN CONTROLLER ===============
export default function OptimusStudio() {
  const [mounted, setMounted] = useState(false);

  // State
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileContent, setFileContent] = useState('// Select a file to view or edit');
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [autoPilot, setAutoPilot] = useState(false);
  const loopManagerRef = useRef<LoopManager | null>(null);

  // Agent State
  const [agentState, setAgentState] = useState<AgentState>({
    status: 'idle',
    currentPlan: null,
    currentStep: 0,
    activeTool: null,
    logs: [
      { time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), type: 'info', message: 'Optimus Hybrid Studio v2.0 Initialized' }
    ]
  });

  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'system', content: 'Optimus Hybrid Agent Ready.', timestamp: new Date() }
  ]);

  // Lifecycle
  useEffect(() => {
    setMounted(true);
    loopManagerRef.current = new LoopManager() as any;
    return () => loopManagerRef.current?.stop();
  }, []);

  useEffect(() => {
    if (loopManagerRef.current) {
      loopManagerRef.current.updateState(agentState);
    }
  }, [agentState]);

  // Actions
  const addLog = (type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setAgentState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-20), { time, type, message }]
    }));
  };

  // Speaks text using Jarvis Edge-TTS or browser SpeechSynthesis
  // Speaks text using Jarvis natural Edge-TTS voice exclusively
  const speakReply = async (text: string) => {
    if (!text || typeof window === 'undefined') return;
    setAgentState(prev => ({ ...prev, status: 'speaking' }));
    
    try {
      const jarvisRes = await fetch('/api/jarvis/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (jarvisRes.ok) {
        const data = await jarvisRes.json().catch(() => ({}));
        if (data.ok) {
          setTimeout(() => {
            setAgentState(prev => ({ ...prev, status: 'idle' }));
          }, Math.min(Math.max(text.length * 60, 2000), 12000));
          return;
        }
      }
    } catch (e) {
      console.warn('[Optimus Voice] Jarvis Edge-TTS çevrimdışı:', e);
    }

    // Jarvis kapalıysa robotik tarayıcı sesini çalıştırma, sessizce idle yap
    setAgentState(prev => ({ ...prev, status: 'idle' }));
  };

  const sendMessage = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : input).trim();
    if (!textToSend || isLoading) return;
    
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: textToSend, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);
    setAgentState(prev => ({ ...prev, status: 'thinking' }));

    try {
      // First check if it's a direct PC control command for Jarvis
      let responseText = '';
      try {
        const jarvisCommandRes = await fetch('/api/jarvis/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToSend })
        });
        if (jarvisCommandRes.ok) {
          const jarvisData = await jarvisCommandRes.json();
          if (jarvisData.reply) {
            responseText = jarvisData.reply;
          }
        }
      } catch {
        // Jarvis offline
      }

      // If Jarvis didn't respond directly, route through Optimus Agent
      if (!responseText) {
        const res = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: textToSend, history: messages })
        });
        const data = await res.json();
        responseText = data.response || 'Anlaşıldı komutanım.';
        if (data.plan) setAgentState(prev => ({ ...prev, currentPlan: data.plan }));
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: responseText, timestamp: new Date() }]);
      
      // Voice reply trigger
      await speakReply(responseText);

    } catch (e) {
      console.error(e);
      addLog('error', 'Mesaj gönderilemedi.');
      setAgentState(prev => ({ ...prev, status: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tarayıcınız ses tanıma API\'sini desteklemiyor. Lütfen Chrome, Edge veya uyumlu bir tarayıcı kullanın.');
      return;
    }

    if (agentState.status === 'listening') {
      setAgentState(prev => ({ ...prev, status: 'idle' }));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setAgentState(prev => ({ ...prev, status: 'listening' }));
      addLog('info', 'Sizi dinliyorum...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      addLog('info', `Ses algılandı: "${transcript}"`);
      sendMessage(transcript);
    };

    recognition.onend = () => {
      setAgentState(prev => (prev.status === 'listening' ? { ...prev, status: 'idle' } : prev));
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        setAgentState(prev => ({ ...prev, status: 'idle' }));
        return;
      }
      if (event.error === 'not-allowed') {
        addLog('error', 'Mikrofon izni verilmedi. Lütfen tarayıcı izinlerini kontrol edin.');
        setAgentState(prev => ({ ...prev, status: 'idle' }));
        return;
      }
      addLog('warning', `Ses tanıma: ${event.error}`);
      setAgentState(prev => ({ ...prev, status: 'idle' }));
    };

    try {
      recognition.start();
    } catch {
      setAgentState(prev => ({ ...prev, status: 'idle' }));
    }
  };

  const handleFixProblem = (problem: any) => {
    setInput(`Fix this error at ${problem.file}:${problem.line}\n\nError: ${problem.message}\nCode: ${problem.code}`);
  };

  // Shortcuts logic could be moved to UnifiedEditor or kept here if it wraps everything

  if (!mounted) return <div className="bg-black h-screen flex items-center justify-center text-white">Initializing Hybrid Studio...</div>;

  return (
    <UnifiedEditor
      fileContent={fileContent}
      setFileContent={setFileContent}
      currentFilePath={currentFilePath}
      setCurrentFilePath={setCurrentFilePath}
      messages={messages}
      input={input}
      setInput={setInput}
      sendMessage={sendMessage}
      startListening={startListening}
      isLoading={isLoading}
      agentState={agentState}
      onFixProblem={handleFixProblem}
    />
  );
}

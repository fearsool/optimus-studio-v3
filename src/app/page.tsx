
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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMsg, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);
    setAgentState(prev => ({ ...prev, status: 'thinking' }));

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.response || 'No response', timestamp: new Date() }]);
      setAgentState(prev => ({ ...prev, status: 'idle' }));
      if (data.plan) setAgentState(prev => ({ ...prev, currentPlan: data.plan }));
    } catch (e) {
      console.error(e);
      addLog('error', 'Failed to send message');
      setAgentState(prev => ({ ...prev, status: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser does not support Speech API');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      addLog('info', 'Listening...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(`[VOICE] ${transcript}`);
    };
    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') console.error(event.error);
    };
    recognition.start();
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

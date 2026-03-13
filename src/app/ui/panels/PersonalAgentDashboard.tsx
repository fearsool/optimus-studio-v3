// src/app/ui/panels/PersonalAgentDashboard.tsx - TAM REACT COMPONENT
import React, { useState, useEffect } from 'react';
import type { AgentTask, TaskType } from '../../../agent/core/OptimusAgentCore'; // Type-only import

// Define ChatMessage here if not imported
interface ChatMessage {
    text: string;
    isUser: boolean;
    timestamp: Date;
}

const PersonalAgentDashboard: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'starting' | 'running' | 'stopped'>('idle');
    const [tasks, setTasks] = useState<AgentTask[]>([]);
    const [conversation, setConversation] = useState<ChatMessage[]>([]);
    const [voiceActive, setVoiceActive] = useState(false);
    const [whatsappConnected, setWhatsappConnected] = useState(false);

    // Agent başlatma
    useEffect(() => {
        initializeAgent();
    }, []);

    const callAgentApi = async (action: string, data: any = {}) => {
        try {
            const res = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, data })
            });
            return await res.json();
        } catch (error) {
            console.error(`API Error (${action}):`, error);
            return { success: false, error: 'API connection failed' };
        }
    };

    const initializeAgent = async () => {
        setStatus('starting');
        const result = await callAgentApi('init');

        if (result.success) {
            setStatus('running');
            setConversation(prev => [...prev, {
                text: 'Merhaba! Optimus kişisel ajanınız olarak hazırım. Size nasıl yardımcı olabilirim?',
                isUser: false,
                timestamp: new Date()
            }]);
        } else {
            console.error('Agent başlatma hatası:', result.error);
            setStatus('stopped');
        }
    };

    // Sesli komut gönder (API üzerinden)
    const sendVoiceCommand = async () => {
        setVoiceActive(true);
        const result = await callAgentApi('processText', { text: 'Sesli komut simülasyonu' });

        if (result.success) {
            setConversation(prev => [...prev,
            { text: 'Sesli komut simülasyonu', isUser: true, timestamp: new Date() },
            { text: result.response, isUser: false, timestamp: new Date() }
            ]);
        }
        setVoiceActive(false);
    };

    // Görev ekle
    const addTask = async (taskType: TaskType, data?: any) => {
        const task: AgentTask = {
            id: Date.now().toString(),
            type: taskType,
            data,
            priority: 'medium',
            createdAt: new Date(),
            status: 'bekliyor'
        };

        // UI Feedback: Sohbet ekranına ekle
        let feedbackText = '';
        switch (taskType) {
            case 'financial_analysis': feedbackText = '📊 Kripto piyasa analizi başlatılıyor...'; break;
            case 'create_instagram_post': feedbackText = `📸 ${data?.topic || ''} için Instagram gönderisi hazırlanıyor...`; break;
            case 'optimize_seo': feedbackText = `🔍 ${data?.site || ''} sitesi için SEO optimizasyonu kuyruğa alındı.`; break;
            case 'learn_skill':
            case 'learn_new_skill': feedbackText = `🧠 ${data?.skill || 'yeni bir teknoloji'} öğrenme süreci başlatıldı.`; break;
            case 'self_optimize_code': feedbackText = '⚡ Kod tabanı analiz ediliyor ve iyileştirmeler planlanıyor...'; break;
            case 'auto_trade': feedbackText = '🚀 Otomatik ticaret algoritması devreye alınıyor...'; break;
            case 'analyze_site': feedbackText = `📈 ${data?.site || ''} sitesinin performansı analiz ediliyor...`; break;
            case 'create_content': feedbackText = '📝 Site için yeni içerik stratejisi oluşturuluyor...'; break;
            default: feedbackText = `🛠️ ${taskType} görevi kuyruğa eklendi.`;
        }

        setConversation(prev => [...prev, {
            text: feedbackText,
            isUser: false,
            timestamp: new Date()
        }]);

        const result = await callAgentApi('addTask', { task });
        if (result.success) {
            setTasks(prev => [...prev, task]);
        }
    };

    // Connect WhatsApp manually (API trigger)
    const connectWhatsApp = async () => {
        // WhatsApp connection is usually handled on server side in our new architecture
        setWhatsappConnected(true);
    }

    // CANLI DASHBOARD UI
    return (
        <div className="personal-agent-dashboard h-full overflow-auto bg-[#0d1117] text-gray-300 p-4">
            {/* ÜST DURUM BAR */}
            <div className="status-bar flex justify-between items-center mb-6 bg-[#161b22] p-4 rounded-lg border border-gray-800">
                <div className="status-indicator flex items-center gap-2">
                    <span className={`status-dot w-3 h-3 rounded-full ${status === 'running' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    <span className="status-text font-bold text-white">
                        {status === 'idle' && '🟡 Hazırlanıyor'}
                        {status === 'starting' && '🟠 Başlatılıyor'}
                        {status === 'running' && '🟢 Çalışıyor'}
                        {status === 'stopped' && '🔴 Durdu'}
                    </span>
                </div>

                <div className="connection-status flex gap-4">
                    <span
                        className={`whatsapp-status px-3 py-1 rounded cursor-pointer ${whatsappConnected ? 'bg-green-900 text-green-300' : 'bg-gray-800'}`}
                        onClick={connectWhatsApp}
                    >
                        📱 {whatsappConnected ? 'WhatsApp Bağlı' : 'WhatsApp Bağlan'}
                    </span>
                    <span className={`voice-status px-3 py-1 rounded ${voiceActive ? 'bg-red-900 text-red-300 animate-pulse' : 'bg-gray-800'}`}>
                        🎤 {voiceActive ? 'Konuşuyor...' : 'Ses Aktif'}
                    </span>
                </div>
            </div>

            {/* ANA PANEL */}
            <div className="main-content grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
                {/* SOL PANEL - Hızlı Aksiyonlar */}
                <div className="quick-actions-panel col-span-3 bg-[#161b22] p-4 rounded-lg border border-gray-800 flex flex-col gap-3">
                    <h3 className="text-white font-bold mb-2">⚡ Hızlı Aksiyonlar</h3>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-sm text-left px-4"
                        onClick={() => addTask('financial_analysis')}
                    >
                        📈 Kripto Analiz Et
                    </button>

                    <button
                        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded text-sm text-left px-4"
                        onClick={() => addTask('create_instagram_post', { topic: 'petsem' })}
                    >
                        📸 Petsem Gönderisi
                    </button>

                    <button
                        className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded text-sm text-left px-4"
                        onClick={() => addTask('optimize_seo', { site: 'petsem.com' })}
                    >
                        🔍 SEO Optimize Et
                    </button>

                    <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded text-sm text-left px-4"
                        onClick={() => addTask('learn_skill', { skill: 'nextjs_15' })}
                    >
                        🧠 Yeni Teknoloji Öğren
                    </button>

                    <button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded text-sm text-left px-4"
                        onClick={() => addTask('self_optimize_code')}
                    >
                        ⚡ Kodunu İyileştir
                    </button>

                    <button
                        className={`mt-auto p-3 rounded text-center font-bold ${voiceActive ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                        onClick={sendVoiceCommand}
                        disabled={voiceActive}
                    >
                        {voiceActive ? '🎤 Dinliyor...' : '🎤 Sesli Komut'}
                    </button>
                </div>

                {/* ORTA PANEL - Canlı Konuşma */}
                <div className="conversation-panel col-span-5 bg-[#161b22] p-4 rounded-lg border border-gray-800 flex flex-col">
                    <h3 className="text-white font-bold mb-4">💬 Canlı Konuşma</h3>

                    <div className="conversation-messages flex-1 overflow-y-auto mb-4 space-y-4 p-2">
                        {conversation.map((msg, index) => (
                            <div
                                key={index}
                                className={`message p-3 rounded-lg max-w-[80%] ${msg.isUser ? 'ml-auto bg-blue-900/50 border border-blue-800' : 'mr-auto bg-gray-800 border border-gray-700'}`}
                            >
                                <div className="message-sender text-xs opacity-50 mb-1">
                                    {msg.isUser ? '👤 Siz' : '🤖 Optimus'}
                                </div>
                                <div className="message-text text-sm">{msg.text}</div>
                                <div className="message-time text-[10px] opacity-40 text-right mt-1">
                                    {msg.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Hızlı mesaj gönder */}
                    <div className="quick-message-input flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-black border border-gray-700 rounded p-2 text-sm focus:border-blue-500 outline-none"
                            placeholder="Optimus'a mesaj gönder..."
                            onKeyPress={async (e) => {
                                if (e.key === 'Enter') {
                                    const inputValue = e.currentTarget.value;
                                    if (!inputValue.trim()) return;

                                    setConversation(prev => [...prev, { text: inputValue, isUser: true, timestamp: new Date() }]);
                                    e.currentTarget.value = '';

                                    const result = await callAgentApi('processText', { text: inputValue });
                                    if (result.success) {
                                        setConversation(prev => [...prev, { text: result.response, isUser: false, timestamp: new Date() }]);
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* SAĞ PANEL - Canlı Durum */}
                <div className="status-panel col-span-4 flex flex-col gap-4">

                    {/* Finansal Durum */}
                    <div className="status-card financial-status bg-[#161b22] p-4 rounded-lg border border-gray-800">
                        <h4 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">💰 Finansal Durum</h4>
                        <div className="crypto-portfolio space-y-2 mb-3">
                            <div className="crypto-item flex justify-between text-sm">
                                <span className="crypto-name font-mono">BTC</span>
                                <span className="crypto-value">$45,230</span>
                                <span className="crypto-change text-green-500">+2.3%</span>
                            </div>
                            <div className="crypto-item flex justify-between text-sm">
                                <span className="crypto-name font-mono">ETH</span>
                                <span className="crypto-value">$3,210</span>
                                <span className="crypto-change text-green-500">+1.7%</span>
                            </div>
                        </div>
                        <button className="trade-btn w-full bg-emerald-900/50 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 py-1 rounded text-xs" onClick={() => addTask('auto_trade')}>
                            🚀 Otomatik Ticaret
                        </button>
                    </div>

                    {/* Web Site Durumu */}
                    <div className="status-card website-status bg-[#161b22] p-4 rounded-lg border border-gray-800">
                        <h4 className="text-blue-400 font-bold mb-3">🌐 Web Siteleri</h4>
                        <div className="website-item flex justify-between mb-3 text-sm">
                            <span className="website-name text-blue-200">petsem.com</span>
                            <span className="website-traffic text-green-400">↑ 1.2K ziyaret</span>
                        </div>
                        <div className="website-actions grid grid-cols-2 gap-2">
                            <button className="bg-gray-800 hover:bg-gray-700 py-1 rounded text-xs" onClick={() => addTask('analyze_site', { site: 'petsem.com' })}>
                                📈 Analiz Et
                            </button>
                            <button className="bg-gray-800 hover:bg-gray-700 py-1 rounded text-xs" onClick={() => addTask('create_content', { site: 'petsem.com' })}>
                                📝 İçerik Üret
                            </button>
                        </div>
                    </div>

                    {/* Öğrenme Durumu */}
                    <div className="status-card learning-status bg-[#161b22] p-4 rounded-lg border border-gray-800 flex-1">
                        <h4 className="text-purple-400 font-bold mb-3">🧠 Öğrenme Durumu</h4>
                        <div className="learning-progress space-y-3 mb-4">
                            <div className="skill-item">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="skill-name">Next.js 15</span>
                                    <span className="skill-percent">75%</span>
                                </div>
                                <div className="skill-bar h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="skill-progress h-full bg-purple-500" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <div className="skill-item">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="skill-name">Blockchain Dev</span>
                                    <span className="skill-percent">60%</span>
                                </div>
                                <div className="skill-bar h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="skill-progress h-full bg-blue-500" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                        </div>
                        <button className="learn-btn w-full bg-purple-900/30 hover:bg-purple-900/50 border border-purple-800 text-purple-300 py-2 rounded text-xs" onClick={() => addTask('learn_new_skill')}>
                            📚 Yeni Beceri Öğren
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalAgentDashboard;

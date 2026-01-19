
import React, { useState, useEffect, useRef } from 'react';
import { User, Employee, ChatMessage } from '../types';
import { suggestChatReply } from '../geminiService';

interface ChatModalProps {
  currentUser: User;
  targetUser: Employee;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ currentUser, targetUser, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', senderId: targetUser.id, receiverId: currentUser.id, text: `Ciao ${currentUser.name}, come posso aiutarti oggi?`, timestamp: new Date(Date.now() - 3600000).toISOString() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      receiverId: targetUser.id,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    setMessages([...messages, msg]);
    setInputText('');

    // Simulazione risposta automatica dopo 1.5s
    setTimeout(() => {
      const reply: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        senderId: targetUser.id,
        receiverId: currentUser.id,
        text: "Ottimo, ci aggiorniamo più tardi per i dettagli.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const handleAiSuggest = async () => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.senderId === currentUser.id) return;

    setIsAiLoading(true);
    const suggestion = await suggestChatReply(lastMsg.text);
    setInputText(suggestion);
    setIsAiLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg md:rounded-2xl h-[90vh] md:h-[600px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="bg-teal-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={targetUser.avatar} className="w-10 h-10 rounded-full border-2 border-white/20" alt="" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-teal-600"></div>
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">{targetUser.name}</h4>
              <p className="text-[10px] opacity-80 uppercase font-medium">{targetUser.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                m.senderId === currentUser.id 
                  ? 'bg-teal-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
              }`}>
                {m.text}
                <div className={`text-[9px] mt-1 opacity-60 text-right`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Suggestion Bar */}
        <div className="px-4 py-2 bg-teal-50 flex items-center justify-between border-t border-teal-100">
          <span className="text-[10px] font-bold text-teal-700 uppercase">Nexus AI Assistant</span>
          <button 
            onClick={handleAiSuggest}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 text-[10px] font-bold text-teal-600 hover:text-teal-800 transition-colors"
          >
            {isAiLoading ? (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            )}
            Suggerisci Risposta
          </button>
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-100 flex gap-2 items-center bg-white">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend(inputText)}
            placeholder="Scrivi un messaggio..."
            className="flex-1 px-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
          />
          <button 
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim()}
            className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-all active:scale-90"
          >
            <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;


import React, { useState, useEffect } from 'react';
import { User, Role, BulletinMessage } from '../types';
import { generateProfessionalMessage } from '../geminiService';

interface BulletinBoardProps {
  user: User;
}

const BulletinBoard: React.FC<BulletinBoardProps> = ({ user }) => {
  const [messages, setMessages] = useState<BulletinMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Generale' as BulletinMessage['category'],
    isPinned: false
  });

  // Mock initial data
  useEffect(() => {
    const mockData: BulletinMessage[] = [
      {
        id: '1',
        title: 'Benvenuti nel nuovo NexusHub',
        content: 'Siamo lieti di annunciare il lancio della nostra nuova piattaforma gestionale. Esplorate le nuove funzioni!',
        authorId: 'admin1',
        authorName: 'System Admin',
        createdAt: new Date().toISOString(),
        isPinned: true,
        category: 'Avviso'
      },
      {
        id: '2',
        title: 'Manutenzione Server Sabato',
        content: 'Il sistema non sarà disponibile dalle 10:00 alle 12:00 di sabato per aggiornamenti di sicurezza.',
        authorId: 'admin1',
        authorName: 'System Admin',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isPinned: false,
        category: 'Urgenza'
      }
    ];
    setMessages(mockData);
  }, []);

  const handleAiGeneration = async () => {
    if (!newTopic) return;
    setIsGenerating(true);
    const result = await generateProfessionalMessage(newTopic);
    setFormData(prev => ({
      ...prev,
      title: result.title,
      content: result.content
    }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMessage: BulletinMessage = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      isPinned: formData.isPinned,
      authorId: user.id,
      authorName: user.name,
      createdAt: new Date().toISOString(),
    };
    
    setMessages([newMessage, ...messages]);
    setIsModalOpen(false);
    resetForm();
  };

  const togglePin = (id: string) => {
    if (user.role !== Role.ADMIN) return;
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, isPinned: !msg.isPinned } : msg
    ));
  };

  const deleteMessage = (id: string) => {
    if (user.role !== Role.ADMIN) return;
    setMessages(messages.filter(msg => msg.id !== id));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'Generale',
      isPinned: false
    });
    setNewTopic('');
  };

  const sortedMessages = [...messages].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Comunicazioni</h3>
          <p className="text-gray-500">Resta aggiornato sulle ultime novità aziendali</p>
        </div>
        
        {user.role === Role.ADMIN && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuovo Messaggio
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`group bg-white rounded-2xl p-6 border transition-all duration-300 ${msg.isPinned ? 'border-indigo-200 shadow-md ring-1 ring-indigo-50' : 'border-gray-200 hover:shadow-lg hover:border-indigo-100'}`}
          >
            <div className="flex items-start justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                msg.category === 'Urgenza' ? 'bg-red-50 text-red-600' :
                msg.category === 'Avviso' ? 'bg-amber-50 text-amber-600' :
                msg.category === 'Evento' ? 'bg-green-50 text-green-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {msg.category}
              </span>
              
              <div className="flex items-center gap-1">
                {msg.isPinned && (
                  <div className="text-indigo-600 p-1" title="Messaggio in evidenza">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11V22H13V16H18V14L16,12Z" />
                    </svg>
                  </div>
                )}
                
                {user.role === Role.ADMIN && (
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button 
                      onClick={() => togglePin(msg.id)}
                      className={`p-1.5 rounded-lg hover:bg-indigo-50 transition-colors ${msg.isPinned ? 'text-indigo-600' : 'text-gray-400'}`}
                      title={msg.isPinned ? "Rimuovi evidenza" : "Metti in evidenza"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Elimina"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{msg.title}</h4>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-4">{msg.content}</p>
            
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                {msg.authorName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{msg.authorName}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
                  {new Date(msg.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Creazione */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Pubblica Messaggio</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* AI Assistant Tool */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 block">Nexus Assistant AI</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Di cosa vuoi parlare? (es. Regole parcheggio)"
                    className="flex-1 px-3 py-2 text-sm border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    type="button"
                    onClick={handleAiGeneration}
                    disabled={isGenerating || !newTopic}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-all"
                  >
                    {isGenerating ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    Genera con AI
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Titolo</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-shadow"
                  placeholder="Titolo della comunicazione"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option>Generale</option>
                    <option>Avviso</option>
                    <option>Urgenza</option>
                    <option>Evento</option>
                  </select>
                </div>
                <div className="flex items-center pt-6 px-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({...formData, isPinned: e.target.checked})}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">Metti in evidenza</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contenuto</label>
                <textarea 
                  required
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
                  placeholder="Scrivi qui il corpo del messaggio..."
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  Pubblica Ora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulletinBoard;

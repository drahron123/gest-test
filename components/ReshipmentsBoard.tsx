
import React, { useState, useMemo } from 'react';
import { User, Role, Reshipment } from '../types';
import { generateReshipmentEmail } from '../geminiService';

interface ReshipmentsBoardProps {
  user: User;
}

const ReshipmentsBoard: React.FC<ReshipmentsBoardProps> = ({ user }) => {
  const [reshipments, setReshipments] = useState<Reshipment[]>([
    {
      id: 'rs1',
      customerName: 'Elena Bianchi',
      originalOrderRef: 'ORD-5502',
      reason: 'Riparazione in Garanzia',
      status: 'In Lavorazione',
      createdAt: new Date().toISOString(),
      authorName: 'Admin User',
    },
    {
      id: 'rs2',
      customerName: 'Roberto Viola',
      originalOrderRef: 'ORD-9912',
      reason: 'Indirizzo Errato al primo invio',
      status: 'Pronto per Spedizione',
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      authorName: 'Sara Neri',
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tutti');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ id: string, text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    originalOrderRef: '',
    reason: '',
    status: 'In Lavorazione' as Reshipment['status']
  });

  const filtered = useMemo(() => {
    return reshipments.filter(r => {
      const matchesSearch = 
        r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.originalOrderRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Tutti' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reshipments, searchTerm, statusFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRes: Reshipment = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      authorName: user.name,
    };
    setReshipments([newRes, ...reshipments]);
    setIsModalOpen(false);
    setFormData({ customerName: '', originalOrderRef: '', reason: '', status: 'In Lavorazione' });
  };

  const updateStatus = (id: string, newStatus: Reshipment['status']) => {
    setReshipments(reshipments.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleGenerateEmail = async (item: Reshipment) => {
    setIsAiLoading(item.id);
    const draft = await generateReshipmentEmail(item.customerName, item.reason, item.trackingNumber);
    setAiResult({ id: item.id, text: draft });
    setIsAiLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Rispedizioni Merce</h3>
          <p className="text-gray-500">Gestisci i pacchi da inviare nuovamente ai clienti</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold shadow-lg shadow-violet-100 transition-all self-start"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Nuova Rispedizione
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Cerca Pratica</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cerca cliente, ordine o motivo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Stato Pratica</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm bg-white"
          >
            <option value="Tutti">Tutti</option>
            <option value="In Lavorazione">In Lavorazione</option>
            <option value="Pronto per Spedizione">Pronto per Spedizione</option>
            <option value="Rispedito">Rispedito</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente / Ordine</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Motivazione</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stato</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Strumenti AI</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{item.customerName}</p>
                      <p className="text-xs text-violet-600 font-medium">{item.originalOrderRef}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 italic">
                      {item.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'In Lavorazione' ? 'bg-amber-50 text-amber-600' :
                        item.status === 'Pronto per Spedizione' ? 'bg-indigo-50 text-indigo-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleGenerateEmail(item)}
                        disabled={isAiLoading === item.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold hover:bg-violet-100 transition-colors disabled:opacity-50"
                      >
                        {isAiLoading === item.id ? (
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        )}
                        Bozza Mail
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value as any)}
                        className="text-xs border border-gray-200 rounded p-1.5 focus:ring-2 focus:ring-violet-500 outline-none"
                      >
                        <option value="In Lavorazione">In Lavorazione</option>
                        <option value="Pronto per Spedizione">Pronto per Spedizione</option>
                        <option value="Rispedito">Rispedito</option>
                      </select>
                    </td>
                  </tr>
                  {aiResult?.id === item.id && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-violet-50/30">
                        <div className="bg-white p-4 rounded-xl border border-violet-100 shadow-inner relative animate-in fade-in slide-in-from-top-2">
                          <button onClick={() => setAiResult(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          <label className="block text-[10px] font-bold text-violet-600 uppercase mb-2">Bozza generata da Nexus AI</label>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{aiResult.text}</p>
                          <div className="mt-3 flex justify-end">
                            <button 
                              onClick={() => { navigator.clipboard.writeText(aiResult.text); alert('Copiato!'); }}
                              className="text-xs font-bold text-violet-600 hover:underline"
                            >
                              Copia testo
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center">
            <p className="text-gray-500 font-medium">Nessuna rispedizione trovata</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">Nuova Rispedizione</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente</label>
                <input 
                  type="text" required
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="Nome e Cognome"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ordine Originale</label>
                <input 
                  type="text" required
                  value={formData.originalOrderRef}
                  onChange={(e) => setFormData({...formData, originalOrderRef: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="Riferimento ORD-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo del Re-invio</label>
                <textarea 
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                  rows={3}
                  placeholder="Es: Sostituzione tastiera in garanzia..."
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 font-bold rounded-xl">Annulla</button>
                <button type="submit" className="flex-1 py-2.5 bg-violet-600 text-white font-bold rounded-xl shadow-lg shadow-violet-100">Crea Pratica</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReshipmentsBoard;

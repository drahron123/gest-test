
import React, { useState, useMemo } from 'react';
import { User, Role, ReturnItem } from '../types';

interface ReturnsBoardProps {
  user: User;
}

const ReturnsBoard: React.FC<ReturnsBoardProps> = ({ user }) => {
  const [returns, setReturns] = useState<ReturnItem[]>([
    {
      id: 'r1',
      customerName: 'Anna Gialli',
      orderNumber: 'ORD-2023-99',
      reason: 'Articolo difettoso (schermo rotto)',
      status: 'Richiesto',
      createdAt: new Date().toISOString(),
      authorName: 'Admin User',
    },
    {
      id: 'r2',
      customerName: 'Paolo Neri',
      orderNumber: 'ORD-2023-45',
      reason: 'Taglia errata',
      status: 'Ricevuto',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      authorName: 'Standard User',
    }
  ]);

  // Filtri
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tutti');
  const [dateFilter, setDateFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    orderNumber: '',
    reason: '',
    status: 'Richiesto' as ReturnItem['status']
  });

  const filteredReturns = useMemo(() => {
    return returns.filter(ret => {
      const matchesSearch = 
        ret.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.reason.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'Tutti' || ret.status === statusFilter;
      
      const matchesDate = !dateFilter || 
        new Date(ret.createdAt).toISOString().split('T')[0] === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [returns, searchTerm, statusFilter, dateFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReturn: ReturnItem = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      authorName: user.name,
    };
    setReturns([newReturn, ...returns]);
    setIsModalOpen(false);
    setFormData({ customerName: '', orderNumber: '', reason: '', status: 'Richiesto' });
  };

  const updateStatus = (id: string, newStatus: ReturnItem['status']) => {
    setReturns(returns.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const deleteReturn = (id: string) => {
    if (user.role !== Role.ADMIN) return;
    setReturns(returns.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Gestione Resi</h3>
          <p className="text-gray-500">Traccia i rientri merce e i rimborsi</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-lg transition-all self-start"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Registra Reso
        </button>
      </div>

      {/* Barra dei Filtri */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Cerca Cliente o Ordine</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cerca motivazione, nome o ordine..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Stato Reso</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm bg-white"
          >
            <option value="Tutti">Tutti gli stati</option>
            <option value="Richiesto">Richiesto</option>
            <option value="Ricevuto">Ricevuto</option>
            <option value="Rimborsato">Rimborsato</option>
            <option value="Rifiutato">Rifiutato</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Data Inserimento</label>
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm"
          />
        </div>

        {(searchTerm || statusFilter !== 'Tutti' || dateFilter) && (
          <button 
            onClick={() => {setSearchTerm(''); setStatusFilter('Tutti'); setDateFilter('');}}
            className="px-4 py-2 text-sm text-rose-600 font-semibold hover:bg-rose-50 rounded-xl transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {filteredReturns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReturns.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-gray-900">{item.customerName}</h4>
                  <p className="text-xs text-indigo-600 font-medium">{item.orderNumber}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                  item.status === 'Richiesto' ? 'bg-amber-50 text-amber-600' :
                  item.status === 'Ricevuto' ? 'bg-blue-50 text-blue-600' :
                  item.status === 'Rimborsato' ? 'bg-green-50 text-green-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {item.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl italic">
                "{item.reason}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-[10px] text-gray-400">
                  Inserito il {new Date(item.createdAt).toLocaleDateString()} da {item.authorName}
                </div>
                
                <div className="flex gap-2">
                  <select 
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value as any)}
                    className="text-xs bg-gray-50 border-none rounded-lg p-1.5 focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Richiesto">Richiesto</option>
                    <option value="Ricevuto">Ricevuto</option>
                    <option value="Rimborsato">Rimborsato</option>
                    <option value="Rifiutato">Rifiutato</option>
                  </select>
                  {user.role === Role.ADMIN && (
                    <button onClick={() => deleteReturn(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-20 text-center shadow-sm">
          <div className="inline-block p-4 rounded-full bg-gray-50 mb-4 text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p className="text-gray-500 font-medium">Nessun reso trovato con questi criteri</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-lg font-bold">Nuova Pratica di Reso</h3>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Numero Ordine</label>
                <input 
                  type="text" required
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                  placeholder="ORD-YYYY-XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Motivazione</label>
                <textarea 
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 font-bold rounded-xl">Annulla</button>
                <button type="submit" className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl">Registra</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsBoard;

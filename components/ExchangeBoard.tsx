
import React, { useState, useMemo } from 'react';
import { User, Role, Exchange } from '../types';

interface ExchangeBoardProps {
  user: User;
}

const ExchangeBoard: React.FC<ExchangeBoardProps> = ({ user }) => {
  const [exchanges, setExchanges] = useState<Exchange[]>([
    {
      id: 'ex1',
      customerName: 'Mario Rossi',
      items: 'Smartphone X1, Cover Blu',
      status: 'In attesa',
      createdAt: new Date().toISOString(),
      authorName: 'Admin User',
    },
    {
      id: 'ex2',
      customerName: 'Luigi Verdi',
      items: 'Laptop Pro 14, Borsa',
      status: 'Spedito',
      trackingNumber: 'IT123456789',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
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
    items: '',
    status: 'In attesa' as Exchange['status'],
    trackingNumber: ''
  });

  const filteredExchanges = useMemo(() => {
    return exchanges.filter(ex => {
      const matchesSearch = 
        ex.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.items.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'Tutti' || ex.status === statusFilter;
      
      const matchesDate = !dateFilter || 
        new Date(ex.createdAt).toISOString().split('T')[0] === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [exchanges, searchTerm, statusFilter, dateFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEx: Exchange = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      authorName: user.name,
    };
    setExchanges([newEx, ...exchanges]);
    setIsModalOpen(false);
    setFormData({ customerName: '', items: '', status: 'In attesa', trackingNumber: '' });
  };

  const updateStatus = (id: string, newStatus: Exchange['status']) => {
    setExchanges(exchanges.map(ex => ex.id === id ? { ...ex, status: newStatus } : ex));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Exchange & Spedizioni</h3>
          <p className="text-gray-500">Gestisci le spedizioni in uscita per i clienti</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all self-start"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Nuova Spedizione
        </button>
      </div>

      {/* Barra dei Filtri */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Cerca Articolo o Cliente</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cerca..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Stato</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
          >
            <option value="Tutti">Tutti gli stati</option>
            <option value="In attesa">In attesa</option>
            <option value="Spedito">Spedito</option>
            <option value="Consegnato">Consegnato</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Data Spedizione</label>
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>

        {(searchTerm || statusFilter !== 'Tutti' || dateFilter) && (
          <button 
            onClick={() => {setSearchTerm(''); setStatusFilter('Tutti'); setDateFilter('');}}
            className="px-4 py-2 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 rounded-xl transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredExchanges.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Articoli</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data Inserimento</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stato</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExchanges.map((ex) => (
                <tr key={ex.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{ex.customerName}</p>
                    <p className="text-xs text-gray-400">Inserito da: {ex.authorName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ex.items}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(ex.createdAt).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ex.status === 'In attesa' ? 'bg-amber-50 text-amber-600' :
                      ex.status === 'Spedito' ? 'bg-blue-50 text-blue-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                      {ex.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select 
                        value={ex.status}
                        onChange={(e) => updateStatus(ex.id, e.target.value as any)}
                        className="text-xs border border-gray-200 rounded p-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="In attesa">In attesa</option>
                        <option value="Spedito">Spedito</option>
                        <option value="Consegnato">Consegnato</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center">
            <div className="inline-block p-4 rounded-full bg-gray-50 mb-4 text-gray-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-gray-500 font-medium">Nessuna spedizione corrisponde ai filtri selezionati</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Aggiungi Spedizione</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Cliente</label>
                <input 
                  type="text" required
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="es. Marco Bianchi"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Articoli</label>
                <textarea 
                  required
                  value={formData.items}
                  onChange={(e) => setFormData({...formData, items: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                  placeholder="Lista prodotti da spedire..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tracking (Opzionale)</label>
                <input 
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="Numero di tracciamento"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl">Annulla</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100">Crea</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeBoard;

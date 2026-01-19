
import React, { useState, useMemo } from 'react';
import { User, Role, MissingProduct } from '../types';

interface MissingProductsBoardProps {
  user: User;
}

const MissingProductsBoard: React.FC<MissingProductsBoardProps> = ({ user }) => {
  const [missingItems, setMissingItems] = useState<MissingProduct[]>([
    {
      id: 'm1',
      productName: 'Iphone 15 Pro Max 256GB Black',
      expectedLocation: 'Settore A, Scaffale 3, Piano 2',
      status: 'In Ricerca',
      createdAt: new Date().toISOString(),
      reportedBy: 'Mario Rossi',
      // Fixed unescaped single quote in the string literal below
      notes: "L'inventario dice 2 pezzi ma lo scaffale è vuoto."
    },
    {
      id: 'm2',
      productName: 'Monitor Dell UltraSharp 27',
      expectedLocation: 'Zona Resi, Pedana 4',
      status: 'Trovato',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      reportedBy: 'Paolo Neri',
      notes: 'Era stato appoggiato erroneamente in zona spedizioni.'
    }
  ]);

  // Filtri
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tutti');
  const [dateFilter, setDateFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    expectedLocation: '',
    status: 'In Ricerca' as MissingProduct['status'],
    notes: ''
  });

  const filteredItems = useMemo(() => {
    return missingItems.filter(item => {
      const matchesSearch = 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.expectedLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'Tutti' || item.status === statusFilter;
      
      const matchesDate = !dateFilter || 
        new Date(item.createdAt).toISOString().split('T')[0] === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [missingItems, searchTerm, statusFilter, dateFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: MissingProduct = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      reportedBy: user.name,
    };
    setMissingItems([newItem, ...missingItems]);
    setIsModalOpen(false);
    setFormData({ productName: '', expectedLocation: '', status: 'In Ricerca', notes: '' });
  };

  const updateStatus = (id: string, newStatus: MissingProduct['status']) => {
    setMissingItems(missingItems.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const deleteItem = (id: string) => {
    if (user.role !== Role.ADMIN) return;
    setMissingItems(missingItems.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Prodotti non trovati</h3>
          <p className="text-gray-500">Segnala articoli mancanti o non reperibili nelle ubicazioni previste</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-100 transition-all self-start"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Segnala Mancante
        </button>
      </div>

      {/* Barra dei Filtri */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Cerca Prodotto o Ubicazione</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cerca nome o scaffale..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Stato Ricerca</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-white"
          >
            <option value="Tutti">Tutti</option>
            <option value="In Ricerca">In Ricerca</option>
            <option value="Trovato">Trovato</option>
            <option value="Perso">Perso / Definitivo</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Data Segnalazione</label>
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
          />
        </div>

        {(searchTerm || statusFilter !== 'Tutti' || dateFilter) && (
          <button 
            onClick={() => {setSearchTerm(''); setStatusFilter('Tutti'); setDateFilter('');}}
            className="px-4 py-2 text-sm text-amber-600 font-semibold hover:bg-amber-50 rounded-xl transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                item.status === 'In Ricerca' ? 'bg-amber-400' :
                item.status === 'Trovato' ? 'bg-green-500' :
                'bg-gray-400'
              }`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  item.status === 'In Ricerca' ? 'bg-amber-50 text-amber-600' :
                  item.status === 'Trovato' ? 'bg-green-50 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {item.status}
                </span>
                
                {user.role === Role.ADMIN && (
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>

              <h4 className="font-bold text-gray-900 mb-1">{item.productName}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Ubicazione: <span className="font-semibold text-gray-700">{item.expectedLocation}</span></span>
              </div>

              {item.notes && (
                <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl italic line-clamp-2">
                  "{item.notes}"
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-[10px] text-gray-400">
                  <p className="font-medium text-gray-500">{item.reportedBy}</p>
                  <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                
                <select 
                  value={item.status}
                  onChange={(e) => updateStatus(item.id, e.target.value as any)}
                  className="text-xs bg-gray-50 border-none rounded-lg p-1.5 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="In Ricerca">In Ricerca</option>
                  <option value="Trovato">Trovato</option>
                  <option value="Perso">Perso</option>
                </select>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-20 text-center shadow-sm">
            <div className="inline-block p-4 rounded-full bg-gray-50 mb-4 text-gray-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <p className="text-gray-500 font-medium">Nessuna segnalazione trovata</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-lg font-bold">Segnala Prodotto Introvabile</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Prodotto / SKU</label>
                <input 
                  type="text" required
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  placeholder="es. MacBook Air M2 Grigio"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicazione Prevista</label>
                <input 
                  type="text" required
                  value={formData.expectedLocation}
                  onChange={(e) => setFormData({...formData, expectedLocation: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  placeholder="es. Scaffale B12, Piano 1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Note / Dettagli</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 resize-none"
                  rows={3}
                  placeholder="Es. Cercato 3 volte, inventario dice 1 disponibile..."
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 font-bold rounded-xl transition-colors hover:bg-gray-200">Annulla</button>
                <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all">Segnala</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissingProductsBoard;

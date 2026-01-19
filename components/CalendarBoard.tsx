
import React, { useState, useMemo } from 'react';
import { User, Role, CalendarEvent } from '../types';
import { parseEventFromNaturalLanguage } from '../geminiService';

interface CalendarBoardProps {
  user: User;
}

const CalendarBoard: React.FC<CalendarBoardProps> = ({ user }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 'e1',
      title: 'Riunione Logistica',
      startTime: new Date().setHours(10, 0, 0, 0).toString(),
      endTime: new Date().setHours(11, 0, 0, 0).toString(),
      userId: 'admin1',
      userName: 'Admin User',
      color: 'bg-indigo-500',
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00',
    description: '',
    color: 'bg-indigo-500'
  });

  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 to 18

  const daysOfWeek = useMemo(() => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff + (currentWeekOffset * 7)));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [currentWeekOffset]);

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    const result = await parseEventFromNaturalLanguage(aiInput);
    if (result) {
      setFormData({
        title: result.title || '',
        date: result.date || formData.date,
        startTime: result.startTime || formData.startTime,
        endTime: result.endTime || formData.endTime,
        description: result.description || '',
        color: 'bg-indigo-500'
      });
      setAiInput('');
    }
    setIsAiLoading(false);
  };

  const handleSlotClick = (day: Date, hour: number) => {
    setFormData({
      ...formData,
      date: day.toISOString().split('T')[0],
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(`${formData.date}T${formData.startTime}`);
    const end = new Date(`${formData.date}T${formData.endTime}`);
    
    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      startTime: start.getTime().toString(),
      endTime: end.getTime().toString(),
      userId: user.id,
      userName: user.name,
      color: formData.color
    };

    setEvents([...events, newEvent]);
    setIsModalOpen(false);
    setFormData({ ...formData, title: '', description: '' });
  };

  const colors = [
    { name: 'Indigo', class: 'bg-indigo-500' },
    { name: 'Smeraldo', class: 'bg-emerald-500' },
    { name: 'Ambra', class: 'bg-amber-500' },
    { name: 'Rosa', class: 'bg-rose-500' },
    { name: 'Ciano', class: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Agenda Settimanale</h3>
          <p className="text-gray-500">Pianifica attività e appuntamenti del team</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentWeekOffset(prev => prev - 1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-bold text-gray-700 min-w-[150px] text-center">
            {daysOfWeek[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - {daysOfWeek[6].toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <button 
            onClick={() => setCurrentWeekOffset(prev => prev + 1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="ml-4 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Nuovo Evento
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Giorni */}
          <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-gray-100">
            <div className="p-4 bg-gray-50 border-r border-gray-100"></div>
            {daysOfWeek.map((day, i) => (
              <div key={i} className={`p-4 text-center border-r border-gray-100 last:border-r-0 ${day.toDateString() === new Date().toDateString() ? 'bg-indigo-50/50' : ''}`}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{day.toLocaleDateString('it-IT', { weekday: 'short' })}</p>
                <p className={`text-lg font-bold ${day.toDateString() === new Date().toDateString() ? 'text-indigo-600' : 'text-gray-900'}`}>{day.getDate()}</p>
              </div>
            ))}
          </div>

          {/* Ore Operative */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-gray-50 last:border-b-0 group">
              <div className="p-4 bg-gray-50/50 border-r border-gray-100 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-400">{hour.toString().padStart(2, '0')}:00</span>
              </div>
              {daysOfWeek.map((day, i) => {
                const dayStr = day.toISOString().split('T')[0];
                const dayEvents = events.filter(e => {
                  const eDate = new Date(parseInt(e.startTime));
                  return eDate.toISOString().split('T')[0] === dayStr && eDate.getHours() === hour;
                });

                return (
                  <div 
                    key={i} 
                    onClick={() => handleSlotClick(day, hour)}
                    className="p-1 border-r border-gray-100 last:border-r-0 min-h-[60px] relative hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {dayEvents.map(ev => (
                      <div 
                        key={ev.id}
                        className={`absolute inset-1 p-2 rounded-lg ${ev.color} text-white text-[10px] font-bold shadow-sm overflow-hidden z-10`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="truncate">{ev.title}</p>
                        <p className="opacity-70 truncate">{ev.userName}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">Programma Evento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* AI Input */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <label className="text-[10px] font-bold text-indigo-700 uppercase block mb-2">Compila con Nexus AI</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Esempio: Call domani alle 15:00"
                    className="flex-1 px-3 py-1.5 text-xs border border-indigo-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={handleAiParse}
                    disabled={isAiLoading || !aiInput.trim()}
                    className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isAiLoading ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Titolo</label>
                  <input 
                    type="text" required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Nome attività"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Inizio</label>
                    <input 
                      type="time" required
                      min="08:00" max="18:00"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fine</label>
                    <input 
                      type="time" required
                      min="08:00" max="18:00"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Colore Etichetta</label>
                  <div className="flex gap-2">
                    {colors.map(c => (
                      <button 
                        key={c.class}
                        type="button"
                        onClick={() => setFormData({...formData, color: c.class})}
                        className={`w-8 h-8 rounded-full ${c.class} border-4 transition-all ${formData.color === c.class ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 font-bold rounded-xl">Annulla</button>
                  <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100">Salva</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarBoard;

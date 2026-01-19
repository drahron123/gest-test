
import React, { useState, useMemo } from 'react';
import { User, Role, Employee } from '../types';
import ChatModal from './ChatModal';

interface EmployeesBoardProps {
  user: User;
}

const EmployeesBoard: React.FC<EmployeesBoardProps> = ({ user }) => {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 'e1', name: 'Marco Rossi', role: 'Magazziniere', email: 'marco.r@nexushub.it', status: 'Online', avatar: 'https://i.pravatar.cc/150?u=e1' },
    { id: 'e2', name: 'Laura Bianchi', role: 'Logistica', email: 'laura.b@nexushub.it', status: 'In Pausa', avatar: 'https://i.pravatar.cc/150?u=e2' },
    { id: 'e3', name: 'Giuseppe Verdi', role: 'Amministrazione', email: 'g.verdi@nexushub.it', status: 'Offline', avatar: 'https://i.pravatar.cc/150?u=e3' },
    { id: 'e4', name: 'Sara Neri', role: 'Customer Care', email: 'sara.n@nexushub.it', status: 'Online', avatar: 'https://i.pravatar.cc/150?u=e4' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', role: '', email: '' });

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const employee: Employee = {
      ...newEmp,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Offline',
      avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
    };
    setEmployees([...employees, employee]);
    setIsAddModalOpen(false);
    setNewEmp({ name: '', role: '', email: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Team NexusHub</h3>
          <p className="text-gray-500">Gestisci i dipendenti e comunica con loro in tempo reale</p>
        </div>
        {user.role === Role.ADMIN && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-teal-100 transition-all self-start"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Aggiungi Dipendente
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Cerca per nome o ruolo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map((emp) => (
          <div key={emp.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center">
            <div className="relative mb-4">
              <img src={emp.avatar} alt={emp.name} className="w-20 h-20 rounded-full border-4 border-gray-50" />
              <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${
                emp.status === 'Online' ? 'bg-green-500' :
                emp.status === 'In Pausa' ? 'bg-amber-400' :
                'bg-gray-300'
              }`}></div>
            </div>
            <h4 className="font-bold text-gray-900 truncate w-full">{emp.name}</h4>
            <p className="text-xs text-teal-600 font-semibold mb-1">{emp.role}</p>
            <p className="text-[10px] text-gray-400 mb-6 truncate w-full">{emp.email}</p>
            
            <button 
              onClick={() => setSelectedEmployee(emp)}
              className="w-full py-2 bg-gray-50 hover:bg-teal-50 text-teal-700 font-bold rounded-xl text-xs transition-colors border border-gray-100 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              Invia Messaggio
            </button>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-lg font-bold">Aggiungi Collaboratore</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" required
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({...newEmp, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ruolo</label>
                <input 
                  type="text" required
                  value={newEmp.role}
                  onChange={(e) => setNewEmp({...newEmp, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Aziendale</label>
                <input 
                  type="email" required
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({...newEmp, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 font-bold rounded-xl">Annulla</button>
                <button type="submit" className="flex-1 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-100">Crea Profilo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEmployee && (
        <ChatModal 
          currentUser={user}
          targetUser={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

export default EmployeesBoard;

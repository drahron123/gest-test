
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export interface BulletinMessage {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isPinned: boolean;
  category: 'Avviso' | 'Evento' | 'Urgenza' | 'Generale';
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  userId: string;
  userName: string;
  color: string;
}

export interface Exchange {
  id: string;
  customerName: string;
  items: string;
  trackingNumber?: string;
  status: 'In attesa' | 'Spedito' | 'Consegnato';
  createdAt: string;
  authorName: string;
  notes?: string;
}

export interface ReturnItem {
  id: string;
  customerName: string;
  orderNumber: string;
  reason: string;
  status: 'Richiesto' | 'Ricevuto' | 'Rimborsato' | 'Rifiutato';
  createdAt: string;
  authorName: string;
}

export interface MissingProduct {
  id: string;
  productName: string;
  expectedLocation: string;
  status: 'In Ricerca' | 'Trovato' | 'Perso';
  createdAt: string;
  reportedBy: string;
  notes?: string;
}

export interface Reshipment {
  id: string;
  customerName: string;
  originalOrderRef: string;
  reason: string;
  status: 'In Lavorazione' | 'Pronto per Spedizione' | 'Rispedito';
  trackingNumber?: string;
  createdAt: string;
  authorName: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'Online' | 'In Pausa' | 'Offline';
  avatar: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

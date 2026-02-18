
import { User, Service, Booking, Block, UserRole, BookingStatus } from '../types';

const STORAGE_KEYS = {
  USERS: 'barber_users',
  SERVICES: 'barber_services',
  BOOKINGS: 'barber_bookings',
  BLOCKS: 'barber_blocks',
};

// Initial Data Seed
const defaultServices: Service[] = [
  { id: '1', name: 'Corte Social', priceCents: 4500 },
  { id: '2', name: 'Barba Terapia', priceCents: 3500 },
  { id: '3', name: 'Combo (Corte + Barba)', priceCents: 7000 },
];

export const db = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
  setUsers: (users: User[]) => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)),

  getServices: (): Service[] => {
    const services = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (!services) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(defaultServices));
      return defaultServices;
    }
    return JSON.parse(services);
  },

  getBookings: (): Booking[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]'),
  setBookings: (bookings: Booking[]) => localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings)),

  getBlocks: (): Block[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOCKS) || '[]'),
  setBlocks: (blocks: Block[]) => localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks)),
};

// Helper to simulate DB indexes/queries
export const findUserByEmail = (email: string) => db.getUsers().find(u => u.email === email);
export const findBookingById = (id: string) => db.getBookings().find(b => b.id === id);

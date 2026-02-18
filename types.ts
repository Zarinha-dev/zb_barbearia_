
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  priceCents: number;
}

export enum BookingStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELED = 'canceled'
}

export interface Booking {
  id: string;
  userId?: string; // Optional for guests
  guestName?: string;
  guestPhone?: string;
  serviceId: string;
  serviceName: string;
  startsAt: string; // ISO Datetime
  status: BookingStatus;
  priceCents: number;
  createdAt: string;
  canceledAt?: string;
}

export interface Block {
  id: string;
  startAt: string;
  endAt: string;
  reason: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

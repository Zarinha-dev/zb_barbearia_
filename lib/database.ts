// lib/storage.ts
export type Role = "user" | "admin";

export type User = {
  name: string;
  email: string;
  password: string; // front-only (demo)
  role: Role;
  createdAt: string;
};

export type Service = {
  id: string;
  name: string;
  priceCents: number;
};

export type BookingStatus = "active" | "canceled";

export type Booking = {
  id: string;
  userEmail: string;
  userName: string;
  serviceId: string;
  serviceName: string;
  priceCents: number;
  startsAt: string; // ISO string
  status: BookingStatus;
  createdAt: string;
  canceledAt?: string;
};

export type Block = {
  id: string;
  startAt: string; // ISO
  endAt: string;   // ISO
  reason?: string;
  createdAt: string;
};

const KEYS = {
  users: "zb_users",
  currentUser: "zb_current_user",
  services: "zb_services",
  bookings: "zb_bookings",
  blocks: "zb_blocks",
  seeded: "zb_seeded_v1",
};

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function seedIfNeeded() {
  const seeded = localStorage.getItem(KEYS.seeded);
  if (seeded) return;

  // services seed
  const services: Service[] = [
    { id: "1", name: "Corte Social", priceCents: 4500 },
    { id: "2", name: "Barba Terapia", priceCents: 3500 },
    { id: "3", name: "Combo Elite", priceCents: 7000 },
  ];
  writeJSON(KEYS.services, services);

  // admin seed
  const users: User[] = [];
  users.push({
    name: "Administrador",
    email: "admin@zb.com",
    password: "admin123",
    role: "admin",
    createdAt: new Date().toISOString(),
  });
  writeJSON(KEYS.users, users);

  writeJSON(KEYS.bookings, [] as Booking[]);
  writeJSON(KEYS.blocks, [] as Block[]);

  localStorage.setItem(KEYS.seeded, "1");
}

export function getServices(): Service[] {
  return readJSON<Service[]>(KEYS.services, []);
}

export function getUsers(): User[] {
  return readJSON<User[]>(KEYS.users, []);
}

export function saveUsers(users: User[]) {
  writeJSON(KEYS.users, users);
}

export function getCurrentUser(): User | null {
  return readJSON<User | null>(KEYS.currentUser, null);
}

export function setCurrentUser(user: User | null) {
  if (!user) localStorage.removeItem(KEYS.currentUser);
  else writeJSON(KEYS.currentUser, user);
}

export function getBookings(): Booking[] {
  return readJSON<Booking[]>(KEYS.bookings, []);
}

export function saveBookings(bookings: Booking[]) {
  writeJSON(KEYS.bookings, bookings);
}

export function getBlocks(): Block[] {
  return readJSON<Block[]>(KEYS.blocks, []);
}

export function saveBlocks(blocks: Block[]) {
  writeJSON(KEYS.blocks, blocks);
}

export function makeId(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function formatMoneyBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

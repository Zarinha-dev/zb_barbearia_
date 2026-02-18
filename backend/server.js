
const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const db = new Database('barber.db');

app.use(express.json());
app.use(cors());

// DB Initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('user', 'admin')) DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    starts_at TEXT NOT NULL,
    status TEXT CHECK(status IN ('active', 'completed', 'canceled')) DEFAULT 'active',
    price_cents INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    canceled_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(service_id) REFERENCES services(id)
  );

  CREATE TABLE IF NOT EXISTS blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_at TEXT NOT NULL,
    end_at TEXT NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_bookings_starts_at ON bookings(starts_at);
`);

// Initial Seed
const serviceCount = db.prepare('SELECT count(*) as count FROM services').get().count;
if (serviceCount === 0) {
  const insert = db.prepare('INSERT INTO services (name, price_cents) VALUES (?, ?)');
  insert.run('Corte Social', 4500);
  insert.run('Barba Terapia', 3500);
  insert.run('Combo Elite', 7000);
}

// Middlewares
const auth = (role) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (role && decoded.role !== role) return res.status(403).json({ error: 'Forbidden' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.post('/register', (req, res) => {
  const { name, email, password, admin_key } = req.body;
  const role = (admin_key === process.env.ADMIN_SETUP_KEY) ? 'admin' : 'user';
  const hash = bcrypt.hashSync(password, 10);
  
  try {
    const info = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(name, email, hash, role);
    const user = { id: info.lastInsertRowid, name, email, role };
    const token = jwt.sign(user, process.env.JWT_SECRET || 'secret');
    res.json({ user, token });
  } catch (e) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (user && bcrypt.compareSync(password, user.password_hash)) {
    const { password_hash, ...userData } = user;
    const token = jwt.sign(userData, process.env.JWT_SECRET || 'secret');
    res.json({ user: userData, token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Bookings
app.post('/bookings', auth(), (req, res) => {
  const { service_id, starts_at } = req.body;
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(service_id);
  
  // Conflict checks would go here (simplified)
  const info = db.prepare('INSERT INTO bookings (user_id, service_id, starts_at, price_cents) VALUES (?, ?, ?, ?)')
    .run(req.user.id, service_id, starts_at, service.price_cents);
  res.json({ id: info.lastInsertRowid });
});

app.get('/admin/revenue', auth('admin'), (req, res) => {
  const { from, to } = req.query;
  const total = db.prepare('SELECT SUM(price_cents) as total FROM bookings WHERE status != "canceled" AND starts_at BETWEEN ? AND ?').get(from, to);
  res.json({ total_cents: total.total || 0 });
});

app.listen(3000, () => console.log('Server running on port 3000'));

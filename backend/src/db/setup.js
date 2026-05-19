import { Database } from 'bun:sqlite'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../../../data')
const DB_PATH = join(DATA_DIR, 'frsc.db')

let db

export function getDb() {
  if (!db) {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
    db = new Database(DB_PATH)
    db.run('PRAGMA journal_mode = WAL')
    db.run('PRAGMA foreign_keys = ON')
  }
  return db
}

export const STATUSES = [
  'Order Placed', 'Package Picked Up', 'Processing at Origin Hub',
  'Departed Origin Country', 'In Transit (International)',
  'Arrived at Destination Country', 'Customs Clearance',
  'At Delivery Hub', 'Out for Delivery', 'Delivered'
]

export function generateTrackingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `FRSC-${seg()}-${seg()}-${seg()}`
}

export function setupDatabase() {
  const db = getDb()

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    name TEXT NOT NULL, phone TEXT, role TEXT NOT NULL DEFAULT 'customer',
    is_frozen INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY, tracking_code TEXT UNIQUE NOT NULL, sender_id TEXT,
    sender_name TEXT NOT NULL, sender_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL, recipient_email TEXT NOT NULL, recipient_phone TEXT,
    origin_country TEXT NOT NULL, destination_country TEXT NOT NULL,
    package_description TEXT NOT NULL, weight REAL NOT NULL DEFAULT 1.0,
    status TEXT NOT NULL DEFAULT 'Order Placed', status_index INTEGER NOT NULL DEFAULT 0,
    is_frozen INTEGER NOT NULL DEFAULT 0, service_type TEXT NOT NULL DEFAULT 'International Express',
    notes TEXT, estimated_delivery TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (sender_id) REFERENCES users(id)
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS status_history (
    id TEXT PRIMARY KEY, shipment_id TEXT NOT NULL, status TEXT NOT NULL,
    note TEXT, location TEXT, updated_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (shipment_id) REFERENCES shipments(id)
  )`)

  const admin = db.query("SELECT id FROM users WHERE role = 'superadmin'").get()
  if (!admin) seedData(db)
}

function seedData(db) {
  const adminId = uuidv4()
  db.run(`INSERT INTO users (id, email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?, ?)`,
    [adminId, 'admin@firstroyalsecurity.com', bcrypt.hashSync('Royal@Admin2024!', 10), 'Royal Administrator', '+1-800-ROYAL-01', 'superadmin'])

  const customers = [
    { id: uuidv4(), name: 'James Mitchell', email: 'james@example.com', phone: '+1-555-0101' },
    { id: uuidv4(), name: 'Sarah Chen', email: 'sarah@example.com', phone: '+44-7911-123456' },
    { id: uuidv4(), name: 'Mohammed Al-Rashid', email: 'mohammed@example.com', phone: '+971-50-1234567' },
  ]
  const cHash = bcrypt.hashSync('Customer123!', 10)
  for (const c of customers) {
    db.run(`INSERT INTO users (id, email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?, 'customer')`,
      [c.id, c.email, cHash, c.name, c.phone])
  }

  const seeds = [
    { id: uuidv4(), tc: 'FRSC-A1B2-C3D4-E5F6', si: customers[0], ri: { name: 'Emma Johnson', email: 'emma@recipient.com', phone: '+44-7911-654321' }, from: 'United States', to: 'United Kingdom', desc: 'Electronics - Laptop Computer', w: 2.5, si2: 4, svc: 'International Express', days: 3 },
    { id: uuidv4(), tc: 'FRSC-X7Y8-Z9W0-V1U2', si: customers[1], ri: { name: 'Carlos Rodriguez', email: 'carlos@recipient.com', phone: '+34-612-345678' }, from: 'United Kingdom', to: 'Spain', desc: 'Documents - Legal Papers', w: 0.3, si2: 9, svc: 'Priority Royal', days: -2 },
    { id: uuidv4(), tc: 'FRSC-P3Q4-R5S6-T7U8', si: customers[2], ri: { name: 'Yuki Tanaka', email: 'yuki@recipient.com', phone: '+81-90-1234-5678' }, from: 'UAE', to: 'Japan', desc: 'Luxury Goods - Jewelry', w: 0.8, si2: 6, svc: 'Secure Freight', days: 5 },
    { id: uuidv4(), tc: 'FRSC-M1N2-O3P4-Q5R6', si: customers[0], ri: { name: 'Amara Osei', email: 'amara@recipient.com', phone: '+233-24-1234567' }, from: 'United States', to: 'Ghana', desc: 'Medical Equipment', w: 5.2, si2: 2, svc: 'International Express', days: 7 },
    { id: uuidv4(), tc: 'FRSC-K9L0-M1N2-O3P4', si: customers[1], ri: { name: 'Ivan Petrov', email: 'ivan@recipient.com', phone: '+7-900-1234567' }, from: 'United Kingdom', to: 'Russia', desc: 'Industrial Parts', w: 12.0, si2: 3, svc: 'Secure Freight', days: 10, frozen: true },
  ]

  const locs = ['Origin Facility', 'Origin Hub', 'Origin Airport', 'International Departure', 'In Transit', 'Destination Airport', 'Customs', 'Destination Hub', 'Out for Delivery', 'Delivered']

  for (const s of seeds) {
    const est = new Date(Date.now() + s.days * 864e5).toISOString().split('T')[0]
    db.run(`INSERT INTO shipments (id, tracking_code, sender_id, sender_name, sender_email, recipient_name, recipient_email, recipient_phone, origin_country, destination_country, package_description, weight, status, status_index, service_type, estimated_delivery, is_frozen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.tc, s.si.id, s.si.name, s.si.email, s.ri.name, s.ri.email, s.ri.phone, s.from, s.to, s.desc, s.w, STATUSES[s.si2], s.si2, s.svc, est, s.frozen ? 1 : 0])

    for (let i = 0; i <= s.si2; i++) {
      db.run(`INSERT INTO status_history (id, shipment_id, status, note, location, updated_by) VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), s.id, STATUSES[i], `Package ${STATUSES[i].toLowerCase()}`, locs[i] || '', adminId])
    }
    if (s.frozen) {
      db.run(`INSERT INTO status_history (id, shipment_id, status, note, location, updated_by) VALUES (?, ?, 'On Hold', 'Shipment held pending documentation review', 'Customs Office', ?)`,
        [uuidv4(), s.id, adminId])
    }
  }

  console.log('\n✅ Database seeded')
  console.log('👑 Admin: admin@firstroyalsecurity.com / Royal@Admin2024!')
  console.log('👤 Customer: james@example.com / Customer123!\n')
}

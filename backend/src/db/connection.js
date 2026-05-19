import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User, Shipment, StatusHistory, STATUSES } from '../models/index.js'

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI environment variable is not set')

  await mongoose.connect(uri, { dbName: 'frsc' })
  console.log('✅ MongoDB connected')

  await seedIfEmpty()
}

async function seedIfEmpty() {
  const adminExists = await User.findOne({ role: 'superadmin' })
  if (adminExists) return

  console.log('🌱 Seeding initial data...')

  // Super admin
  const admin = await User.create({
    email: 'admin@firstroyalsecurity.com',
    password_hash: await bcrypt.hash('Royal@Admin2024!', 10),
    name: 'Royal Administrator',
    phone: '+1-800-ROYAL-01',
    role: 'superadmin',
  })

  // Demo customers
  const cHash = await bcrypt.hash('Customer123!', 10)
  const [james, sarah, mohammed] = await User.insertMany([
    { email: 'james@example.com', password_hash: cHash, name: 'James Mitchell', phone: '+1-555-0101' },
    { email: 'sarah@example.com', password_hash: cHash, name: 'Sarah Chen', phone: '+44-7911-123456' },
    { email: 'mohammed@example.com', password_hash: cHash, name: 'Mohammed Al-Rashid', phone: '+971-50-1234567' },
  ])

  const seeds = [
    { tc: 'FRSC-A1B2-C3D4-E5F6', sender: james, rn: 'Emma Johnson', re: 'emma@recipient.com', rp: '+44-7911-654321', from: 'United States', to: 'United Kingdom', desc: 'Electronics - Laptop Computer', w: 2.5, si: 4, svc: 'International Express', days: 3 },
    { tc: 'FRSC-X7Y8-Z9W0-V1U2', sender: sarah, rn: 'Carlos Rodriguez', re: 'carlos@recipient.com', rp: '+34-612-345678', from: 'United Kingdom', to: 'Spain', desc: 'Documents - Legal Papers', w: 0.3, si: 9, svc: 'Priority Royal', days: -2 },
    { tc: 'FRSC-P3Q4-R5S6-T7U8', sender: mohammed, rn: 'Yuki Tanaka', re: 'yuki@recipient.com', rp: '+81-90-1234-5678', from: 'UAE', to: 'Japan', desc: 'Luxury Goods - Jewelry', w: 0.8, si: 6, svc: 'Secure Freight', days: 5 },
    { tc: 'FRSC-M1N2-O3P4-Q5R6', sender: james, rn: 'Amara Osei', re: 'amara@recipient.com', rp: '+233-24-1234567', from: 'United States', to: 'Ghana', desc: 'Medical Equipment', w: 5.2, si: 2, svc: 'International Express', days: 7 },
    { tc: 'FRSC-K9L0-M1N2-O3P4', sender: sarah, rn: 'Ivan Petrov', re: 'ivan@recipient.com', rp: '+7-900-1234567', from: 'United Kingdom', to: 'Russia', desc: 'Industrial Parts', w: 12.0, si: 3, svc: 'Secure Freight', days: 10, frozen: true },
  ]

  const locs = ['Origin Facility', 'Origin Hub', 'Origin Airport', 'International Departure', 'In Transit', 'Destination Airport', 'Customs Office', 'Destination Hub', 'Out for Delivery', 'Delivered']

  for (const s of seeds) {
    const est = new Date(Date.now() + s.days * 864e5).toISOString().split('T')[0]
    const shipment = await Shipment.create({
      tracking_code: s.tc,
      sender_id: s.sender._id,
      sender_name: s.sender.name,
      sender_email: s.sender.email,
      recipient_name: s.rn,
      recipient_email: s.re,
      recipient_phone: s.rp,
      origin_country: s.from,
      destination_country: s.to,
      package_description: s.desc,
      weight: s.w,
      status: STATUSES[s.si],
      status_index: s.si,
      service_type: s.svc,
      estimated_delivery: est,
      is_frozen: s.frozen || false,
    })

    const historyDocs = []
    for (let i = 0; i <= s.si; i++) {
      historyDocs.push({ shipment_id: shipment._id, status: STATUSES[i], note: `Package ${STATUSES[i].toLowerCase()}`, location: locs[i] || '', updated_by: admin._id })
    }
    if (s.frozen) {
      historyDocs.push({ shipment_id: shipment._id, status: 'On Hold', note: 'Shipment held pending documentation review', location: 'Customs Office', updated_by: admin._id })
    }
    await StatusHistory.insertMany(historyDocs)
  }

  console.log('✅ Seed complete')
  console.log('👑 Admin: admin@firstroyalsecurity.com / Royal@Admin2024!')
  console.log('👤 Customer: james@example.com / Customer123!')
}

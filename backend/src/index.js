import express from 'express'
import cors from 'cors'
import { setupDatabase } from './db/setup.js'
import authRoutes from './routes/auth.js'
import shipmentRoutes from './routes/shipments.js'
import adminRoutes from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 5000

setupDatabase()

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/shipments', shipmentRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'First Royal Security Company API v1.0' }))

app.listen(PORT, () => {
  console.log(`\n👑 ================================`)
  console.log(`   FIRST ROYAL SECURITY COMPANY`)
  console.log(`   API running on port ${PORT}`)
  console.log(`👑 ================================\n`)
})

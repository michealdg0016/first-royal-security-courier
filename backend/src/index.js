import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './db/connection.js'
import authRoutes from './routes/auth.js'
import shipmentRoutes from './routes/shipments.js'
import adminRoutes from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean), credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/shipments', shipmentRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'First Royal Security Company API v2.0', db: 'mongodb' }))

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n👑 ================================`)
      console.log(`   FIRST ROYAL SECURITY COMPANY`)
      console.log(`   API v2.0 running on port ${PORT}`)
      console.log(`   Database: MongoDB Atlas`)
      console.log(`👑 ================================\n`)
    })
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })

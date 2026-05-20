import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Load .env relative to this file's location (works whether cwd is repo root or backend/)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, '../.env') })

import express from 'express'
import cors from 'cors'
import { connectDB } from './db/connection.js'
import authRoutes from './routes/auth.js'
import shipmentRoutes from './routes/shipments.js'
import adminRoutes from './routes/admin.js'
import chatRoutes from './routes/chat.js'
import { setupSocketIO } from './socket.js'

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 5000
const isDev = process.env.NODE_ENV !== 'production'

const ORIGINS = ['http://localhost:5173', 'http://localhost:3000']

// CORS only needed in dev (Vite proxy handles it in prod)
if (isDev) {
  app.use(cors({ origin: ORIGINS, credentials: true }))
}

app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/shipments', shipmentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/chat', chatRoutes)
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'First Royal Security Company API v2.0', db: 'mongodb', realtime: 'socket.io' }))

// Serve React frontend in production
const frontendDist = path.join(__dirname, '../../frontend/dist')
app.use(express.static(frontendDist))
app.get('*', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')))

// Socket.IO
const io = new Server(httpServer, {
  cors: isDev ? { origin: ORIGINS, methods: ['GET', 'POST'], credentials: true } : {},
  path: '/socket.io',
})
setupSocketIO(io)

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`\n👑 ================================`)
      console.log(`   FIRST ROYAL SECURITY COMPANY`)
      console.log(`   API v2.0 running on port ${PORT}`)
      console.log(`   Database: MongoDB Atlas`)
      console.log(`   Real-time: Socket.IO ✓`)
      console.log(`   Mode: ${isDev ? 'development' : 'production'}`)
      console.log(`👑 ================================\n`)
    })
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })

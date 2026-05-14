require('dotenv').config()

const express         = require('express')
const { MongoClient } = require('mongodb')

// ── Routers ───────────────────────────────────────────────────────────────────
const usersRouter       = require('./routes/usersRouter')
const decksRouter       = require('./routes/decksRouter')
const cardsRouter       = require('./routes/cardsRouter')
const externalApiRouter = require('./routes/externalApiRouter')
const adminRouter       = require('./routes/adminRouter')

const app  = express()
const PORT = process.env.PORT || 4000

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: false }))  // for the admin HTML form

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

// ── Mount routers ─────────────────────────────────────────────────────────────
app.use('/users',        usersRouter)         // POST /users/login, /users/create
app.use('/api/decks',    decksRouter)         // CRUD for decks + cards inside decks
app.use('/api/cards',    cardsRouter)         // CRUD for the local card library
app.use('/api/external', externalApiRouter)   // Scryfall + EDHREC proxy routes
app.use('/admin',        adminRouter)         // Server-rendered HTML form routes

app.get('/api/message', (_req, res) => {
  res.json({ message: 'BinderBase API is running!' })
})

// ── MongoDB + start ───────────────────────────────────────────────────────────
const uri    = process.env.MONGODB_URI     || 'mongodb://localhost:27017'
const dbName = process.env.MONGODB_DB_NAME || 'binderbase'

async function startServer() {
  try {
    const client = new MongoClient(uri)
    await client.connect()
    console.log('Connected to MongoDB')

    app.locals.db = client.db(dbName)

    app.listen(PORT, () => {
      console.log(`Express API  →  http://localhost:${PORT}`)
      console.log(`Admin panel  →  http://localhost:${PORT}/admin/new-deck`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

startServer()
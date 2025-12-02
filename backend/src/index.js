import Express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'

// Import routers
import deckRoutes from './routes/deck.js'

// Configure environment variables
dotenv.config()
const LISTEN_PORT = process.env.LISTEN_PORT ?? 3000

// Creates the express server app
const app = new Express()

// Attach universal app filters
app.use(morgan('dev'))

// Parse JSON bodies
app.use(Express.json())

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

// Attach routers
app.use('/api', deckRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'BinderBase API is running' })
})

// Database connection test endpoint
app.get('/api/test-db', async (req, res) => {
    try {
        const { DBClient } = await import('./data/supabaseController.js')
        const { data, error } = await DBClient
            .from('deckName')
            .select('count')
            .limit(1)
        
        if (error) throw error
        
        res.json({ 
            success: true, 
            message: 'Database connection successful',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: error.stack
        })
    }
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' })
})

// Listen
app.listen(LISTEN_PORT, () => {
    console.log(`Server listening on http://127.0.0.1:${LISTEN_PORT}`)
})
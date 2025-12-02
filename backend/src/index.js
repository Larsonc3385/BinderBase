import path from 'node:path'

import Express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'

/**
 * Configure and start the express server
 */

// Import the individual routers

//import Routes from './routes/'

// Configure environment variables
dotenv.config()
const LISTEN_PORT = process.env.LISTEN_PORT ?? 3000

// Creates the express server app
const app = new Express()

// Attach universal app filters
app.use(morgan('dev'))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5174/')
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

            if (req.method === 'OPTIONS') {
            return res.sendStatus(200)
        }
        next()
})

// Attach our basic routers
//app.use(ROUTE NAME HERE, ROUTE CONNECTION HERE)

// Listen
app.listen(LISTEN_PORT, () => {
    console.log(`Server listening on http://127.0.0.1:${LISTEN_PORT}`)
})
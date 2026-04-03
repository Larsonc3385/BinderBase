import Express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'

import deckRoutes from './routes/deck.js'
import micRoutes from './routes/mic.js'

dotenv.config()
const PORT = process.env.PORT || 3000

const app = new Express()

app.use('/mic', micRoutes);

app.use(cors({
  origin: 'https://binder-base.vercel.app'  // removed trailing slash
}))

app.use(morgan('dev'))
app.use(Express.json())

app.use('/api', deckRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'BinderBase API is running' })
})

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' })
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

export default app
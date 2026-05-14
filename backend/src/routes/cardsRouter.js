const { Router }   = require('express')
const { ObjectId } = require('mongodb')
const Card         = require('../models/Card')

const cardsRouter = Router()

// GET /api/cards — summary list of all locally saved cards
cardsRouter.get('/', async (req, res) => {
  try {
    const cards = await Card(req.app.locals.db)
      .find({}, { projection: { oracleText: 0 } })
      .sort({ addedAt: -1 })
      .toArray()
    res.json({ success: true, cards })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/cards/:id — full details for one local card
cardsRouter.get('/:id', async (req, res) => {
  try {
    const card = await Card(req.app.locals.db)
      .findOne({ _id: new ObjectId(req.params.id) })
    if (!card) return res.status(404).json({ success: false, error: 'Card not found' })
    res.json({ success: true, card })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/cards — import a card into the local library (from Scryfall search results)
// Body should contain normalized card data (scryfallId, name, image, etc.)
cardsRouter.post('/', async (req, res) => {
  const { name, scryfallId } = req.body
  if (!name) return res.status(400).json({ success: false, error: 'Card name is required' })

  try {
    const col = Card(req.app.locals.db)

    // Don't duplicate — if already in library return the existing one
    const existing = scryfallId
      ? await col.findOne({ scryfallId })
      : await col.findOne({ name })

    if (existing) {
      return res.json({ success: true, card: existing, duplicate: true })
    }

    const doc    = Card.create(req.body)
    const result = await col.insertOne(doc)
    res.status(201).json({ success: true, card: { ...doc, _id: result.insertedId } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/cards/:id — remove a card from the local library
cardsRouter.delete('/:id', async (req, res) => {
  try {
    await Card(req.app.locals.db).deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({ success: true, message: 'Card removed from library' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = cardsRouter
const { Router }   = require('express')
const { ObjectId } = require('mongodb')
const Deck         = require('../models/Deck')

const decksRouter = Router()

// ── Decks ─────────────────────────────────────────────────────────────────────

// GET /api/decks?username=
decksRouter.get('/', async (req, res) => {
  try {
    const filter = req.query.username ? { builtBy: req.query.username } : {}
    const decks  = await Deck(req.app.locals.db)
      .find(filter, { projection: { cards: 0 } })
      .sort({ createdAt: -1 })
      .toArray()
    res.json({ success: true, decks })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/decks/:id
decksRouter.get('/:id', async (req, res) => {
  try {
    const deck = await Deck(req.app.locals.db)
      .findOne({ _id: new ObjectId(req.params.id) })
    if (!deck) return res.status(404).json({ success: false, error: 'Deck not found' })
    res.json({ success: true, deck })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/decks
decksRouter.post('/', async (req, res) => {
  const { name, format, username } = req.body
  if (!name) return res.status(400).json({ success: false, error: 'Deck name is required' })
  try {
    const doc    = Deck.create({ name, format, username })
    const result = await Deck(req.app.locals.db).insertOne(doc)
    res.json({ success: true, deck: { ...doc, _id: result.insertedId } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/decks/:id
decksRouter.delete('/:id', async (req, res) => {
  try {
    await Deck(req.app.locals.db).deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({ success: true, message: 'Deck deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── Commander ─────────────────────────────────────────────────────────────────

// PUT /api/decks/:id/commander
decksRouter.put('/:id/commander', async (req, res) => {
  try {
    const updated = await Deck(req.app.locals.db).findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { commander: req.body.commander || null } },
      { returnDocument: 'after' }
    )
    res.json({ success: true, deck: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── Cards ─────────────────────────────────────────────────────────────────────

// POST /api/decks/:id/cards
// ai
decksRouter.post('/:id/cards', async (req, res) => {
  const { cardName, quantity = 1 } = req.body
  if (!cardName) return res.status(400).json({ success: false, error: 'Card name required' })

  try {
    // Fetch card data from Scryfall via our own server (never the browser)
    const sfRes = await fetch(
      `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`
    )
    if (!sfRes.ok) throw new Error(`Card not found: ${cardName}`)
    const sfCard = await sfRes.json()

    const col  = Deck(req.app.locals.db)
    const deck = await col.findOne({ _id: new ObjectId(req.params.id) })
    if (!deck) return res.status(404).json({ success: false, error: 'Deck not found' })

    const existing = deck.cards.find(c => c.card_name === sfCard.name)
    let updated

    if (existing) {
      updated = await col.findOneAndUpdate(
        { _id: new ObjectId(req.params.id), 'cards.card_name': sfCard.name },
        { $inc: { 'cards.$.quantity': quantity } },
        { returnDocument: 'after' }
      )
    } else {
      const newCard = Deck.newCard({
        cardName:  sfCard.name,
        cardImage: sfCard.image_uris?.normal || sfCard.card_faces?.[0]?.image_uris?.normal || null,
        quantity,
      })
      updated = await col.findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $push: { cards: newCard } },
        { returnDocument: 'after' }
      )
    }

    res.json({ success: true, deck: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/decks/:id/cards/:cardId
decksRouter.put('/:id/cards/:cardId', async (req, res) => {
  const { quantity } = req.body
  try {
    const col = Deck(req.app.locals.db)
    let updated

    if (quantity <= 0) {
      updated = await col.findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $pull: { cards: { _id: new ObjectId(req.params.cardId) } } },
        { returnDocument: 'after' }
      )
    } else {
      updated = await col.findOneAndUpdate(
        { _id: new ObjectId(req.params.id), 'cards._id': new ObjectId(req.params.cardId) },
        { $set: { 'cards.$.quantity': quantity } },
        { returnDocument: 'after' }
      )
    }

    res.json({ success: true, deck: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/decks/:id/cards/:cardId
decksRouter.delete('/:id/cards/:cardId', async (req, res) => {
  try {
    const updated = await Deck(req.app.locals.db).findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $pull: { cards: { _id: new ObjectId(req.params.cardId) } } },
      { returnDocument: 'after' }
    )
    res.json({ success: true, deck: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = decksRouter
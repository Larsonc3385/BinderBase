const { ObjectId } = require('mongodb')

const COLLECTION = 'decks'

/**
 * Returns the decks collection from the db instance.
 * Usage: const col = Deck(req.app.locals.db)
 */
function Deck(db) {
  return db.collection(COLLECTION)
}

/**
 * Build a new deck document ready for insertOne()
 */
Deck.create = function ({ name, format = 'Commander', username = null }) {
  return {
    name,
    format,
    commander: null,
    builtBy: username,
    cards: [],
    createdAt: new Date(),
  }
}

/**
 * Build a new card subdocument ready for $push
 */
Deck.newCard = function ({ cardName, cardImage = null, quantity = 1 }) {
  return {
    _id: new ObjectId(),
    card_name: cardName,
    card_image: cardImage,
    quantity,
  }
}

module.exports = Deck
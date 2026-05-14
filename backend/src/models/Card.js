const COLLECTION = 'cards'

/**
 * Returns the cards collection from the db instance.
 * Usage: const col = Card(req.app.locals.db)
 *
 * This is the LOCAL library of saved cards in MongoDB —
 * separate from Scryfall. Cards get imported here when a
 * user clicks "Add to Library" in the search/discover UI.
 */
function Card(db) {
  return db.collection(COLLECTION)
}

/**
 * Build a new card document ready for insertOne().
 * Normalizes data coming from Scryfall into a local shape.
 */
// ai
Card.fromScryfall = function (sfCard) {
  return {
    name:       sfCard.name,
    scryfallId: sfCard.id,
    image:      sfCard.image_uris?.normal
                  || sfCard.card_faces?.[0]?.image_uris?.normal
                  || null,
    type:       sfCard.type_line       || null,
    manaCost:   sfCard.mana_cost       || null,
    colors:     sfCard.color_identity  || [],
    oracleText: sfCard.oracle_text     || null,
    set:        sfCard.set_name        || null,
    rarity:     sfCard.rarity          || null,
    addedAt:    new Date(),
  }
}

/**
 * Build a card document from a plain object (e.g. from the admin form
 * or a manually constructed POST body).
 */
Card.create = function ({ name, scryfallId = null, image = null, type = null,
                          manaCost = null, colors = [], oracleText = null,
                          set = null, rarity = null }) {
  return {
    name, scryfallId, image, type, manaCost,
    colors, oracleText, set, rarity,
    addedAt: new Date(),
  }
}

module.exports = Card
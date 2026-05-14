/**
 * Seed script — populates MongoDB with starter data.
 * Run with: npm run seed
 *
 * Fetches a handful of iconic Commander cards from Scryfall
 * and saves them to the local cards collection, then creates
 * a sample deck.
 */

// ai
require('dotenv').config()

const { MongoClient } = require('mongodb')

const uri    = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME

// Iconic cards to seed into the local library
const SEED_CARDS = [
  'Sol Ring',
  'Command Tower',
  'Arcane Signet',
  'Swords to Plowshares',
  'Counterspell',
  'Lightning Greaves',
  'Cultivate',
  'Path to Exile',
  'Rhystic Study',
  'Cyclonic Rift',
]

// ai
async function fetchCard(name) {
  const res = await fetch(
    `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`
  )
  if (!res.ok) {
    console.warn(`  ⚠  Could not fetch "${name}" from Scryfall — skipping`)
    return null
  }
  const card = await res.json()
  return {
    name:       card.name,
    scryfallId: card.id,
    image:      card.image_uris?.normal
                  || card.card_faces?.[0]?.image_uris?.normal
                  || null,
    type:       card.type_line      || null,
    manaCost:   card.mana_cost      || null,
    colors:     card.color_identity || [],
    oracleText: card.oracle_text    || null,
    set:        card.set_name       || null,
    rarity:     card.rarity         || null,
    addedAt:    new Date(),
  }
}

async function seed() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    const db = client.db(dbName)

    // ── Cards ──────────────────────────────────────────────────────────────
    const cardsCol = db.collection('cards')
    await cardsCol.deleteMany({})   // clear existing seed data
    console.log('\nSeeding cards collection…')

    const cardDocs = []
    for (const name of SEED_CARDS) {
      process.stdout.write(`  Fetching ${name}… `)
      const doc = await fetchCard(name)
      if (doc) {
        cardDocs.push(doc)
        console.log('✓')
      }
      // Be polite to the Scryfall API
      await new Promise(r => setTimeout(r, 120))
    }

    if (cardDocs.length > 0) {
      await cardsCol.insertMany(cardDocs)
      console.log(`  → Inserted ${cardDocs.length} cards`)
    }

    // ── Sample deck ────────────────────────────────────────────────────────
    const decksCol = db.collection('decks')
    await decksCol.deleteMany({ builtBy: '__seed__' })

    const sampleDeck = {
      name:      'Starter Staples',
      format:    'Commander',
      commander: null,
      builtBy:   '__seed__',
      cards:     cardDocs.slice(0, 5).map(c => ({
        card_name:  c.name,
        card_image: c.image,
        quantity:   1,
      })),
      createdAt: new Date(),
    }
    await decksCol.insertOne(sampleDeck)
    console.log('\nSeeded sample deck "Starter Staples"')

    console.log('\n✅ Seed complete!')
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  } finally {
    await client.close()
  }
}

seed()
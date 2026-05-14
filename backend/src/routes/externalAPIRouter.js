const { Router } = require('express')
const Card       = require('../models/Card')

const externalApiRouter = Router()

/**
 * ALL calls to Scryfall and EDHREC originate here on the server.
 * The React frontend never contacts third-party APIs directly.
 */

// ── Scryfall: search ──────────────────────────────────────────────────────────

// GET /api/external/search?q=
// ai
externalApiRouter.get('/search', async (req, res) => {
  const { q } = req.query
  if (!q) return res.status(400).json({ success: false, error: 'Query required' })

  try {
    const sfRes = await fetch(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(q)}`
    )
    if (!sfRes.ok) return res.json({ success: true, cards: [] })

    const data  = await sfRes.json()
    // Normalize Scryfall shape for the frontend
    const cards = (data.data || []).map(card => ({
      name:       card.name,
      image:      card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null,
      scryfallId: card.id,
      type:       card.type_line,
      manaCost:   card.mana_cost  || null,
      colors:     card.color_identity || [],
      oracleText: card.oracle_text    || null,
      set:        card.set_name       || null,
      rarity:     card.rarity         || null,
    }))

    res.json({ success: true, cards })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── Scryfall: fetch one card by name (used when adding to a deck) ─────────────

// GET /api/external/named?name=
externalApiRouter.get('/named', async (req, res) => {
  const { name } = req.query
  if (!name) return res.status(400).json({ success: false, error: 'Name required' })

  try {
    const sfRes = await fetch(
      `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`
    )
    if (!sfRes.ok) throw new Error(`Card not found: ${name}`)
    const card = await sfRes.json()

    res.json({
      success: true,
      card: {
        name:       card.name,
        image:      card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null,
        scryfallId: card.id,
        type:       card.type_line,
        manaCost:   card.mana_cost       || null,
        colors:     card.color_identity  || [],
        oracleText: card.oracle_text     || null,
        set:        card.set_name        || null,
        rarity:     card.rarity          || null,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── EDHREC: commander recommendations ────────────────────────────────────────

// GET /api/external/recommendations/:commanderName
// ai
externalApiRouter.get('/recommendations/:commanderName', async (req, res) => {
  try {
    const slug = req.params.commanderName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    const edhRes = await fetch(`https://json.edhrec.com/pages/commanders/${slug}.json`)
    if (!edhRes.ok) throw new Error('Commander not found on EDHREC')

    const data = await edhRes.json()
    const recommendations = {
      commander:    req.params.commanderName,
      topCards:     [],
      creatures:    [],
      instants:     [],
      sorceries:    [],
      artifacts:    [],
      enchantments: [],
      lands:        [],
    }

    const cardlists = data.container?.json_dict?.cardlists || []
    for (const list of cardlists) {
      const header = (list.header || '').toLowerCase()
      const cards  = (list.cardviews || []).slice(0, 12).map(c => ({
        name:      c.name,
        inclusion: c.inclusion ?? null,
        synergy:   c.synergy   ?? null,
      }))

      if      (header.includes('top'))                                      recommendations.topCards     = cards
      else if (header.includes('creature'))                                 recommendations.creatures    = cards
      else if (header.includes('instant'))                                  recommendations.instants     = cards
      else if (header.includes('sorcery') || header.includes('sorceries')) recommendations.sorceries    = cards
      else if (header.includes('artifact'))                                 recommendations.artifacts    = cards
      else if (header.includes('enchantment'))                              recommendations.enchantments = cards
      else if (header.includes('land'))                                     recommendations.lands        = cards
    }

    res.json({ success: true, recommendations })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = externalApiRouter
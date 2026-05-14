const { Router } = require('express')
const Deck       = require('../models/Deck')

const adminRouter = Router()

// GET /admin/new-deck — serve a plain HTML form (no React, no fetch)
adminRouter.get('/new-deck', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Admin — New Deck</title>
  <style>
    body { font-family: sans-serif; max-width: 480px; margin: 3rem auto; padding: 0 1rem; }
    h1   { font-size: 1.4rem; margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.3rem; font-weight: 600; font-size: 0.9rem; }
    input, select {
      width: 100%; padding: 0.5rem 0.6rem; margin-bottom: 1rem;
      border: 1px solid #ccc; border-radius: 4px; font-size: 1rem;
    }
    button {
      padding: 0.55rem 1.4rem; background: #1a5c2a; color: #fff;
      border: none; border-radius: 4px; font-size: 1rem; cursor: pointer;
    }
    button:hover { background: #154a22; }
    .success { color: green; margin-bottom: 1rem; }
    .error   { color: red;   margin-bottom: 1rem; }
    a { font-size: 0.85rem; color: #555; }
  </style>
</head>
<body>
  <h1>Admin — Create New Deck</h1>

  <form method="POST" action="/admin/new-deck">
    <label for="name">Deck Name</label>
    <input id="name" name="name" type="text" placeholder="My Commander Deck" required />

    <label for="format">Format</label>
    <select id="format" name="format">
      <option value="Commander">Commander</option>
      <option value="Standard">Standard</option>
      <option value="Modern">Modern</option>
      <option value="Legacy">Legacy</option>
    </select>

    <label for="username">Owner Username (optional)</label>
    <input id="username" name="username" type="text" placeholder="leave blank for anonymous" />

    <button type="submit">Create Deck</button>
  </form>

  <br />
  <a href="/admin/decks">← View all decks</a>
</body>
</html>`)
})

// POST /admin/new-deck — reads URL-encoded body, inserts into Mongo, redirects
adminRouter.post('/new-deck', async (req, res) => {
  const { name, format, username } = req.body   // req.body is URL-encoded (not JSON)

  if (!name || !name.trim()) {
    return res.status(400).send(`<!DOCTYPE html><html><body>
      <p style="color:red;font-family:sans-serif;">Deck name is required.
      <a href="/admin/new-deck">Go back</a></p></body></html>`)
  }

  try {
    const doc = Deck.create({ name: name.trim(), format, username: username?.trim() || null })
    await Deck(req.app.locals.db).insertOne(doc)
    // Classic redirect — no JSON response
    res.redirect('/admin/decks?created=1')
  } catch (err) {
    console.error('Admin create deck error:', err)
    res.status(500).send('Server error — could not create deck.')
  }
})

// GET /admin/decks — simple HTML list of all decks (bonus admin view)
adminRouter.get('/decks', async (req, res) => {
  try {
    const decks = await Deck(req.app.locals.db)
      .find({}, { projection: { cards: 0 } })
      .sort({ createdAt: -1 })
      .toArray()

    const created = req.query.created === '1'
      ? '<p style="color:green;">✓ Deck created successfully!</p>'
      : ''

    const rows = decks.length === 0
      ? '<tr><td colspan="4" style="color:#888;text-align:center;">No decks yet.</td></tr>'
      : decks.map(d => `
          <tr>
            <td>${d._id}</td>
            <td>${d.name}</td>
            <td>${d.format}</td>
            <td>${d.builtBy || '—'}</td>
          </tr>`).join('')

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Admin — All Decks</title>
  <style>
    body  { font-family: sans-serif; max-width: 860px; margin: 3rem auto; padding: 0 1rem; }
    h1    { font-size: 1.4rem; margin-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.9rem; }
    th, td { border: 1px solid #ddd; padding: 0.45rem 0.6rem; text-align: left; }
    th    { background: #f3f3f3; }
    a     { font-size: 0.85rem; color: #1a5c2a; }
  </style>
</head>
<body>
  <h1>Admin — All Decks</h1>
  ${created}
  <a href="/admin/new-deck">+ Create new deck</a>
  <table>
    <thead>
      <tr><th>ID</th><th>Name</th><th>Format</th><th>Owner</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`)
  } catch (err) {
    res.status(500).send('Server error.')
  }
})

module.exports = adminRouter
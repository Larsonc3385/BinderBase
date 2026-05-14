const { Router } = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

const usersRouter = Router()

// POST /users/login
usersRouter.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res.status(400).json({ valid: false, message: 'Missing credentials' })

  try {
    const col  = User(req.app.locals.db)
    const user = await col.findOne({ username })

    if (!user)
      return res.status(401).json({ valid: false, message: 'User not found' })

    const match = await bcrypt.compare(password, user.password)
    if (!match)
      return res.status(401).json({ valid: false, message: 'Invalid password' })

    res.json({ valid: true, user: { id: user._id, username: user.username } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ valid: false, message: 'Server error' })
  }
})

// POST /users/create
usersRouter.post('/create', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res.status(400).json({ error: true, message: 'Missing fields' })

  try {
    const col      = User(req.app.locals.db)
    const existing = await col.findOne({ username })

    if (existing)
      return res.status(409).json({ error: true, message: 'Username already taken' })

    const hashedPassword = await bcrypt.hash(password, 10)
    await col.insertOne(User.create({ username, hashedPassword }))

    res.json({ success: true, message: 'Account created!' })
  } catch (err) {
    console.error('Create user error:', err)
    res.status(500).json({ error: true, message: 'Server error' })
  }
})

module.exports = usersRouter
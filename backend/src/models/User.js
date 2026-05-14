const COLLECTION = 'users'

/**
 * Returns the users collection from the db instance.
 * Usage: const col = User(req.app.locals.db)
 */
function User(db) {
  return db.collection(COLLECTION)
}

/**
 * Build a new user document ready for insertOne()
 * Password should already be hashed before calling this.
 */
User.create = function ({ username, hashedPassword }) {
  return {
    username,
    password: hashedPassword,
    createdAt: new Date(),
  }
}

module.exports = User
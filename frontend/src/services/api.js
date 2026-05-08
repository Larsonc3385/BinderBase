/**
 * API service for communicating with the backend
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ─── Core fetch helpers ────────────────────────────────────────────────────

/**
 * Fetch against /api/* (deck, card, recommendation routes)
 */
async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

/**
 * Fetch against /users/* (auth routes)
 */
async function userFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}/users${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'An error occurred')
    }

    return data
  } catch (error) {
    console.error('User API Error:', error)
    throw error
  }
}

// Export apiFetch for any one-off calls in components (e.g. login.vue)
export { apiFetch }

// ─── Deck operations (/api/decks) ─────────────────────────────────────────

export const deckAPI = {
  /** Get all decks */
  async getAll() {
    return apiFetch('/decks')
  },

  /** Get a single deck with all its cards */
  async getById(deckId) {
    return apiFetch(`/decks/${deckId}`)
  },

  /** Create a new deck */
  async create(deckData) {
    return apiFetch('/decks', {
      method: 'POST',
      body: JSON.stringify(deckData),
    })
  },

  /** Delete a deck */
  async delete(deckId) {
    return apiFetch(`/decks/${deckId}`, {
      method: 'DELETE',
    })
  },

  /** Set or update commander for a deck */
  async setCommander(deckId, commanderName) {
    return apiFetch(`/decks/${deckId}/commander`, {
      method: 'PUT',
      body: JSON.stringify({ commander: commanderName }),
    })
  },

  /** Add a card to a deck */
  async addCard(deckId, cardName, quantity = 1) {
    return apiFetch(`/decks/${deckId}/cards`, {
      method: 'POST',
      body: JSON.stringify({ cardName, quantity }),
    })
  },

  /** Update card quantity in deck */
  async updateCardQuantity(deckId, cardId, quantity) {
    return apiFetch(`/decks/${deckId}/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    })
  },

  /** Remove a card from deck */
  async removeCard(deckId, cardId) {
    return apiFetch(`/decks/${deckId}/cards/${cardId}`, {
      method: 'DELETE',
    })
  },
}

// ─── Card search operations (/api/cards) ──────────────────────────────────

export const cardAPI = {
  /** Search for cards */
  async search(query) {
    return apiFetch(`/cards/search?q=${encodeURIComponent(query)}`)
  },

  /** Get autocomplete suggestions */
  async autocomplete(query) {
    return apiFetch(`/cards/autocomplete?q=${encodeURIComponent(query)}`)
  },
}

// ─── EDHRec recommendations (/api/recommendations) ────────────────────────

export const recommendationsAPI = {
  /** Get recommendations for a commander */
  async getForCommander(commanderName) {
    return apiFetch(`/recommendations/commander/${encodeURIComponent(commanderName)}`)
  },
}

// ─── User / auth operations (/users) ──────────────────────────────────────

export const userAPI = {
  /** Log in with username + password */
  async login(username, password) {
    return userFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  /** Create a new account */
  async create(username, email, password) {
    return userFetch('/create', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
  },

  /** Fetch username by userId (used after Discord OAuth) */
  async fetchUsername(userId) {
    return userFetch('/fetchUsername', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  },
}
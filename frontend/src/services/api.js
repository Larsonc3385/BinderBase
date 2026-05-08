const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}/api${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'An error occurred')
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

async function userFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}/users${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || data.error || 'An error occurred')
    return data
  } catch (error) {
    console.error('User API Error:', error)
    throw error
  }
}

export { apiFetch }

function getUsername() {
  return localStorage.getItem('username') || null
}

function withUsername(url) {
  const username = getUsername()
  if (!username) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}username=${encodeURIComponent(username)}`
}

export const deckAPI = {
  async getAll() {
    return apiFetch(withUsername('/decks'))
  },

  async getById(deckId) {
    return apiFetch(withUsername(`/decks/${deckId}`))
  },

  async create(deckData) {
    return apiFetch('/decks', {
      method: 'POST',
      body: JSON.stringify({ ...deckData, username: getUsername() }),
    })
  },

  async delete(deckId) {
    return apiFetch(`/decks/${deckId}`, { method: 'DELETE' })
  },

  async setCommander(deckId, commanderName) {
    return apiFetch(`/decks/${deckId}/commander`, {
      method: 'PUT',
      body: JSON.stringify({ commander: commanderName }),
    })
  },

  async addCard(deckId, cardName, quantity = 1) {
    return apiFetch(`/decks/${deckId}/cards`, {
      method: 'POST',
      body: JSON.stringify({ cardName, quantity }),
    })
  },

  async updateCardQuantity(deckId, cardId, quantity) {
    return apiFetch(`/decks/${deckId}/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    })
  },

  async removeCard(deckId, cardId) {
    return apiFetch(`/decks/${deckId}/cards/${cardId}`, { method: 'DELETE' })
  },
}

export const cardAPI = {
  async search(query) {
    return apiFetch(`/cards/search?q=${encodeURIComponent(query)}`)
  },

  async autocomplete(query) {
    return apiFetch(`/cards/autocomplete?q=${encodeURIComponent(query)}`)
  },
}

export const recommendationsAPI = {
  async getForCommander(commanderName) {
    return apiFetch(`/recommendations/commander/${encodeURIComponent(commanderName)}`)
  },
}

export const userAPI = {
  async login(username, password) {
    return userFetch('/login', { method: 'POST', body: JSON.stringify({ username, password }) })
  },

  async create(username, password) {
    return userFetch('/create', { method: 'POST', body: JSON.stringify({ username, password }) })
  },

  async fetchUsername(userId) {
    return userFetch('/fetchUsername', { method: 'POST', body: JSON.stringify({ userId }) })
  },
}
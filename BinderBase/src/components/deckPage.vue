<script setup>
import { ref, computed, onMounted } from 'vue'
import { deckAPI, cardAPI } from '../services/api.js'

const searchQuery = ref('')
const selectedFormat = ref('Commander')
const formats = ['Commander']

const colors = ['W', 'B', 'U', 'R', 'G']
const selectedColors = ref([])

// Deck and card data
const currentDeck = ref(null)
const deck = ref([])
const searchResults = ref([])
const isSearching = ref(false)
const error = ref(null)
const successMessage = ref(null)

// Load the current deck on mount
onMounted(async () => {
  await loadDecks()
})

async function loadDecks() {
  try {
    const response = await deckAPI.getAll()
    if (response.success && response.decks.length > 0) {
      // Load the first deck by default
      await loadDeck(response.decks[0].id)
    }
  } catch (err) {
    error.value = 'Failed to load decks: ' + err.message
  }
}

async function loadDeck(deckId) {
  try {
    const response = await deckAPI.getById(deckId)
    if (response.success) {
      currentDeck.value = response.deck
      deck.value = response.deck.cards || []
    }
  } catch (err) {
    error.value = 'Failed to load deck: ' + err.message
  }
}

async function performSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  error.value = null

  try {
    const response = await cardAPI.search(searchQuery.value)
    if (response.success) {
      searchResults.value = response.cards
    }
  } catch (err) {
    error.value = 'Search failed: ' + err.message
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

function toggleColor(color) {
  if (selectedColors.value.includes(color)) {
    selectedColors.value = selectedColors.value.filter(c => c !== color)
  } else {
    selectedColors.value.push(color)
  }
}

const filteredCards = computed(() => {
  if (!selectedColors.value.length) {
    return searchResults.value
  }

  return searchResults.value.filter(card => {
    if (!card.colors || card.colors.length === 0) {
      return true // Colorless cards always match
    }
    return card.colors.some(color => selectedColors.value.includes(color))
  })
})

async function addToDeck(card) {
  if (!currentDeck.value) {
    error.value = 'Please create or select a deck first'
    return
  }

  try {
    const response = await deckAPI.addCard(currentDeck.value.id, card.name, 1)
    if (response.success) {
      // Reload the deck to get updated card list
      await loadDeck(currentDeck.value.id)
      successMessage.value = `Added ${card.name} to deck`
      setTimeout(() => successMessage.value = null, 3000)
    }
  } catch (err) {
    error.value = 'Failed to add card: ' + err.message
  }
}

async function updateQuantity(card, newQuantity) {
  try {
    await deckAPI.updateCardQuantity(currentDeck.value.id, card.id, newQuantity)
    await loadDeck(currentDeck.value.id)
  } catch (err) {
    error.value = 'Failed to update quantity: ' + err.message
  }
}

async function removeFromDeck(card) {
  try {
    await deckAPI.removeCard(currentDeck.value.id, card.id)
    await loadDeck(currentDeck.value.id)
    successMessage.value = `Removed ${card.card_name} from deck`
    setTimeout(() => successMessage.value = null, 3000)
  } catch (err) {
    error.value = 'Failed to remove card: ' + err.message
  }
}

async function clearDeck() {
  if (!confirm('Are you sure you want to remove all cards from this deck?')) {
    return
  }

  try {
    for (const card of deck.value) {
      await deckAPI.removeCard(currentDeck.value.id, card.id)
    }
    await loadDeck(currentDeck.value.id)
  } catch (err) {
    error.value = 'Failed to clear deck: ' + err.message
  }
}

const deckCount = computed(() => deck.value.reduce((sum, e) => sum + e.quantity, 0))
</script>

<template>
  <div class="site">
    <header class="header">
      <div class="brand">
        <div class="logo">BB</div>
        <div>
          <h1>BinderBase</h1>
          <p>Deck builder & card browser</p>
        </div>
      </div>

      <div class="header-actions">
        <button class="btn" @click="loadDecks">Refresh</button>
      </div>
    </header>

    <!-- Error/Success Messages -->
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

    <div class="main-grid">
      <aside class="sidebar">
        <div class="search">
          <input 
            v-model="searchQuery" 
            type="search" 
            placeholder="Search cards by name..."
            @keyup.enter="performSearch"
          />
          <button class="btn small" @click="performSearch" :disabled="isSearching">
            {{ isSearching ? 'Searching...' : 'Search' }}
          </button>
        </div>

        <div class="filter-row">
          <label>Format</label>
          <div class="chips">
            <button
              v-for="fmt in formats"
              :key="fmt"
              class="chip"
              :aria-pressed="selectedFormat === fmt"
              @click="selectedFormat = fmt"
            >
              {{ fmt }}
            </button>
          </div>
        </div>

        <div class="filter-row">
          <label>Colors</label>
          <div class="chips">
            <button
              v-for="color in colors"
              :key="color"
              class="chip"
              @click="toggleColor(color)"
              :aria-pressed="selectedColors.includes(color)"
            >
              {{ color }}
            </button>
          </div>
        </div>
      </aside>

      <main class="content">
        <div class="toolbar">
          <div class="row">
            <h3>Search Results</h3>
          </div>
          <div style="margin-left:auto;" class="small">
            Showing <strong>{{ filteredCards.length }}</strong> results
          </div>
        </div>

        <section class="card-grid">
          <div
            v-for="card in filteredCards"
            :key="card.scryfallId"
            class="mtg-card"
            role="button"
            tabindex="0"
            @click="addToDeck(card)"
            :title="'Add ' + card.name + ' to deck'"
          >
            <img 
              v-if="card.image" 
              class="mtg-thumb" 
              :src="card.image" 
              :alt="card.name + ' art'" 
            />
            <div v-else class="mtg-thumb placeholder">No Image</div>
            <div class="meta">
              <div>
                <h4>{{ card.name }}</h4>
                <p class="small">{{ card.type }}</p>
              </div>
              <div class="mana">
                <span class="symbol">{{ card.manaCost || '—' }}</span>
              </div>
            </div>
          </div>

          <div v-if="filteredCards.length === 0 && searchQuery" class="empty-state">
            <p>No cards found. Try a different search.</p>
          </div>

          <div v-if="filteredCards.length === 0 && !searchQuery" class="empty-state">
            <p>Search for cards to add to your deck</p>
          </div>
        </section>
      </main>

      <aside class="deck-panel">
        <div class="deck-title">
          <div>
            <h3>{{ currentDeck?.name || 'Current Deck' }}</h3>
            <div class="small deck-stats">{{ deckCount }} cards</div>
          </div>
          <div>
            <button class="btn small" @click="clearDeck">Clear</button>
          </div>
        </div>

        <div class="deck-list">
          <div class="deck-row" v-for="card in deck" :key="card.id">
            <div class="qty-controls">
              <button @click="updateQuantity(card, card.quantity - 1)" class="qty-btn">−</button>
              <div class="qty">{{ card.quantity }}</div>
              <button @click="updateQuantity(card, card.quantity + 1)" class="qty-btn">+</button>
            </div>
            <div class="name">{{ card.card_name }}</div>
            <button @click="removeFromDeck(card)" class="btn-remove" title="Remove card">×</button>
          </div>

          <div v-if="deck.length === 0" class="empty-state">
            <p>No cards in deck. Click cards from search results to add them.</p>
          </div>
        </div>
      </aside>
    </div>

    <footer class="footer">Built with love for MTG deck building.</footer>
  </div>
</template>

<style scoped>
.alert {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.alert-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--muted);
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--glass);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  line-height: 1;
}

.qty-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.btn-remove {
  background: transparent;
  border: 1px solid var(--glass);
  color: var(--danger);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.1);
}

.placeholder {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  font-size: 0.9rem;
}
</style>
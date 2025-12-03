<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { deckAPI, cardAPI, recommendationsAPI } from '../services/api.js'

const searchQuery = ref('')
const selectedFormat = ref('Commander')
const formats = ['Commander']

const colors = ['W', 'B', 'U', 'R', 'G']
const selectedColors = ref([])
const commanderColors = ref([])

// Deck and card data
const allDecks = ref([])
const currentDeck = ref(null)
const deck = ref([])
const searchResults = ref([])
const isSearching = ref(false)
const error = ref(null)
const successMessage = ref(null)
const showDeckSelector = ref(false)
const showNewDeckForm = ref(false)
const newDeckName = ref('')
const hoveredCard = ref(null)

// Commander
const showCommanderSelector = ref(false)
const commanderSearchQuery = ref('')
const commanderSearchResults = ref([])
const isSearchingCommander = ref(false)

// Recommendations
const showRecommendations = ref(false)
const recommendations = ref(null)
const isLoadingRecommendations = ref(false)
const recommendationType = ref('topCards')

// Load all decks on mount
onMounted(async () => {
  await loadDecks()
})

async function loadDecks() {
  try {
    const response = await deckAPI.getAll()
    if (response.success) {
      allDecks.value = response.decks
      if (response.decks.length > 0 && !currentDeck.value) {
        // Load the first deck by default
        await selectDeck(response.decks[0])
      }
    }
  } catch (err) {
    error.value = 'Failed to load decks: ' + err.message
  }
}

async function selectDeck(deckItem) {
  try {
    console.log('Selecting deck:', deckItem.name, 'ID:', deckItem.id)
    const response = await deckAPI.getById(deckItem.id)
    console.log('Deck response:', response)
    
    if (response.success) {
      currentDeck.value = response.deck
      deck.value = response.deck.cards || []
      console.log('Loaded deck with', deck.value.length, 'cards')
      
      // If deck has a commander, fetch its colors
      if (response.deck.commander) {
        try {
          const commanderData = await cardAPI.search(response.deck.commander)
          if (commanderData.success && commanderData.cards.length > 0) {
            commanderColors.value = commanderData.cards[0].colors || []
            selectedColors.value = [...commanderColors.value]
            console.log('Loaded commander colors:', commanderColors.value)
          }
        } catch (err) {
          console.error('Error loading commander colors:', err)
        }
      } else {
        // No commander, reset colors
        commanderColors.value = []
        selectedColors.value = []
      }
      
      showDeckSelector.value = false
      successMessage.value = `Loaded "${deckItem.name}"`
      setTimeout(() => successMessage.value = null, 2000)
    }
  } catch (err) {
    console.error('Error selecting deck:', err)
    error.value = 'Failed to load deck: ' + err.message
    setTimeout(() => error.value = null, 5000)
  }
}

async function createNewDeck() {
  if (!newDeckName.value.trim()) {
    error.value = 'Please enter a deck name'
    setTimeout(() => error.value = null, 3000)
    return
  }

  console.log('Creating new deck:', newDeckName.value)

  try {
    const response = await deckAPI.create({
      name: newDeckName.value,
      format: selectedFormat.value
    })
    
    console.log('Create deck response:', response)
    
    if (response.success) {
      await loadDecks()
      await selectDeck(response.deck)
      newDeckName.value = ''
      showNewDeckForm.value = false
      successMessage.value = 'Deck created successfully!'
      setTimeout(() => successMessage.value = null, 2000)
    }
  } catch (err) {
    console.error('Error creating deck:', err)
    error.value = 'Failed to create deck: ' + err.message
    setTimeout(() => error.value = null, 5000)
  }
}

async function deleteDeck(deckToDelete) {
  if (!confirm(`Are you sure you want to delete "${deckToDelete.name}"? This will remove all cards in the deck.`)) {
    return
  }

  try {
    await deckAPI.delete(deckToDelete.id)
    await loadDecks()
    
    if (currentDeck.value?.id === deckToDelete.id) {
      currentDeck.value = null
      deck.value = []
    }
    
    successMessage.value = 'Deck deleted'
    setTimeout(() => successMessage.value = null, 2000)
  } catch (err) {
    error.value = 'Failed to delete deck: ' + err.message
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
      
      // Debug: log the first few cards to see their color data
      console.log('Search results:', response.cards.slice(0, 3).map(c => ({
        name: c.name,
        colors: c.colors
      })))
      console.log('Commander colors:', commanderColors.value)
    }
  } catch (err) {
    error.value = 'Search failed: ' + err.message
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

function toggleColor(color) {
  // If there's a commander, only allow toggling commander colors
  if (commanderColors.value.length > 0) {
    if (!commanderColors.value.includes(color)) {
      error.value = `Cannot select ${color} - not in commander's color identity`
      setTimeout(() => error.value = null, 2000)
      return
    }
  }
  
  if (selectedColors.value.includes(color)) {
    selectedColors.value = selectedColors.value.filter(c => c !== color)
  } else {
    selectedColors.value.push(color)
  }
}

const filteredCards = computed(() => {
  console.log('Filtering - commanderColors:', commanderColors.value)
  console.log('Filtering - selectedColors:', selectedColors.value)
  console.log('Filtering - total search results:', searchResults.value.length)
  
  // If commander is set, filter by commander's color identity
  if (commanderColors.value.length > 0) {
    const filtered = searchResults.value.filter(card => {
      // Colorless cards are always legal
      if (!card.colors || card.colors.length === 0) {
        console.log(`Allowing colorless card: ${card.name}, colors:`, card.colors)
        return true
      }
      
      // Every color on the card must be in the commander's identity
      const isLegal = card.colors.every(color => commanderColors.value.includes(color))
      
      if (!isLegal) {
        console.log(`Filtering out ${card.name}: has colors ${JSON.stringify(card.colors)}, commander has ${JSON.stringify(commanderColors.value)}`)
      } else {
        console.log(`Allowing ${card.name}: has colors ${JSON.stringify(card.colors)}`)
      }
      
      return isLegal
    })
    
    console.log('Filtered to', filtered.length, 'cards')
    return filtered
  }
  
  // If no commander but colors are selected, filter by selected colors
  if (selectedColors.value.length > 0) {
    return searchResults.value.filter(card => {
      if (!card.colors || card.colors.length === 0) {
        return true // Colorless cards always match
      }
      
      // When manually filtering (no commander), show cards that have ANY of the selected colors
      // But also ensure the card doesn't have colors outside what's selected
      return card.colors.every(color => selectedColors.value.includes(color))
    })
  }
  
  // No filtering
  console.log('No filtering applied')
  return searchResults.value
})

async function addToDeck(card) {
  if (!currentDeck.value) {
    error.value = 'Please create or select a deck first'
    showDeckSelector.value = true
    setTimeout(() => error.value = null, 5000)
    return
  }

  console.log('Adding card:', card.name, 'to deck:', currentDeck.value.name)

  try {
    const response = await deckAPI.addCard(currentDeck.value.id, card.name, 1)
    console.log('Add card response:', response)
    
    if (response.success) {
      // Reload the deck to get updated card list
      const deckResponse = await deckAPI.getById(currentDeck.value.id)
      console.log('Reloaded deck:', deckResponse)
      
      if (deckResponse.success) {
        deck.value = deckResponse.deck.cards || []
        console.log('Updated deck list, now has', deck.value.length, 'cards')
      }
      successMessage.value = `Added ${card.name} to deck`
      setTimeout(() => successMessage.value = null, 3000)
    }
  } catch (err) {
    console.error('Error adding card:', err)
    error.value = 'Failed to add card: ' + err.message
    setTimeout(() => error.value = null, 5000)
  }
}

async function updateQuantity(card, newQuantity) {
  try {
    await deckAPI.updateCardQuantity(currentDeck.value.id, card.id, newQuantity)
    await selectDeck(currentDeck.value)
  } catch (err) {
    error.value = 'Failed to update quantity: ' + err.message
  }
}

async function removeFromDeck(card) {
  try {
    await deckAPI.removeCard(currentDeck.value.id, card.id)
    await selectDeck(currentDeck.value)
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
    await selectDeck(currentDeck.value)
  } catch (err) {
    error.value = 'Failed to clear deck: ' + err.message
  }
}

const deckCount = computed(() => deck.value.reduce((sum, e) => sum + e.quantity, 0))

// Commander functions
async function searchForCommander() {
  if (!commanderSearchQuery.value.trim()) {
    commanderSearchResults.value = []
    return
  }

  isSearchingCommander.value = true

  try {
    const response = await cardAPI.search(commanderSearchQuery.value + ' is:commander')
    if (response.success) {
      commanderSearchResults.value = response.cards.filter(card => 
        card.type.toLowerCase().includes('legendary') && 
        card.type.toLowerCase().includes('creature')
      )
    }
  } catch (err) {
    error.value = 'Failed to search commanders: ' + err.message
    setTimeout(() => error.value = null, 3000)
  } finally {
    isSearchingCommander.value = false
  }
}

async function setCommander(card) {
  if (!currentDeck.value) return

  try {
    // Use the API to update the commander
    const response = await deckAPI.setCommander(currentDeck.value.id, card.name)
    
    if (response.success) {
      // Update local state
      currentDeck.value.commander = card.name
      
      // Set the commander colors for filtering
      commanderColors.value = card.colors || []
      selectedColors.value = [...commanderColors.value]
      
      showCommanderSelector.value = false
      commanderSearchQuery.value = ''
      commanderSearchResults.value = []
      successMessage.value = `Set ${card.name} as commander`
      setTimeout(() => successMessage.value = null, 2000)
    }
  } catch (err) {
    error.value = 'Failed to set commander: ' + err.message
    setTimeout(() => error.value = null, 3000)
  }
}

async function removeCommander() {
  if (!currentDeck.value || !confirm('Remove commander from this deck?')) return

  try {
    // Use the API to remove the commander (set to null)
    const response = await deckAPI.setCommander(currentDeck.value.id, null)
    
    if (response.success) {
      currentDeck.value.commander = null
      commanderColors.value = []
      selectedColors.value = []
      successMessage.value = 'Commander removed'
      setTimeout(() => successMessage.value = null, 2000)
    }
  } catch (err) {
    error.value = 'Failed to remove commander: ' + err.message
    setTimeout(() => error.value = null, 3000)
  }
}

// Get recommendations based on current deck
async function loadRecommendations() {
  if (!currentDeck.value) {
    error.value = 'Please select a deck first'
    setTimeout(() => error.value = null, 3000)
    return
  }

  isLoadingRecommendations.value = true
  showRecommendations.value = true

  try {
    // Try to get commander-based recommendations if a commander is set
    if (currentDeck.value.commander) {
      const response = await recommendationsAPI.getForCommander(currentDeck.value.commander)
      if (response.success) {
        recommendations.value = response.recommendations
      }
    } else {
      // Fall back to color-based recommendations
      // Determine colors from deck cards
      const deckColors = new Set()
      deck.value.forEach(card => {
        // This is simplified - in a real app you'd get colors from card data
        // For now, just use selected colors or default to colorless
      })
      
      error.value = 'Set a commander for better recommendations'
      setTimeout(() => error.value = null, 5000)
    }
  } catch (err) {
    error.value = 'Failed to load recommendations: ' + err.message
    setTimeout(() => error.value = null, 5000)
  } finally {
    isLoadingRecommendations.value = false
  }
}

const currentRecommendations = computed(() => {
  if (!recommendations.value) return []
  return recommendations.value[recommendationType.value] || []
})

async function addRecommendedCard(cardName) {
  if (!currentDeck.value) return
  
  try {
    const response = await deckAPI.addCard(currentDeck.value.id, cardName, 1)
    if (response.success) {
      const deckResponse = await deckAPI.getById(currentDeck.value.id)
      if (deckResponse.success) {
        deck.value = deckResponse.deck.cards || []
      }
      successMessage.value = `Added ${cardName} to deck`
      setTimeout(() => successMessage.value = null, 2000)
    }
  } catch (err) {
    error.value = 'Failed to add card: ' + err.message
    setTimeout(() => error.value = null, 3000)
  }
}

// Store for card images we've fetched
const cardImageCache = ref({})
const hoveredRecommendation = ref(null)
const hoveredCommander = ref(null)

async function handleRecommendationHover(card) {
  hoveredRecommendation.value = { name: card.name, image: null }
  
  // Check if we already have this card's image cached
  if (cardImageCache.value[card.name]) {
    hoveredRecommendation.value.image = cardImageCache.value[card.name]
    return
  }
  
  // Fetch the card image from Scryfall
  try {
    const response = await cardAPI.search(card.name)
    if (response.success && response.cards.length > 0) {
      const cardImage = response.cards[0].image
      cardImageCache.value[card.name] = cardImage
      if (hoveredRecommendation.value?.name === card.name) {
        hoveredRecommendation.value.image = cardImage
      }
    }
  } catch (err) {
    console.error('Error fetching card image:', err)
  }
}

function handleRecommendationLeave() {
  hoveredRecommendation.value = null
}

async function handleCommanderHover(commanderName) {
  hoveredCommander.value = { name: commanderName, image: null }
  
  // Check if we already have this card's image cached
  if (cardImageCache.value[commanderName]) {
    hoveredCommander.value.image = cardImageCache.value[commanderName]
    return
  }
  
  // Fetch the card image from Scryfall
  try {
    const response = await cardAPI.search(commanderName)
    if (response.success && response.cards.length > 0) {
      const cardImage = response.cards[0].image
      cardImageCache.value[commanderName] = cardImage
      if (hoveredCommander.value?.name === commanderName) {
        hoveredCommander.value.image = cardImage
      }
    }
  } catch (err) {
    console.error('Error fetching commander image:', err)
  }
}

function handleCommanderLeave() {
  hoveredCommander.value = null
}
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
        <button class="btn ghost" @click="loadRecommendations" :disabled="isLoadingRecommendations">
          💡 {{ isLoadingRecommendations ? 'Loading...' : 'Suggestions' }}
        </button>
        <button class="btn ghost" @click="showDeckSelector = !showDeckSelector" style="min-width: 150px;">
          📚 {{ currentDeck ? currentDeck.name : 'Select Deck' }}
        </button>
        <button class="btn" @click="showNewDeckForm = true">+ New Deck</button>
      </div>
    </header>

    <!-- Deck Selector Modal -->
    <div class="modal-backdrop" :class="{ open: showDeckSelector }" @click.self="showDeckSelector = false">
      <div class="modal">
        <h2>Select a Deck</h2>
        <div class="deck-selector-list">
          <div 
            v-for="deckItem in allDecks" 
            :key="deckItem.id"
            class="deck-selector-item"
            :class="{ active: currentDeck?.id === deckItem.id }"
            @click="selectDeck(deckItem)"
          >
            <div class="deck-info">
              <h3>{{ deckItem.name }}</h3>
              <p class="small">{{ deckItem.format }}</p>
            </div>
            <button 
              @click.stop="deleteDeck(deckItem)" 
              class="btn-remove"
              title="Delete deck"
            >
              ×
            </button>
          </div>
          <div v-if="allDecks.length === 0" class="empty-state">
            <p>No decks yet. Create your first deck!</p>
          </div>
        </div>
        <button class="btn" @click="showDeckSelector = false">Close</button>
      </div>
    </div>

    <!-- New Deck Form Modal -->
    <div class="modal-backdrop" :class="{ open: showNewDeckForm }" @click.self="showNewDeckForm = false">
      <div class="modal">
        <h2>Create New Deck</h2>
        <div class="form-group">
          <label>Deck Name</label>
          <input 
            v-model="newDeckName" 
            type="text" 
            placeholder="Enter deck name..."
            @keyup.enter="createNewDeck"
            class="input"
          />
        </div>
        <div class="form-group">
          <label>Format</label>
          <select v-model="selectedFormat" class="input">
            <option>Commander</option>
            <option>Modern</option>
            <option>Standard</option>
            <option>Legacy</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn ghost" @click="showNewDeckForm = false">Cancel</button>
          <button class="btn" @click="createNewDeck">Create Deck</button>
        </div>
      </div>
    </div>

    <!-- Recommendations Modal -->
    <div class="modal-backdrop recommendations-modal" :class="{ open: showRecommendations }" @click.self="showRecommendations = false">
      <div class="modal modal-large">
        <div class="modal-header">
          <h2>💡 Card Suggestions</h2>
          <button class="btn-close" @click="showRecommendations = false">×</button>
        </div>
        
        <div v-if="recommendations" class="recommendations-content">
          <div class="recommendations-tabs">
            <button 
              v-for="tab in ['topCards', 'creatures', 'instants', 'sorceries', 'artifacts', 'enchantments', 'lands']" 
              :key="tab"
              class="tab-btn"
              :class="{ active: recommendationType === tab }"
              @click="recommendationType = tab"
            >
              {{ tab === 'topCards' ? 'Top Cards' : tab.charAt(0).toUpperCase() + tab.slice(1) }}
            </button>
          </div>

          <div class="recommendations-list">
            <div 
              v-for="card in currentRecommendations" 
              :key="card.name"
              class="recommendation-item"
              @click="addRecommendedCard(card.name)"
              @mouseenter="handleRecommendationHover(card)"
              @mouseleave="handleRecommendationLeave"
            >
              <div class="rec-info">
                <h4>{{ card.name }}</h4>
                <div class="rec-stats">
                  <span v-if="card.inclusion" class="stat-badge inclusion">
                    📊 {{ card.inclusion }}%
                  </span>
                  <span v-if="card.synergy" class="stat-badge synergy">
                    ⚡ {{ card.synergy }}%
                  </span>
                </div>
              </div>
              <button class="btn small">+ Add</button>
            </div>

            <div v-if="currentRecommendations.length === 0" class="empty-state">
              <p>No recommendations available for this category</p>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>Loading recommendations...</p>
        </div>
      </div>
    </div>

    <!-- Commander Selector Modal -->
    <div class="modal-backdrop" :class="{ open: showCommanderSelector }" @click.self="showCommanderSelector = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Choose Your Commander</h2>
          <button class="btn-close" @click="showCommanderSelector = false">×</button>
        </div>

        <div class="search">
          <input 
            v-model="commanderSearchQuery" 
            type="search" 
            placeholder="Search for a legendary creature..."
            @keyup.enter="searchForCommander"
          />
          <button class="btn small" @click="searchForCommander" :disabled="isSearchingCommander">
            {{ isSearchingCommander ? 'Searching...' : 'Search' }}
          </button>
        </div>

        <div class="commander-results">
          <div 
            v-for="card in commanderSearchResults" 
            :key="card.name"
            class="commander-result-item"
            @click="setCommander(card)"
          >
            <img v-if="card.image" :src="card.image" :alt="card.name" class="commander-img" />
            <div class="commander-info">
              <h4>{{ card.name }}</h4>
              <p class="small">{{ card.type }}</p>
            </div>
          </div>

          <div v-if="commanderSearchResults.length === 0 && commanderSearchQuery" class="empty-state">
            <p>No commanders found. Try a different search.</p>
          </div>

          <div v-if="commanderSearchResults.length === 0 && !commanderSearchQuery" class="empty-state">
            <p>Search for a legendary creature to set as your commander</p>
          </div>
        </div>
      </div>
    </div>

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
              :disabled="commanderColors.length > 0 && !commanderColors.includes(color)"
              :class="{ 
                'commander-color': commanderColors.includes(color),
                'disabled': commanderColors.length > 0 && !commanderColors.includes(color)
              }"
            >
              {{ color }}
            </button>
          </div>
          <p v-if="commanderColors.length > 0" class="color-hint">
            Only showing commander's color identity
          </p>
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
            <h3>{{ currentDeck?.name || 'No Deck Selected' }}</h3>
            <div class="small deck-stats">{{ deckCount }} cards ({{ deck.length }} unique)</div>
          </div>
          <div>
            <button class="btn small" @click="clearDeck" :disabled="!currentDeck">Clear</button>
          </div>
        </div>

        <!-- Commander Section -->
        <div v-if="currentDeck" class="commander-section">
          <div class="section-header">
            <h4>Commander</h4>
            <button class="btn small" @click="showCommanderSelector = true">
              {{ currentDeck.commander ? 'Change' : 'Set Commander' }}
            </button>
          </div>
          
          <div v-if="currentDeck.commander" class="commander-display">
            <div 
              class="commander-name"
              @mouseenter="handleCommanderHover(currentDeck.commander)"
              @mouseleave="handleCommanderLeave"
            >
              ⭐ {{ currentDeck.commander }}
            </div>
            <button @click="removeCommander" class="btn-remove" title="Remove commander">×</button>
          </div>
          
          <div v-else class="commander-placeholder">
            <p class="small">No commander set. Click "Set Commander" to choose one.</p>
          </div>
        </div>

        <!-- The 99 Section -->
        <div class="section-header">
          <h4>The 99</h4>
        </div>

        <div class="deck-list">
          <div class="deck-row" v-for="card in deck" :key="card.id">
            <div class="qty-controls">
              <button @click="updateQuantity(card, card.quantity - 1)" class="qty-btn">−</button>
              <div class="qty">{{ card.quantity }}</div>
              <button @click="updateQuantity(card, card.quantity + 1)" class="qty-btn">+</button>
            </div>
            <div 
              class="name card-hover" 
              @mouseenter="hoveredCard = card"
              @mouseleave="hoveredCard = null"
            >
              {{ card.card_name }}
            </div>
            <button @click="removeFromDeck(card)" class="btn-remove" title="Remove card">×</button>
          </div>

          <div v-if="deck.length === 0" class="empty-state">
            <p v-if="!currentDeck">Select or create a deck to get started.</p>
            <p v-else>No cards in deck. Click cards from search results to add them.</p>
          </div>
        </div>
      </aside>
    </div>

    <!-- Card Preview Tooltip -->
    <div 
      v-if="hoveredCard && hoveredCard.card_image" 
      class="card-preview"
      :style="{ 
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 10000
      }"
    >
      <img :src="hoveredCard.card_image" :alt="hoveredCard.card_name" />
    </div>

    <!-- Recommendation Card Preview Tooltip -->
    <div 
      v-if="hoveredRecommendation && hoveredRecommendation.image" 
      class="card-preview"
      :style="{ 
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 10001
      }"
    >
      <img :src="hoveredRecommendation.image" :alt="hoveredRecommendation.name" />
    </div>

    <!-- Commander Card Preview Tooltip -->
    <div 
      v-if="hoveredCommander && hoveredCommander.image" 
      class="card-preview"
      :style="{ 
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 10001
      }"
    >
      <img :src="hoveredCommander.image" :alt="hoveredCommander.name" />
    </div>

    <footer class="footer">Built with love for MTG deck building.</footer>
  </div>
</template>